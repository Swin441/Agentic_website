const MAX_BODY_BYTES = 16 * 1024;
const DEFAULT_UPSTREAM_TIMEOUT_MS = 12000;
const SUBMISSION_TTL_MS = 10 * 60 * 1000;
const MAX_TRACKED_SUBMISSIONS = 1000;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 20;
const MAX_RATE_BUCKETS = 1000;

const MAX_LENGTHS = {
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

export function parseAllowedOrigins(rawAllowedOrigins) {
  const allowed = new Set();
  if (typeof rawAllowedOrigins !== 'string') return allowed;

  for (const part of rawAllowedOrigins.split(',')) {
    const trimmed = part.trim();
    if (!trimmed || trimmed === '*') continue;
    try {
      const parsed = new URL(trimmed);
      if (
        parsed.protocol === 'https:' ||
        (parsed.protocol === 'http:' &&
          (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1'))
      ) {
        allowed.add(parsed.origin);
      }
    } catch {
      // Ignore malformed entries
    }
  }
  return allowed;
}

export function validateAppsScriptUrl(rawUrl) {
  if (typeof rawUrl !== 'string' || !rawUrl.trim()) return '';
  try {
    const parsed = new URL(rawUrl.trim());
    if (parsed.protocol !== 'https:' || parsed.username || parsed.password) {
      return '';
    }
    const host = parsed.hostname.toLowerCase();
    if (host !== 'script.google.com' && host !== 'script.googleusercontent.com') {
      return '';
    }
    return parsed.toString();
  } catch {
    return '';
  }
}

function buildCorsHeaders(allowedOrigin) {
  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    Vary: 'Origin',
  };
  if (allowedOrigin) {
    headers['Access-Control-Allow-Origin'] = allowedOrigin;
    headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS';
    headers['Access-Control-Allow-Headers'] = 'Content-Type, Accept';
    headers['Access-Control-Max-Age'] = '86400';
  }
  return headers;
}

function jsonReply(status, body, allowedOrigin, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...buildCorsHeaders(allowedOrigin),
      ...extraHeaders,
    },
  });
}

function validateAndNormalizePayload(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return {valid: false, status: 400, code: 'invalid_payload', error: 'Invalid enquiry payload.'};
  }

  const honeypotRaw = body.website ?? body._gotcha ?? '';
  if (typeof honeypotRaw !== 'string') {
    return {valid: false, status: 400, code: 'invalid_payload', error: 'Invalid enquiry payload.'};
  }
  if (honeypotRaw.trim().length > 0) {
    return {valid: false, status: 400, code: 'spam_detected', error: 'Submission rejected.'};
  }

  const readField = (key) => {
    const val = body[key];
    if (val === undefined || val === null) return '';
    if (typeof val !== 'string') return null;
    return val.trim();
  };

  const fields = {
    name: readField('name'),
    businessName: readField('businessName'),
    phone: readField('phone'),
    email: readField('email'),
    serviceInterest: readField('serviceInterest'),
    budget: readField('budget'),
    description: readField('description'),
    source: readField('source'),
    submissionId: readField('submissionId'),
  };

  for (const [key, val] of Object.entries(fields)) {
    if (val === null) {
      return {
        valid: false,
        status: 400,
        code: 'invalid_field_type',
        error: `Field "${key}" must be text.`,
      };
    }
    if (val.length > MAX_LENGTHS[key]) {
      return {
        valid: false,
        status: 400,
        code: 'field_too_long',
        error: `Field "${key}" exceeds maximum allowed length.`,
      };
    }
  }

  if (
    !fields.name ||
    !fields.businessName ||
    !fields.phone ||
    !fields.email ||
    !fields.serviceInterest ||
    !fields.description
  ) {
    return {
      valid: false,
      status: 400,
      code: 'missing_fields',
      error: 'Please fill in all required enquiry fields.',
    };
  }

  if (fields.description.length < 15) {
    return {
      valid: false,
      status: 400,
      code: 'description_too_short',
      error: 'Project description must be at least 15 characters.',
    };
  }

  const phoneDigits = fields.phone.replace(/\D/g, '');
  if (
    !/^[+\d\s()-]{7,30}$/.test(fields.phone) ||
    phoneDigits.length < 10 ||
    phoneDigits.length > 15
  ) {
    return {
      valid: false,
      status: 400,
      code: 'invalid_phone',
      error: 'Enter a valid 10 to 15 digit phone or WhatsApp number.',
    };
  }

  if (/[\r\n]/.test(fields.email) || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]{2,}$/.test(fields.email)) {
    return {
      valid: false,
      status: 400,
      code: 'invalid_email',
      error: 'Please enter a valid email address.',
    };
  }

  if (!fields.submissionId || !/^[A-Za-z0-9_-]{8,100}$/.test(fields.submissionId)) {
    return {
      valid: false,
      status: 400,
      code: 'invalid_submission_id',
      error: 'Missing or invalid submission identifier.',
    };
  }

  return {
    valid: true,
    data: {
      name: fields.name,
      businessName: fields.businessName,
      phone: fields.phone,
      email: fields.email,
      serviceInterest: fields.serviceInterest,
      budget: fields.budget || 'Request custom INR quotation',
      description: fields.description,
      source: fields.source || 'axom-hub-contact-form',
      submissionId: fields.submissionId,
    },
  };
}

async function readBodyWithinLimit(request, maxBytes) {
  const contentLengthHeader = request.headers.get('content-length');
  if (contentLengthHeader) {
    const declaredLength = Number(contentLengthHeader);
    if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
      return {tooLarge: true, text: ''};
    }
  }

  if (!request.body) {
    return {tooLarge: false, text: ''};
  }

  const reader = request.body.getReader();
  const chunks = [];
  let totalBytes = 0;

  while (true) {
    const {done, value} = await reader.read();
    if (done) break;
    totalBytes += value.byteLength;
    if (totalBytes > maxBytes) {
      try {
        await reader.cancel();
      } catch {
        // Ignore cancellation errors
      }
      return {tooLarge: true, text: ''};
    }
    chunks.push(value);
  }

  const combined = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    combined.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return {tooLarge: false, text: new TextDecoder().decode(combined)};
}

export function createContactWorkerHandler(options = {}) {
  const fetchFn = options.fetchImpl ?? ((...args) => globalThis.fetch(...args));
  const nowFn = options.nowFn ?? (() => Date.now());
  const upstreamTimeoutMs = options.upstreamTimeoutMs ?? DEFAULT_UPSTREAM_TIMEOUT_MS;

  const completedSubmissions = new Map();
  const inFlightSubmissions = new Set();
  const rateBuckets = new Map();

  function pruneExpiredState(now) {
    for (const [id, expiresAt] of completedSubmissions.entries()) {
      if (expiresAt <= now) {
        completedSubmissions.delete(id);
      }
    }
    for (const [key, bucket] of rateBuckets.entries()) {
      if (bucket.resetAt <= now) {
        rateBuckets.delete(key);
      }
    }
  }

  function recordCompletedSubmission(submissionId, now) {
    if (completedSubmissions.size >= MAX_TRACKED_SUBMISSIONS) {
      const oldestKey = completedSubmissions.keys().next().value;
      if (oldestKey) completedSubmissions.delete(oldestKey);
    }
    completedSubmissions.set(submissionId, now + SUBMISSION_TTL_MS);
  }

  function isRateLimited(clientKey, now) {
    const existing = rateBuckets.get(clientKey);
    if (!existing || existing.resetAt <= now) {
      if (rateBuckets.size >= MAX_RATE_BUCKETS) {
        const oldestKey = rateBuckets.keys().next().value;
        if (oldestKey) rateBuckets.delete(oldestKey);
      }
      rateBuckets.set(clientKey, {count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS});
      return false;
    }
    if (existing.count >= RATE_LIMIT_MAX_REQUESTS) {
      return true;
    }
    existing.count += 1;
    return false;
  }

  return {
    async fetch(request, env = {}) {
      const now = nowFn();
      pruneExpiredState(now);

      const allowedOrigins = parseAllowedOrigins(env.ALLOWED_ORIGINS);
      const rawOrigin = request.headers.get('origin') || '';
      const matchedOrigin = rawOrigin && allowedOrigins.has(rawOrigin) ? rawOrigin : '';

      if (request.method === 'OPTIONS') {
        if (!matchedOrigin) {
          return jsonReply(403, {
            ok: false,
            saved: false,
            emailSent: false,
            code: 'origin_not_allowed',
            error: 'Origin not allowed.',
          });
        }
        return new Response(null, {
          status: 204,
          headers: buildCorsHeaders(matchedOrigin),
        });
      }

      if (!matchedOrigin) {
        return jsonReply(403, {
          ok: false,
          saved: false,
          emailSent: false,
          code: 'origin_not_allowed',
          error: 'Origin not allowed.',
        });
      }

      if (request.method !== 'POST') {
        return jsonReply(
          405,
          {
            ok: false,
            saved: false,
            emailSent: false,
            code: 'method_not_allowed',
            error: 'Method not allowed.',
          },
          matchedOrigin,
          {Allow: 'POST, OPTIONS'}
        );
      }

      const clientIp =
        request.headers.get('cf-connecting-ip') ||
        request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        matchedOrigin;
      if (isRateLimited(clientIp, now)) {
        return jsonReply(
          429,
          {
            ok: false,
            saved: false,
            emailSent: false,
            code: 'rate_limited',
            error: 'Too many requests. Please wait a moment and try again.',
          },
          matchedOrigin
        );
      }

      const contentType = (request.headers.get('content-type') || '').toLowerCase();
      if (!contentType.includes('application/json')) {
        return jsonReply(
          415,
          {
            ok: false,
            saved: false,
            emailSent: false,
            code: 'unsupported_media_type',
            error: 'Content-Type must be application/json.',
          },
          matchedOrigin
        );
      }

      const {tooLarge, text: rawBody} = await readBodyWithinLimit(request, MAX_BODY_BYTES);
      if (tooLarge) {
        return jsonReply(
          413,
          {
            ok: false,
            saved: false,
            emailSent: false,
            code: 'payload_too_large',
            error: 'Request payload exceeds maximum allowed size.',
          },
          matchedOrigin
        );
      }

      let parsedBody;
      try {
        parsedBody = JSON.parse(rawBody);
      } catch {
        return jsonReply(
          400,
          {
            ok: false,
            saved: false,
            emailSent: false,
            code: 'malformed_json',
            error: 'Malformed JSON body.',
          },
          matchedOrigin
        );
      }

      const validation = validateAndNormalizePayload(parsedBody);
      if (!validation.valid) {
        return jsonReply(
          validation.status,
          {
            ok: false,
            saved: false,
            emailSent: false,
            code: validation.code,
            error: validation.error,
          },
          matchedOrigin
        );
      }

      const data = validation.data;
      if (
        inFlightSubmissions.has(data.submissionId) ||
        (completedSubmissions.get(data.submissionId) ?? 0) > now
      ) {
        return jsonReply(
          409,
          {
            ok: false,
            saved: false,
            emailSent: false,
            duplicate: true,
            code: 'duplicate_submission',
            error: 'This enquiry was already submitted.',
          },
          matchedOrigin
        );
      }

      const appsScriptUrl = validateAppsScriptUrl(env.APPS_SCRIPT_URL);
      if (!appsScriptUrl) {
        return jsonReply(
          503,
          {
            ok: false,
            saved: false,
            emailSent: false,
            code: 'relay_not_configured',
            error: 'Enquiry relay is not configured.',
          },
          matchedOrigin
        );
      }

      inFlightSubmissions.add(data.submissionId);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), upstreamTimeoutMs);

      try {
        const formBody = new URLSearchParams({
          name: data.name,
          businessName: data.businessName,
          phone: data.phone,
          email: data.email,
          serviceInterest: data.serviceInterest,
          budget: data.budget,
          description: data.description,
          source: data.source,
          submissionId: data.submissionId,
          website: '',
        });

        const upstreamResponse = await fetchFn(appsScriptUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
            Accept: 'application/json',
          },
          body: formBody.toString(),
          redirect: 'follow',
          signal: controller.signal,
        });

        const upstreamText = await upstreamResponse.text();
        let upstreamJson;
        try {
          upstreamJson = JSON.parse(upstreamText);
        } catch {
          return jsonReply(
            502,
            {
              ok: false,
              saved: false,
              emailSent: false,
              code: 'upstream_invalid_response',
              error: 'Enquiry service returned an unexpected response.',
            },
            matchedOrigin
          );
        }

        if (!upstreamResponse.ok || !upstreamJson || typeof upstreamJson !== 'object') {
          return jsonReply(
            502,
            {
              ok: false,
              saved: false,
              emailSent: false,
              code: 'upstream_error',
              error: 'Enquiry service could not process your request.',
            },
            matchedOrigin
          );
        }

        if (upstreamJson.duplicate === true) {
          recordCompletedSubmission(data.submissionId, nowFn());
          return jsonReply(
            409,
            {
              ok: false,
              saved: false,
              emailSent: false,
              duplicate: true,
              code: 'duplicate_submission',
              error: 'This enquiry was already submitted.',
            },
            matchedOrigin
          );
        }

        if (upstreamJson.saved === true) {
          recordCompletedSubmission(data.submissionId, nowFn());
          const emailSent = upstreamJson.emailSent === true;
          return jsonReply(
            200,
            {
              ok: true,
              saved: true,
              emailSent,
              code: emailSent ? 'saved_and_notified' : 'saved_email_failed',
              submissionId: data.submissionId,
              message: emailSent
                ? 'Enquiry saved and notification sent.'
                : 'Enquiry saved to Google Sheets, but email notification failed.',
            },
            matchedOrigin
          );
        }

        const isClientValidationErr =
          upstreamJson.code === 'missing_fields' ||
          upstreamJson.code === 'invalid_email' ||
          upstreamJson.code === 'invalid_phone' ||
          upstreamJson.code === 'spam_detected' ||
          upstreamJson.code === 'description_too_short';

        return jsonReply(
          isClientValidationErr ? 400 : 502,
          {
            ok: false,
            saved: false,
            emailSent: false,
            code: isClientValidationErr ? upstreamJson.code : 'sheet_save_failed',
            error: isClientValidationErr
              ? 'Please check your enquiry details and try again.'
              : 'Unable to save your enquiry right now. Please retry.',
          },
          matchedOrigin
        );
      } catch (err) {
        const isTimeout = err && typeof err === 'object' && err.name === 'AbortError';
        return jsonReply(
          isTimeout ? 504 : 502,
          {
            ok: false,
            saved: false,
            emailSent: false,
            code: isTimeout ? 'upstream_timeout' : 'upstream_unavailable',
            error: isTimeout
              ? 'The enquiry service timed out before confirmation. Please retry.'
              : 'Could not reach the enquiry service. Please retry.',
          },
          matchedOrigin
        );
      } finally {
        clearTimeout(timeoutId);
        inFlightSubmissions.delete(data.submissionId);
      }
    },
  };
}

export default createContactWorkerHandler();
