/**
 * Axom Hub Website Enquiry Backend (Google Apps Script Web App)
 *
 * Script Properties required (Project Settings -> Script Properties):
 * - SPREADSHEET_ID: ID of the private Google Sheet receiving enquiries
 * - NOTIFICATION_EMAIL: Business inbox email address for enquiry alerts
 *
 * Deploy as Web App:
 * - Execute as: Me (owner)
 * - Who has access: Anyone (publicly reachable only via the Cloudflare Worker URL)
 */

var MAX_LENGTHS = {
  name: 120,
  businessName: 160,
  phone: 30,
  email: 254,
  serviceInterest: 100,
  budget: 100,
  description: 3000,
  source: 80,
  submissionId: 100,
  website: 200,
};

var SHEET_HEADERS = [
  'Timestamp',
  'Name',
  'Business Name',
  'Phone',
  'Email',
  'Service Interest',
  'Budget',
  'Description',
  'Source',
  'Submission ID',
];

function jsonResponse(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON
  );
}

function parseIncomingParams(e) {
  if (e && e.parameter && Object.keys(e.parameter).length > 0) {
    return e.parameter;
  }
  if (e && e.postData && e.postData.contents) {
    try {
      var parsed = JSON.parse(e.postData.contents);
      if (parsed && typeof parsed === 'object') {
        return parsed;
      }
    } catch (err) {
      return null;
    }
  }
  return null;
}

function cleanString(value, maxLen) {
  if (value === null || value === undefined) return '';
  var str = String(value).trim();
  if (maxLen && str.length > maxLen) {
    return str.slice(0, maxLen);
  }
  return str;
}

function hasExceedingLength(params) {
  var keys = Object.keys(MAX_LENGTHS);
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    if (params[key] !== undefined && params[key] !== null) {
      var raw = String(params[key]).trim();
      if (raw.length > MAX_LENGTHS[key]) {
        return key;
      }
    }
  }
  return null;
}

function validateEnquiry(params) {
  if (!params || typeof params !== 'object') {
    return {valid: false, code: 'invalid_payload', error: 'Missing enquiry payload.'};
  }

  var honeypot = cleanString(params.website || params._gotcha, MAX_LENGTHS.website);
  if (honeypot.length > 0) {
    return {valid: false, code: 'spam_detected', error: 'Submission rejected.'};
  }

  var tooLongField = hasExceedingLength(params);
  if (tooLongField) {
    return {
      valid: false,
      code: 'field_too_long',
      error: 'Field "' + tooLongField + '" exceeds maximum allowed length.',
    };
  }

  var name = cleanString(params.name, MAX_LENGTHS.name);
  var businessName = cleanString(params.businessName, MAX_LENGTHS.businessName);
  var phone = cleanString(params.phone, MAX_LENGTHS.phone);
  var email = cleanString(params.email, MAX_LENGTHS.email);
  var serviceInterest = cleanString(params.serviceInterest, MAX_LENGTHS.serviceInterest);
  var budget =
    cleanString(params.budget, MAX_LENGTHS.budget) || 'Request custom INR quotation';
  var description = cleanString(params.description, MAX_LENGTHS.description);
  var source = cleanString(params.source, MAX_LENGTHS.source) || 'axom-hub-contact-form';
  var submissionId = cleanString(params.submissionId, MAX_LENGTHS.submissionId);

  if (!name || !businessName || !phone || !email || !serviceInterest || !description) {
    return {valid: false, code: 'missing_fields', error: 'All required fields must be provided.'};
  }

  if (description.length < 15) {
    return {
      valid: false,
      code: 'description_too_short',
      error: 'Description must be at least 15 characters.',
    };
  }

  var phoneDigits = phone.replace(/\D/g, '');
  if (!/^[+\d\s()-]{7,30}$/.test(phone) || phoneDigits.length < 10 || phoneDigits.length > 15) {
    return {
      valid: false,
      code: 'invalid_phone',
      error: 'Phone number must contain 10 to 15 digits.',
    };
  }

  if (/[\r\n]/.test(email) || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]{2,}$/.test(email)) {
    return {valid: false, code: 'invalid_email', error: 'Invalid email address format.'};
  }

  if (!submissionId || !/^[A-Za-z0-9_-]{8,100}$/.test(submissionId)) {
    return {
      valid: false,
      code: 'invalid_submission_id',
      error: 'Valid submissionId is required.',
    };
  }

  return {
    valid: true,
    data: {
      name: name,
      businessName: businessName,
      phone: phone,
      email: email,
      serviceInterest: serviceInterest,
      budget: budget,
      description: description,
      source: source,
      submissionId: submissionId,
    },
  };
}

function formatIstTimestamp(date) {
  return Utilities.formatDate(date, 'Asia/Kolkata', 'yyyy-MM-dd HH:mm:ss') + ' IST';
}

function isDuplicateSubmissionId(sheet, submissionId) {
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return false;
  var startRow = Math.max(2, lastRow - 499);
  var numRows = lastRow - startRow + 1;
  var idValues = sheet.getRange(startRow, 10, numRows, 1).getValues();
  for (var i = 0; i < idValues.length; i++) {
    if (String(idValues[i][0]).trim() === submissionId) {
      return true;
    }
  }
  return false;
}

function saveEnquiryToSheet(spreadsheetId, data, timestampIst) {
  var lock = LockService.getScriptLock();
  lock.waitLock(15000);

  try {
    var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    var sheet = spreadsheet.getSheetByName('Enquiries') || spreadsheet.getSheets()[0];

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(SHEET_HEADERS);
    }

    if (isDuplicateSubmissionId(sheet, data.submissionId)) {
      return {saved: false, duplicate: true};
    }

    var nextRow = sheet.getLastRow() + 1;
    var rowValues = [
      timestampIst,
      data.name,
      data.businessName,
      data.phone,
      data.email,
      data.serviceInterest,
      data.budget,
      data.description,
      data.source,
      data.submissionId,
    ];

    var targetRange = sheet.getRange(nextRow, 1, 1, SHEET_HEADERS.length);
    // Force plain-text formatting so phone numbers (+91...) and user input never evaluate as formulas.
    targetRange.setNumberFormat('@');
    targetRange.setValues([rowValues]);

    return {saved: true, duplicate: false};
  } finally {
    lock.releaseLock();
  }
}

function sendNotificationEmail(notificationEmail, data, timestampIst) {
  var subject = 'New Axom Hub Enquiry — ' + data.businessName + ' (' + data.serviceInterest + ')';
  var body = [
    'A new website enquiry has been saved to Google Sheets.',
    '',
    'Timestamp (IST): ' + timestampIst,
    'Submission ID: ' + data.submissionId,
    'Source: ' + data.source,
    '',
    'Name: ' + data.name,
    'Business Name: ' + data.businessName,
    'Phone / WhatsApp: ' + data.phone,
    'Email: ' + data.email,
    'Service Interest: ' + data.serviceInterest,
    'Estimated INR Scope: ' + data.budget,
    '',
    'Business / Project Description:',
    data.description,
  ].join('\n');

  MailApp.sendEmail({
    to: notificationEmail,
    replyTo: data.email,
    subject: subject,
    body: body,
  });
}

function doPost(e) {
  var params = parseIncomingParams(e);
  var validation = validateEnquiry(params);

  if (!validation.valid) {
    return jsonResponse({
      ok: false,
      saved: false,
      emailSent: false,
      code: validation.code,
      error: validation.error,
    });
  }

  var props = PropertiesService.getScriptProperties();
  var spreadsheetId = cleanString(props.getProperty('SPREADSHEET_ID'), 200);
  var notificationEmail = cleanString(props.getProperty('NOTIFICATION_EMAIL'), 254);

  if (!spreadsheetId) {
    return jsonResponse({
      ok: false,
      saved: false,
      emailSent: false,
      code: 'server_misconfigured',
      error: 'Spreadsheet configuration is missing.',
    });
  }

  var data = validation.data;
  var timestampIst = formatIstTimestamp(new Date());

  var sheetResult;
  try {
    sheetResult = saveEnquiryToSheet(spreadsheetId, data, timestampIst);
  } catch (sheetErr) {
    return jsonResponse({
      ok: false,
      saved: false,
      emailSent: false,
      code: 'sheet_write_failed',
      error: 'Could not write enquiry to spreadsheet.',
    });
  }

  if (sheetResult.duplicate) {
    return jsonResponse({
      ok: false,
      saved: false,
      emailSent: false,
      duplicate: true,
      code: 'duplicate_submission',
      submissionId: data.submissionId,
      error: 'Duplicate submission ignored.',
    });
  }

  if (!notificationEmail || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]{2,}$/.test(notificationEmail)) {
    return jsonResponse({
      ok: true,
      saved: true,
      emailSent: false,
      code: 'saved_email_failed',
      submissionId: data.submissionId,
      message: 'Enquiry saved to Google Sheets, but email notification is not configured.',
    });
  }

  try {
    sendNotificationEmail(notificationEmail, data, timestampIst);
    return jsonResponse({
      ok: true,
      saved: true,
      emailSent: true,
      code: 'saved_and_notified',
      submissionId: data.submissionId,
      message: 'Enquiry saved and email notification sent.',
    });
  } catch (mailErr) {
    return jsonResponse({
      ok: true,
      saved: true,
      emailSent: false,
      code: 'saved_email_failed',
      submissionId: data.submissionId,
      message: 'Enquiry saved to Google Sheets, but email notification failed.',
    });
  }
}

function doGet() {
  return jsonResponse({
    ok: false,
    saved: false,
    emailSent: false,
    code: 'method_not_allowed',
    error: 'Use POST to submit enquiries.',
  });
}
