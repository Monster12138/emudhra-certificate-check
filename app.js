'use strict';

const messages = {
  'zh-CN': {
    languageLabel: '语言', title: '你的浏览器，<br>还接受问题证书吗？',
    lead: '检查当前浏览器对相关测试证书链的连接行为。',
    scopeTitle: '仅反映当前浏览器与网络。',
    scopeBody: '本页不能读取系统吊销库，也不能检测 curl、Rust、Go 等应用。连接失败不等于证书已吊销。',
    privacy: '请求会访问外部测试服务，对方可见你的出口 IP 和请求元数据。本页不保存检测记录。',
    retry: '重新检测 12 条证书链', starting: '正在开始检测…', idle: '尚未检测', progress: n => `已完成 ${n} / 12 条`,
    contextIdle: '无需安装软件，也不会修改证书或信任设置。', caHeader: '中间 CA', pathHeader: '签名路径', resultHeader: '检测结果',
    interpretTitle: '结果说明', connectedTitle: '连接成功：建议排查',
    connectedBody: '连接成功只表示收到测试站响应。代理、VPN 或安全软件可能影响结果，不能据此认定浏览器信任了原始证书。',
    failedTitle: '连接失败：原因不确定',
    failedBody: '失败原因无法由网页自动确定。打开对应测试地址，填入浏览器的明确证书错误码，可手动确认并标记通过；不要绕过警告。',
    developerTitle: 'Rust 开发者',
    developerBody: '更新 rustls-webpki 至 0.103.16（或适用的 0.104.0-alpha.8+），并将 webpki-roots / webpki-root-certs 更新至 1.0.10+，然后重新构建发布。',
    methodTitle: '检测原理',
    methodBody: '页面连接 12 个公开测试地址，覆盖 6 个中间 CA 和两种签名路径。先读取跨域响应，失败后尝试无需 CORS 响应头的请求；超时、DNS、网络或浏览器策略失败仍无法自动区分。只有根据用户从对应测试地址复制的吊销或不受信任错误码，才标记“检测通过 · 手动确认”。信任拒绝不等于吊销，也不能证明因本次事件而封禁。代理可能改变证书链。请求不携带凭据，本页不保存结果。',
    sourcesLabel: '依据：', incidentLink: '事件说明与测试端点',
    footer: '结果仅供排查，不构成系统安全证明。',
    emsign: 'emSign 签名链', aaa: 'AAA 交叉签名', notTested: '未检测', waiting: '等待中', connecting: '连接中…',
    connected: status => status ? `连接成功 · HTTP ${status} · 需排查` : '收到响应 · 需排查', timeout: '连接超时 · 原因待确认', failed: '未建立连接 · 原因待确认',
    confirmTitle: '确认是否因证书被拒绝',
    confirmInfo: '打开本行测试地址，复制浏览器显示的确切错误码。只接受吊销或不受信任错误；Safari 的笼统安全警告不足以确认。',
    errorLabel: '浏览器证书错误码', confirmButton: '按错误码确认',
    unsupportedCode: '此错误码不足以确认吊销或信任拒绝。支持：ERR_CERT_REVOKED、SEC_ERROR_REVOKED_CERTIFICATE、ERR_CERT_AUTHORITY_INVALID、SEC_ERROR_UNKNOWN_ISSUER。',
    revokedConfirmed: '检测通过 · 手动确认吊销拒绝', trustConfirmed: '检测通过 · 手动确认信任拒绝',
    confirmedSummary: (passed, connected, unknown) => `${passed} 条手动确认通过 · ${connected} 条可连接 · ${unknown} 条待确认`,
    doneConnected: n => `发现 ${n} 条可连接路径，请排查`, doneNone: '12 条路径均未建立连接；不能据此确认已吊销',
    completedAt: date => `完成时间：${date}。结果仅适用于本次浏览器与网络环境。`
  },
  en: {
    languageLabel: 'Language', title: 'Does your browser<br>still accept the affected certificates?',
    lead: 'Check how this browser connects to the certificate test endpoints.',
    scopeTitle: 'Results apply only to this browser and network.',
    scopeBody: 'This page cannot read the system revocation store or test curl, Rust, Go, or other applications. A failed connection does not mean a certificate is revoked.',
    privacy: 'Requests go to an external test service, which can see your public IP address and request metadata. This page does not store results.',
    retry: 'Run the 12 checks again', starting: 'Starting checks…', idle: 'Not checked yet', progress: n => `${n} of 12 checks complete`,
    contextIdle: 'No software installation or changes to certificate or trust settings are required.', caHeader: 'Intermediate CA', pathHeader: 'Signing path', resultHeader: 'Result',
    interpretTitle: 'Results', connectedTitle: 'Connected: investigate',
    connectedBody: 'A successful connection only means a response was received. A proxy, VPN, or security software may affect the result; it does not prove the browser trusted the original certificate.',
    failedTitle: 'Failed: cause unknown',
    failedBody: 'A webpage cannot automatically identify the failure. Open the test URL and enter an explicit browser certificate error code to mark a manually confirmed pass. Do not bypass warnings.',
    developerTitle: 'For Rust developers',
    developerBody: 'Update rustls-webpki to 0.103.16 (or 0.104.0-alpha.8+ where applicable) and webpki-roots / webpki-root-certs to 1.0.10+, then rebuild and redeploy.',
    methodTitle: 'How the test works',
    methodBody: 'The page requests 12 public endpoints covering six intermediate CAs and two signing paths. If reading a cross-origin response fails, it retries without requiring CORS response headers. Timeouts, DNS, network errors and browser policies remain indistinguishable. A pass is marked only from a revocation or untrusted-issuer code the user copies from that test URL, and is labeled manually confirmed. Trust rejection is not proof of revocation or incident-specific blocking. Proxies may change the certificate chain. Requests include no credentials and this page stores no results.',
    sourcesLabel: 'Sources: ', incidentLink: 'Incident details and test endpoints',
    footer: 'Results are for troubleshooting only and do not prove system security.',
    emsign: 'emSign chain', aaa: 'AAA cross-signed', notTested: 'Not checked', waiting: 'Waiting', connecting: 'Connecting…',
    connected: status => status ? `Connected · HTTP ${status} · investigate` : 'Response received · investigate', timeout: 'Timed out · cause unknown', failed: 'Could not connect · cause unknown',
    confirmTitle: 'Confirm certificate rejection',
    confirmInfo: 'Open this row’s test URL and copy the exact browser error code. Only revocation or untrusted-issuer errors are accepted; a generic Safari security warning is insufficient.',
    errorLabel: 'Browser certificate error code', confirmButton: 'Confirm error code',
    unsupportedCode: 'This code does not confirm revocation or trust rejection. Supported: ERR_CERT_REVOKED, SEC_ERROR_REVOKED_CERTIFICATE, ERR_CERT_AUTHORITY_INVALID, SEC_ERROR_UNKNOWN_ISSUER.',
    revokedConfirmed: 'Passed · manually confirmed revocation rejection', trustConfirmed: 'Passed · manually confirmed trust rejection',
    confirmedSummary: (passed, connected, unknown) => `${passed} manually confirmed · ${connected} connected · ${unknown} unconfirmed`,
    doneConnected: n => `${n} path(s) connected; investigate these results`, doneNone: 'No connection on all 12 paths; this does not confirm revocation',
    completedAt: date => `Completed ${date}. Results apply only to this browser and network.`,
  }
};

const endpoints = [];
for (const kind of ['dv', 'ov', 'ev']) {
  for (const generation of ['g3b', 'g3c']) {
    for (const cross of [false, true]) {
      const host = `${kind}-${generation}${cross ? '-aaa' : ''}-emudhra.we-have-a-problem.com`;
      endpoints.push({kind, generation, cross, url: `https://${host}/`});
    }
  }
}

const tbody = document.querySelector('#results');
const button = document.querySelector('#start');
const languageSelect = document.querySelector('#language');
const summary = document.querySelector('#summary');
const context = document.querySelector('#context');
let currentLanguage = getInitialLanguage();
let isRunning = false;
let hasCompleted = false;
const cells = [];
const confirmations = [];

function getInitialLanguage() {
  try {
    const saved = localStorage.getItem('trust-check-language');
    if (saved && messages[saved]) return saved;
  } catch (_) {}
  return (navigator.languages || [navigator.language || 'en']).some(language => /^zh(?:-|$)/i.test(language)) ? 'zh-CN' : 'en';
}

function t(key, ...args) {
  const value = messages[currentLanguage][key];
  return typeof value === 'function' ? value(...args) : value;
}

function renderLanguage() {
  document.documentElement.lang = currentLanguage;
  languageSelect.value = currentLanguage;
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.dataset.i18n;
    if (messages[currentLanguage][key]) element.innerHTML = t(key);
  });
  button.disabled = isRunning;
  button.textContent = hasCompleted ? t('retry') : t('starting');
  cells.forEach(renderResult);
  confirmations.forEach(control => {
    control.input.setAttribute('aria-label', t('errorLabel'));
    if (control.feedback.textContent) control.feedback.textContent = t('unsupportedCode');
  });
  summary.textContent = getSummaryText();
  context.textContent = getContextText();
}

function getSummaryText() {
  if (isRunning) return t('progress', Number(summary.dataset.done || 0));
  if (!hasCompleted) return t('starting');
  const connected = Number(summary.dataset.connected || 0);
  const passed = cells.filter(cell => cell.dataset.errorCode).length;
  if (passed) return t('confirmedSummary', passed, connected, endpoints.length - connected - passed);
  return connected ? t('doneConnected', connected) : t('doneNone');
}

function getContextText() {
  if (!hasCompleted) return t('contextIdle');
  const date = context.dataset.completedAt;
  return t('completedAt', date);
}

for (const endpoint of endpoints) {
  const row = document.createElement('tr');
  const name = document.createElement('td');
  name.textContent = `EM ${endpoint.kind.toUpperCase()} TLS CA - ${endpoint.generation.toUpperCase()}`;
  const path = document.createElement('td');
  const link = document.createElement('a');
  link.href = endpoint.url;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.dataset.cross = endpoint.cross;
  path.append(link);
  const resultCell = document.createElement('td');
  const result = document.createElement('span');
  result.dataset.state = 'notTested';
  resultCell.append(result);
  const details = document.createElement('details');
  details.className = 'confirm';
  details.hidden = true;
  const title = document.createElement('summary');
  title.dataset.i18n = 'confirmTitle';
  const info = document.createElement('p');
  info.dataset.i18n = 'confirmInfo';
  const form = document.createElement('form');
  const input = document.createElement('input');
  input.type = 'text';
  input.required = true;
  input.maxLength = 100;
  input.spellcheck = false;
  input.autocomplete = 'off';
  input.placeholder = 'ERR_CERT_REVOKED';
  const submit = document.createElement('button');
  submit.type = 'submit';
  submit.dataset.i18n = 'confirmButton';
  const feedback = document.createElement('p');
  feedback.className = 'unknown';
  feedback.setAttribute('role', 'status');
  form.append(input, submit);
  details.append(title, info, form, feedback);
  resultCell.append(details);
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (isRunning || !['failed', 'timeout', 'revokedConfirmed', 'trustConfirmed'].includes(result.dataset.state)) return;
    const evidence = classifyCertificateError(input.value);
    if (!evidence) {
      result.dataset.state = result.dataset.transportState;
      delete result.dataset.errorCode;
      renderLanguage();
      feedback.textContent = t('unsupportedCode');
      return;
    }
    result.dataset.state = evidence.state;
    result.dataset.errorCode = evidence.code;
    feedback.textContent = '';
    details.open = false;
    renderLanguage();
  });
  row.append(name, path, resultCell);
  tbody.append(row);
  cells.push(result);
  confirmations.push({details, input, feedback});
}

function renderEndpointLabels() {
  tbody.querySelectorAll('a').forEach(link => {
    link.textContent = link.dataset.cross === 'true' ? t('aaa') : t('emsign');
  });
}

// A transport failure alone must never be classified as a certificate rejection.
function classifyCertificateError(value) {
  const code = value.trim().toUpperCase().replace(/^NET::/, '');
  if (['ERR_CERT_REVOKED', 'SEC_ERROR_REVOKED_CERTIFICATE'].includes(code)) {
    return {state: 'revokedConfirmed', code};
  }
  if (['ERR_CERT_AUTHORITY_INVALID', 'SEC_ERROR_UNKNOWN_ISSUER'].includes(code)) {
    return {state: 'trustConfirmed', code};
  }
  return null;
}

function renderResult(cell) {
  const state = cell.dataset.state || 'notTested';
  cell.textContent = t(state, cell.dataset.status ? Number(cell.dataset.status) : undefined);
  if (cell.dataset.errorCode) cell.textContent += ` · ${cell.dataset.errorCode}`;
  cell.className = cell.dataset.errorCode ? 'pass' : state === 'connected' ? 'risk' : ['failed', 'timeout'].includes(state) ? 'unknown' : '';
}

async function probe(endpoint) {
  // CORS mode preserves HTTP status when supported. The fallback can establish
  // reachability without exposing the response, but cannot diagnose TLS errors.
  for (const mode of ['cors', 'no-cors']) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);
    try {
      const response = await fetch(`${endpoint.url}?check=${Date.now()}`, {
        mode, credentials: 'omit', cache: 'no-store', redirect: 'error',
        referrerPolicy: 'no-referrer', signal: controller.signal
      });
      return {state: 'connected', status: response.type === 'opaque' ? null : response.status};
    } catch (error) {
      if (error.name === 'AbortError') return {state: 'timeout'};
      if (mode === 'no-cors') return {state: 'failed'};
    } finally {
      clearTimeout(timer);
    }
  }
}

async function runChecks() {
  if (isRunning) return;
  isRunning = true;
  hasCompleted = false;
  summary.dataset.done = '0';
  summary.dataset.connected = '0';
  cells.forEach(cell => {
    cell.dataset.state = 'waiting';
    delete cell.dataset.status;
    delete cell.dataset.errorCode;
  });
  confirmations.forEach(control => {
    control.details.hidden = true;
    control.details.open = false;
    control.input.value = '';
    control.feedback.textContent = '';
  });
  renderLanguage();

  let done = 0;
  let connected = 0;
  let next = 0;
  async function worker() {
    while (next < endpoints.length) {
      const index = next++;
      const cell = cells[index];
      cell.dataset.state = 'connecting';
      cell.textContent = t('connecting');
      const result = await probe(endpoints[index]);
      done++;
      cell.dataset.transportState = result.state;
      if (result.state === 'connected') {
        connected++;
        cell.dataset.state = 'connected';
        if (result.status) cell.dataset.status = String(result.status);
      } else {
        cell.dataset.state = result.state;
        delete cell.dataset.status;
      }
      renderResult(cell);
      summary.dataset.done = String(done);
      summary.dataset.connected = String(connected);
      summary.textContent = t('progress', done);
    }
  }

  await Promise.all([worker(), worker(), worker()]);
  isRunning = false;
  hasCompleted = true;
  confirmations.forEach((control, index) => {
    control.details.hidden = !['failed', 'timeout'].includes(cells[index].dataset.state);
  });
  context.dataset.completedAt = new Date().toLocaleString(currentLanguage);
  renderLanguage();
}

languageSelect.addEventListener('change', () => {
  currentLanguage = languageSelect.value;
  try { localStorage.setItem('trust-check-language', currentLanguage); } catch (_) {}
  renderLanguage();
  renderEndpointLabels();
});
button.addEventListener('click', runChecks);
renderLanguage();
renderEndpointLabels();
runChecks();
