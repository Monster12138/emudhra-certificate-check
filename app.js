'use strict';

const messages = {
  'zh-CN': {
    languageLabel: '语言', title: '你的浏览器，<br>还接受问题证书吗？',
    lead: '向使用受损中间 CA 证书链的测试站发起请求，观察当前浏览器的连接行为。覆盖 6 个 TLS 中间 CA，以及 emSign / AAA 两类签名路径。',
    scopeTitle: '检测范围：当前浏览器与当前网络。',
    scopeBody: '打开页面后会自动向 12 个测试地址发起检测请求。网页无法读取系统吊销库，也无法检测 curl、Rust、Go 或其他应用。连接失败也不能证明证书已被吊销：CT 校验、断网、DNS、代理和浏览器策略都可能阻止请求。',
    privacy: '检测会向 emudhra.we-have-a-problem.com 的 12 个测试子域发送无凭据请求。第三方可见你的出口 IP 和请求元数据，并可能统计成功连接。本页不保存检测记录，不加载统计脚本。',
    retry: '重新检测 12 条证书链', starting: '正在开始检测…', idle: '尚未检测', progress: n => `已完成 ${n} / 12 条`,
    contextIdle: '无需安装软件，也不会修改证书或信任设置。', caHeader: '中间 CA', pathHeader: '签名路径', resultHeader: '检测结果',
    interpretTitle: '如何理解结果', connectedTitle: '连接成功：需要排查',
    connectedBody: '说明当前连接路径允许取得该测试站的响应，应更新浏览器并检查 HTTPS 代理或证书校验设置。若经过企业 TLS 代理、VPN 或安全软件，响应可能由代理验证或替换，不能据此直接认定浏览器信任了原始受损证书。',
    failedTitle: '连接失败或超时：无法单独确认原因',
    failedBody: '网页 JavaScript 通常无法区分证书吊销、CT 拒绝、CORS、DNS 和网络错误。因此本页不会将失败显示为“安全”或“已吊销”。可直接打开测试地址，查看浏览器提供的具体证书错误；不要绕过警告。',
    developerTitle: '开发者还需要做什么',
    developerBody: '浏览器的检测结果不能代替程序自身的验证。rustls 项目请检查 rustls-webpki 修复版本（0.103.16，或 0.104.0-alpha.8 及后续适用版本），并更新使用中的 webpki-roots / webpki-root-certs 至 1.0.10 或更新版本。更新后重新构建并发布。',
    sourcesLabel: '依据：', incidentLink: '事件说明与测试端点',
    footer: '本工具仅测试 TLS 路径，不检测另外两个代码签名 CA。结果是一次连接观察，不是系统安全证明。',
    emsign: 'emSign 签名链', aaa: 'AAA 交叉签名', notTested: '未检测', waiting: '等待中', connecting: '连接中…',
    connected: status => `连接成功 · HTTP ${status} · 需排查`, timeout: '连接超时 · 原因待确认', failed: '未建立连接 · 原因待确认',
    doneConnected: n => `发现 ${n} 条可连接路径，请排查`, doneNone: '12 条路径均未建立连接；不能据此确认已吊销',
    completedAt: date => `完成时间：${date}。结果仅适用于本次浏览器与网络环境。`
  },
  en: {
    languageLabel: 'Language', title: 'Does your browser<br>still accept the affected certificates?',
    lead: 'This page requests test sites using affected intermediate CA chains and observes how your current browser connects. It covers six TLS intermediate CAs and both emSign and AAA signing paths.',
    scopeTitle: 'Scope: this browser and this network.',
    scopeBody: 'Testing starts automatically when the page opens and sends requests to 12 test addresses. A webpage cannot read the system revocation store or test curl, Rust, Go, or other applications. A failed connection does not prove revocation: CT checks, connectivity, DNS, proxies, and browser policies can also block a request.',
    privacy: 'The test sends unauthenticated requests to 12 subdomains of emudhra.we-have-a-problem.com. The third party can see your public IP address and request metadata, and may count successful connections. This page does not store results or load analytics.',
    retry: 'Run the 12 checks again', starting: 'Starting checks…', idle: 'Not checked yet', progress: n => `${n} of 12 checks complete`,
    contextIdle: 'No software installation or changes to certificate or trust settings are required.', caHeader: 'Intermediate CA', pathHeader: 'Signing path', resultHeader: 'Result',
    interpretTitle: 'How to interpret the results', connectedTitle: 'Connection succeeded: investigate',
    connectedBody: 'The current connection path received a response from the test site. Update your browser and check HTTPS proxy or certificate validation settings. A corporate TLS proxy, VPN, or security software may have validated or replaced the response, so this alone does not prove that the browser trusted the original affected certificate.',
    failedTitle: 'Connection failed or timed out: cause unknown',
    failedBody: 'Browser JavaScript generally cannot distinguish certificate revocation from CT rejection, CORS, DNS, or network errors. This page therefore does not label a failure as “safe” or “revoked.” You can open a test address directly to inspect the browser’s certificate error. Do not bypass warnings.',
    developerTitle: 'For developers',
    developerBody: 'Browser results do not replace validation by your application. For rustls projects, check for a fixed rustls-webpki version (0.103.16, or 0.104.0-alpha.8 and later applicable releases) and update webpki-roots / webpki-root-certs to 1.0.10 or later. Rebuild and redeploy after updating.',
    sourcesLabel: 'Sources: ', incidentLink: 'Incident details and test endpoints',
    footer: 'This tool tests TLS paths only; it does not test the other two code-signing CAs. Each result is a single connection observation, not proof of system security.',
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
