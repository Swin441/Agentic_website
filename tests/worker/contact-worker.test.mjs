import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createContactWorkerHandler,
  parseAllowedOrigins,
  validateAppsScriptUrl,
} from '../../cloudflare/contact-worker/src/index.js';

const ALLOWED_ORIGIN = 'https://axom-hub-test.example';
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbTestDeploymentId123/exec';

const BASE_ENV = {
  ALLOWED_ORIGINS: `${ALLOWED_ORIGIN}, https://www.axom-hub-test.example`,
  APPS_SCRIPT_URL,
};

function makeValidPayload(overrides = {}) {
  return {
    name: 'Ananya Das',
    businessName: 'Dispur Diagnostics',
    phone: '+91 9864012345',
    email: 'ananya@dispurclinic.in',
    serviceInterest: 'WhatsApp Automation',
    budget: '₹50,000 – ₹1,50,000',
    description: 'Automate patient diagnostic report alerts and appointment confirmations.',
    source: 'axom-hub-contact-form',
    submissionId: 'sub_test_1234567890abcdef',
    website: '',
    ...overrides,
  };
}

function makeRequest(body, {method = 'POST', origin = ALLOWED_ORIGIN, contentType = 'application/json', extraHeaders = {}} = {}) {
  const headers = new Headers(extraHeaders);
  if (origin !== null) headers.set('Origin', origin);
  if (contentType !== null) headers.set('Content-Type', contentType);

  return new Request('https://relay.axom-hub-test.example/', {
    method,
    headers,
    body: method === 'GET' || method === 'OPTIONS' || method === 'HEAD' ? undefined : typeof body === 'string' ? body : JSON.stringify(body),
  });
}

test('parseAllowedOrigins and validateAppsScriptUrl reject wildcards and untrusted upstream hosts', () => {
  const origins = parseAllowedOrigins(`*, http://insecure.example, ${ALLOWED_ORIGIN}`);
  assert.equal(origins.size, 1);
  assert.equal(origins.has(ALLOWED_ORIGIN), true);
  assert.equal(origins.has('*'), false);

  assert.equal(validateAppsScriptUrl(APPS_SCRIPT_URL), APPS_SCRIPT_URL);
  assert.equal(validateAppsScriptUrl('http://script.google.com/macros/s/abc/exec'), '');
  assert.equal(validateAppsScriptUrl('https://evil.example/macros/s/abc/exec'), '');
  assert.equal(validateAppsScriptUrl(''), '');
});

test('handles CORS preflight for allowed origins and rejects disallowed or missing origins', async () => {
  const worker = createContactWorkerHandler();

  const okPreflight = await worker.fetch(
    makeRequest(null, {method: 'OPTIONS', origin: ALLOWED_ORIGIN, contentType: null}),
    BASE_ENV
  );
  assert.equal(okPreflight.status, 204);
  assert.equal(okPreflight.headers.get('Access-Control-Allow-Origin'), ALLOWED_ORIGIN);
  assert.notEqual(okPreflight.headers.get('Access-Control-Allow-Origin'), '*');
  assert.equal(okPreflight.headers.get('Vary'), 'Origin');

  const badOrigin = await worker.fetch(
    makeRequest(makeValidPayload(), {origin: 'https://untrusted.example'}),
    BASE_ENV
  );
  assert.equal(badOrigin.status, 403);
  assert.equal(badOrigin.headers.get('Access-Control-Allow-Origin'), null);

  const missingOrigin = await worker.fetch(
    makeRequest(makeValidPayload(), {origin: null}),
    BASE_ENV
  );
  assert.equal(missingOrigin.status, 403);
});

test('rejects unsupported HTTP methods and non-JSON content types', async () => {
  const worker = createContactWorkerHandler();

  const getRes = await worker.fetch(
    makeRequest(null, {method: 'GET', contentType: null}),
    BASE_ENV
  );
  assert.equal(getRes.status, 405);
  assert.equal(getRes.headers.get('Allow'), 'POST, OPTIONS');
  assert.equal(getRes.headers.get('Access-Control-Allow-Origin'), ALLOWED_ORIGIN);

  const textRes = await worker.fetch(
    makeRequest('plain text', {contentType: 'text/plain'}),
    BASE_ENV
  );
  assert.equal(textRes.status, 415);
});

test('enforces maximum request body size limit (16 KB)', async () => {
  let upstreamCalled = false;
  const worker = createContactWorkerHandler({
    fetchImpl: async () => {
      upstreamCalled = true;
      return new Response('{}');
    },
  });

  const oversized = JSON.stringify(makeValidPayload({description: 'x'.repeat(20000)}));
  const res = await worker.fetch(makeRequest(oversized), BASE_ENV);
  const body = await res.json();

  assert.equal(res.status, 413);
  assert.equal(body.code, 'payload_too_large');
  assert.equal(body.saved, false);
  assert.equal(upstreamCalled, false);
});

test('rejects honeypot and invalid input without calling Google Apps Script', async () => {
  let upstreamCalls = 0;
  const worker = createContactWorkerHandler({
    fetchImpl: async () => {
      upstreamCalls++;
      return new Response('{}');
    },
  });

  const botRes = await worker.fetch(
    makeRequest(makeValidPayload({website: 'https://spam.invalid'})),
    BASE_ENV
  );
  assert.equal(botRes.status, 400);
  assert.equal((await botRes.json()).code, 'spam_detected');

  const badEmailRes = await worker.fetch(
    makeRequest(makeValidPayload({email: 'not-an-email'})),
    BASE_ENV
  );
  assert.equal(badEmailRes.status, 400);
  assert.equal((await badEmailRes.json()).code, 'invalid_email');

  const badPhoneRes = await worker.fetch(
    makeRequest(makeValidPayload({phone: '12345'})),
    BASE_ENV
  );
  assert.equal(badPhoneRes.status, 400);
  assert.equal((await badPhoneRes.json()).code, 'invalid_phone');

  const badSubIdRes = await worker.fetch(
    makeRequest(makeValidPayload({submissionId: 'bad id'})),
    BASE_ENV
  );
  assert.equal(badSubIdRes.status, 400);
  assert.equal((await badSubIdRes.json()).code, 'invalid_submission_id');

  assert.equal(upstreamCalls, 0);
});

test('forwards URL-encoded payload, follows redirect behavior, and confirms Sheets save + email sent', async () => {
  let capturedUrl = '';
  let capturedInit = null;

  const worker = createContactWorkerHandler({
    fetchImpl: async (url, init) => {
      capturedUrl = url;
      capturedInit = init;
      return new Response(
        JSON.stringify({
          ok: true,
          saved: true,
          emailSent: true,
          code: 'saved_and_notified',
          submissionId: 'sub_test_1234567890abcdef',
        }),
        {status: 200, headers: {'Content-Type': 'application/json'}}
      );
    },
  });

  const payload = makeValidPayload();
  const res = await worker.fetch(makeRequest(payload), BASE_ENV);
  const json = await res.json();

  assert.equal(res.status, 200);
  assert.equal(res.headers.get('Access-Control-Allow-Origin'), ALLOWED_ORIGIN);
  assert.deepEqual(json, {
    ok: true,
    saved: true,
    emailSent: true,
    code: 'saved_and_notified',
    submissionId: payload.submissionId,
    message: 'Enquiry saved and notification sent.',
  });

  assert.equal(capturedUrl, APPS_SCRIPT_URL);
  assert.equal(capturedInit.method, 'POST');
  assert.equal(capturedInit.redirect, 'follow');
  assert.equal(
    capturedInit.headers['Content-Type'],
    'application/x-www-form-urlencoded;charset=UTF-8'
  );
  const forwarded = new URLSearchParams(capturedInit.body);
  assert.equal(forwarded.get('name'), payload.name);
  assert.equal(forwarded.get('businessName'), payload.businessName);
  assert.equal(forwarded.get('phone'), payload.phone);
  assert.equal(forwarded.get('email'), payload.email);
  assert.equal(forwarded.get('serviceInterest'), payload.serviceInterest);
  assert.equal(forwarded.get('budget'), payload.budget);
  assert.equal(forwarded.get('description'), payload.description);
  assert.equal(forwarded.get('source'), payload.source);
  assert.equal(forwarded.get('submissionId'), payload.submissionId);
});

test('distinguishes Google Sheets save success when email notification fails', async () => {
  const worker = createContactWorkerHandler({
    fetchImpl: async () =>
      new Response(
        JSON.stringify({
          ok: true,
          saved: true,
          emailSent: false,
          code: 'saved_email_failed',
        }),
        {status: 200, headers: {'Content-Type': 'application/json'}}
      ),
  });

  const res = await worker.fetch(makeRequest(makeValidPayload()), BASE_ENV);
  const json = await res.json();

  assert.equal(res.status, 200);
  assert.equal(json.ok, true);
  assert.equal(json.saved, true);
  assert.equal(json.emailSent, false);
  assert.equal(json.code, 'saved_email_failed');
});

test('reports spreadsheet write failure accurately without marking submission as duplicate', async () => {
  let attempt = 0;
  const worker = createContactWorkerHandler({
    fetchImpl: async () => {
      attempt++;
      if (attempt === 1) {
        return new Response(
          JSON.stringify({
            ok: false,
            saved: false,
            emailSent: false,
            code: 'sheet_write_failed',
            error: 'SpreadsheetApp write error',
          }),
          {status: 200, headers: {'Content-Type': 'application/json'}}
        );
      }
      return new Response(
        JSON.stringify({
          ok: true,
          saved: true,
          emailSent: true,
          code: 'saved_and_notified',
        }),
        {status: 200, headers: {'Content-Type': 'application/json'}}
      );
    },
  });

  const payload = makeValidPayload({submissionId: 'sub_retry_after_sheet_fail'});
  const failRes = await worker.fetch(makeRequest(payload), BASE_ENV);
  const failJson = await failRes.json();

  assert.equal(failRes.status, 502);
  assert.equal(failJson.ok, false);
  assert.equal(failJson.saved, false);
  assert.equal(failJson.code, 'sheet_save_failed');

  // Same submissionId can be retried after a failed save
  const retryRes = await worker.fetch(makeRequest(payload), BASE_ENV);
  const retryJson = await retryRes.json();
  assert.equal(retryRes.status, 200);
  assert.equal(retryJson.saved, true);
});

test('blocks duplicate submissionId after successful save and concurrent in-flight duplicates', async () => {
  let releaseFirst;
  let callCount = 0;
  const worker = createContactWorkerHandler({
    fetchImpl: async () => {
      callCount++;
      await new Promise((resolve) => {
        releaseFirst = resolve;
      });
      return new Response(
        JSON.stringify({ok: true, saved: true, emailSent: true}),
        {status: 200, headers: {'Content-Type': 'application/json'}}
      );
    },
  });

  const payload = makeValidPayload({submissionId: 'sub_duplicate_guard_01'});
  const firstPromise = worker.fetch(makeRequest(payload), BASE_ENV);

  // Concurrent duplicate while first is still in flight
  const concurrentRes = await worker.fetch(makeRequest(payload), BASE_ENV);
  assert.equal(concurrentRes.status, 409);
  assert.equal((await concurrentRes.json()).code, 'duplicate_submission');

  releaseFirst();
  const firstRes = await firstPromise;
  assert.equal(firstRes.status, 200);

  // Sequential duplicate after save succeeded
  const repeatRes = await worker.fetch(makeRequest(payload), BASE_ENV);
  assert.equal(repeatRes.status, 409);
  assert.equal((await repeatRes.json()).code, 'duplicate_submission');
  assert.equal(callCount, 1);
});

test('handles upstream timeout, HTML/invalid upstream response, network failure, and logs zero PII', async () => {
  const loggedMessages = [];
  const origLog = console.log;
  const origErr = console.error;
  const origWarn = console.warn;
  console.log = (...args) => loggedMessages.push(args.join(' '));
  console.error = (...args) => loggedMessages.push(args.join(' '));
  console.warn = (...args) => loggedMessages.push(args.join(' '));

  try {
    // 1. Upstream timeout
    const timeoutWorker = createContactWorkerHandler({
      upstreamTimeoutMs: 25,
      fetchImpl: (_url, init) =>
        new Promise((_resolve, reject) => {
          init.signal.addEventListener('abort', () => {
            const err = new Error('The operation was aborted');
            err.name = 'AbortError';
            reject(err);
          });
        }),
    });

    const timeoutRes = await timeoutWorker.fetch(makeRequest(makeValidPayload()), BASE_ENV);
    const timeoutJson = await timeoutRes.json();
    assert.equal(timeoutRes.status, 504);
    assert.equal(timeoutJson.code, 'upstream_timeout');
    assert.equal(timeoutJson.saved, false);

    // 2. Upstream returns Google HTML login page instead of JSON (must not leak HTML)
    const htmlWorker = createContactWorkerHandler({
      fetchImpl: async () =>
        new Response('<html><body>Sign in with Google secret internal info</body></html>', {
          status: 200,
          headers: {'Content-Type': 'text/html'},
        }),
    });
    const htmlRes = await htmlWorker.fetch(makeRequest(makeValidPayload()), BASE_ENV);
    const htmlJson = await htmlRes.json();
    assert.equal(htmlRes.status, 502);
    assert.equal(htmlJson.code, 'upstream_invalid_response');
    assert.equal(JSON.stringify(htmlJson).includes('Sign in'), false);

    // 3. Upstream network exception (must not leak internal error message)
    const downWorker = createContactWorkerHandler({
      fetchImpl: async () => {
        throw new Error('ECONNREFUSED script.google.com secret');
      },
    });
    const downRes = await downWorker.fetch(makeRequest(makeValidPayload()), BASE_ENV);
    const downJson = await downRes.json();
    assert.equal(downRes.status, 502);
    assert.equal(downJson.code, 'upstream_unavailable');
    assert.equal(JSON.stringify(downJson).includes('ECONNREFUSED'), false);

    assert.equal(loggedMessages.length, 0);
  } finally {
    console.log = origLog;
    console.error = origErr;
    console.warn = origWarn;
  }
});
