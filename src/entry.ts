import './ui/heroui.css';
import './style.css';
import './home.css';
import './ui/tideline.css';
import { mountLogin } from './ui/login';

const home = document.getElementById('login-home')!;
async function enter(signedIn: boolean) {
  await import('./main');
  document.documentElement.dataset.playerMode = signedIn ? 'account' : 'guest';
  document.getElementById('screen-start')!.classList.remove('hidden');
  home.classList.add('home-leave');
  window.setTimeout(() => { home.hidden = true; }, 300);
}
mountLogin(document.getElementById('login-root')!, enter);
