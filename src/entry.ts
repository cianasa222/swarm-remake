import './style.css';
import './home.css';

const home = document.getElementById('login-home')!;
const guest = document.getElementById('home-guest') as HTMLButtonElement;
const status = document.getElementById('home-status')!;
const emailButton = document.getElementById('home-email') as HTMLButtonElement;
const form = document.getElementById('home-login-form') as HTMLFormElement;
const submit = document.getElementById('home-submit') as HTMLButtonElement;
const account = document.getElementById('home-account')!;
const password = document.getElementById('login-password') as HTMLInputElement;
let entering = false;
let accountId: string | null = null;

async function auth(action: string, body?: Record<string, string>) {
  const response = await fetch(`/api/swarm/auth/${action}`, { method: body ? 'POST' : 'GET', credentials: 'same-origin', cache: 'no-store', headers: body ? {'Content-Type':'application/json'} : undefined, body: body ? JSON.stringify(body) : undefined });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'unavailable');
  return result;
}
function showAccount(id: string | null) {
  accountId = id;
  account.hidden = !id;
  emailButton.hidden = !!id;
  if (id) form.hidden = true;
}
emailButton.addEventListener('click', () => {
  if (location.origin !== 'https://swarm.cianasa888.cfd') {
    status.textContent = '请在正式域名 swarm.cianasa888.cfd 使用邮箱登录；本地址支持游客。';
    return;
  }
  form.hidden = !form.hidden; if (!form.hidden) document.getElementById('login-email')?.focus();
});
form.addEventListener('submit', async e => {
  e.preventDefault();
  submit.disabled = true;
  guest.disabled = true;
  status.textContent = '正在验证账号…';
  try {
    const email = (document.getElementById('login-email') as HTMLInputElement).value.trim();
    const result = await auth('login', { email, password: password.value });
    if (typeof result.accountId !== 'string' || !result.accountId) throw new Error('unavailable');
    showAccount(result.accountId);
    await enter(true);
  } catch (error) {
    const code = error instanceof Error ? error.message : '';
    status.textContent = code === 'invalid_credentials' ? '邮箱或密码不正确。' : code === 'rate_limit' ? '尝试过于频繁，请稍后再试。' : '账号服务暂不可用，请稍后重试或以游客进入。';
  } finally { password.value = ''; submit.disabled = false; if (!entering) guest.disabled = false; }
});
document.getElementById('home-continue')!.addEventListener('click', () => { if (accountId) void enter(true); });
document.getElementById('home-logout')!.addEventListener('click', async () => {
  try { await auth('logout', {}); showAccount(null); status.textContent = '已退出账号。'; }
  catch { status.textContent = '退出失败，请重试。'; }
});
if (location.origin === 'https://swarm.cianasa888.cfd') void auth('session').then(r => { if (!entering && typeof r.accountId === 'string') showAccount(r.accountId); }).catch(() => { /* guest path remains available */ });

async function enter(signedIn = false) {
  if (entering) return;
  entering = true;
  guest.disabled = true;
  status.textContent = '正在进入任务准备区…';
  password.value = '';
  try {
    await import('./main');
    document.documentElement.dataset.playerMode = signedIn ? 'account' : 'guest';
    document.getElementById('screen-start')!.classList.remove('hidden');
    home.classList.add('home-leave');
    window.setTimeout(() => { home.hidden = true; }, 300);
  } catch (error) {
    console.error('Game startup failed', error);
    status.textContent = '启动失败，请刷新页面后重试。';
  }
}
guest.addEventListener('click', () => void enter());
if (import.meta.env.DEV && new URLSearchParams(location.search).has('spot')) void enter();
