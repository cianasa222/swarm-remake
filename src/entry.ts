import './style.css';
import './home.css';

const home = document.getElementById('login-home')!;
const guest = document.getElementById('home-guest') as HTMLButtonElement;
const status = document.getElementById('home-status')!;
let entering = false;

async function enter() {
  if (entering) return;
  entering = true;
  guest.disabled = true;
  status.textContent = '正在进入任务准备区…';
  try {
    await import('./main');
    document.getElementById('screen-start')!.classList.remove('hidden');
    home.classList.add('home-leave');
    window.setTimeout(() => { home.hidden = true; }, 300);
  } catch (error) {
    console.error('Game startup failed', error);
    status.textContent = '启动失败，请刷新页面后重试。';
  }
}
guest.addEventListener('click', enter);
if (import.meta.env.DEV && new URLSearchParams(location.search).has('spot')) void enter();
