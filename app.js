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
    failedBody: '可能由证书校验、CT、CORS、DNS 或网络问题导致。请查看浏览器证书错误，不要绕过警告。',
    developerTitle: 'Rust 开发者',
    developerBody: '更新 rustls-webpki 至 0.103.16（或适用的 0.104.0-alpha.8+），并将 webpki-roots / webpki-root-certs 更新至 1.0.10+，然后重新构建发布。',
    methodTitle: '检测原理',
    methodBody: '页面打开时会从当前浏览器连接 12 个公开测试地址，覆盖 6 个中间 CA 和两种签名路径。请求不携带凭据；测试服务可看到出口 IP 和请求元数据。本页不保存结果。连接成功表示收到响应；连接失败无法区分证书吊销、CT、CORS 或网络等原因，因此结果仅供排查，不能证明系统安全或证书状态。',
    sourcesLabel: '依据：', incidentLink: '事件说明与测试端点',
    footer: '结果仅供排查，不构成系统安全证明。',
    emsign: 'emSign 签名链', aaa: 'AAA 交叉签名', notTested: '未检测', waiting: '等待中', connecting: '连接中…',
    connected: status => `连接成功 · HTTP ${status} · 需排查`, timeout: '连接超时 · 原因待确认', failed: '未建立连接 · 原因待确认',
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
    failedBody: 'The cause may be certificate validation, CT, CORS, DNS, or a network issue. Check the browser’s certificate error and do not bypass warnings.',
    developerTitle: 'For Rust developers',
    developerBody: 'Update rustls-webpki to 0.103.16 (or 0.104.0-alpha.8+ where applicable) and webpki-roots / webpki-root-certs to 1.0.10+, then rebuild and redeploy.',
    methodTitle: 'How the test works',
    methodBody: 'When the page opens, the current browser connects to 12 public test endpoints covering six intermediate CAs and two signing paths. Requests include no credentials; the test service can see your public IP and request metadata. This page stores no results. A successful connection means a response was received. A failure cannot distinguish revocation from CT, CORS, or network errors, so results are for troubleshooting only and cannot prove system security or certificate status.',
    sourcesLabel: 'Sources: ', incidentLink: 'Incident details and test endpoints',
    footer: 'Results are for troubleshooting only and do not prove system security.',
    emsign: 'emSign chain', aaa: 'AAA cross-signed', notTested: 'Not checked', waiting: 'Waiting', connecting: 'Connecting…',
    connected: status => `Connected · HTTP ${status} · investigate`, timeout: 'Timed out · cause unknown', failed: 'Could not connect · cause unknown',
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
  cells.forEach((cell, index) => {
    const state = cell.dataset.state || 'notTested';
    const status = cell.dataset.status;
    cell.textContent = status ? t(state, Number(status)) : t(state);
  });
  summary.textContent = getSummaryText();
  context.textContent = getContextText();
}

function getSummaryText() {
  if (isRunning) return t('progress', Number(summary.dataset.done || 0));
  if (!hasCompleted) return t('starting');
  const connected = Number(summary.dataset.connected || 0);
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
  const result = document.createElement('td');
  result.dataset.state = 'notTested';
  row.append(name, path, result);
  tbody.append(row);
  cells.push(result);
}

function renderEndpointLabels() {
  tbody.querySelectorAll('a').forEach(link => {
    link.textContent = link.dataset.cross === 'true' ? t('aaa') : t('emsign');
  });
}

async function probe(endpoint) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch(`${endpoint.url}?check=${Date.now()}`, {
      mode: 'cors', credentials: 'omit', cache: 'no-store', redirect: 'error',
      referrerPolicy: 'no-referrer', signal: controller.signal
    });
    return {state: 'connected', status: response.status};
  } catch (error) {
    return {state: error.name === 'AbortError' ? 'timeout' : 'failed'};
  } finally {
    clearTimeout(timer);
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
      if (result.state === 'connected') {
        connected++;
        cell.dataset.state = 'connected';
        cell.dataset.status = String(result.status);
      } else {
        cell.dataset.state = result.state;
        delete cell.dataset.status;
      }
      cell.textContent = result.state === 'connected' ? t('connected', result.status) : t(result.state);
      cell.className = result.state === 'connected' ? 'risk' : 'unknown';
      summary.dataset.done = String(done);
      summary.dataset.connected = String(connected);
      summary.textContent = t('progress', done);
    }
  }

  await Promise.all([worker(), worker(), worker()]);
  isRunning = false;
  hasCompleted = true;
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
