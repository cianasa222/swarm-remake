import { Button } from '@heroui/react/button';
import { Input } from '@heroui/react/input';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { createRoot } from 'react-dom/client';

const AUTH_ORIGIN = 'https://swarm.cianasa888.cfd';
type Enter = (signedIn: boolean) => Promise<void>;
async function auth(action: 'login' | 'session' | 'logout', body?: Record<string, string>, signal?: AbortSignal) {
  const response = await fetch(`/api/swarm/auth/${action}`, { method: body ? 'POST' : 'GET', credentials: 'same-origin', cache: 'no-store', signal,
    headers: body ? {'Content-Type':'application/json'} : undefined, body: body ? JSON.stringify(body) : undefined });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'unavailable');
  return result as { accountId?: string | null };
}
function Login({ enter }: { enter: Enter }) {
  const [account, setAccount] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  const busyRef = useRef(false);
  const entered = useRef(false);
  const emailRef = useRef<HTMLInputElement>(null);
  const sessionRef = useRef<AbortController | null>(null);
  const allowed = location.origin === AUTH_ORIGIN;
  useEffect(() => {
    if (!allowed) return;
    const controller = new AbortController(); sessionRef.current = controller;
    void auth('session', undefined, controller.signal).then(r => {
      if (!controller.signal.aborted && !busyRef.current && !entered.current && typeof r.accountId === 'string' && r.accountId) setAccount(r.accountId);
    }).catch(() => { /* Guest is always usable. */ });
    return () => controller.abort();
  }, [allowed]);
  useEffect(() => { if (formOpen) emailRef.current?.focus(); }, [formOpen]);
  function lock() {
    if (busyRef.current || entered.current) return false;
    sessionRef.current?.abort(); busyRef.current = true; setBusy(true); return true;
  }
  function unlock() { busyRef.current = false; setBusy(false); }
  async function enterGame(signedIn: boolean) {
    setStatus('正在进入任务准备区…');
    try { await enter(signedIn); entered.current = true; }
    catch (error) { console.error('Game startup failed', error); setStatus('启动失败，请刷新页面后重试。'); }
  }
  async function guest() { if (!lock()) return; await enterGame(false); if (!entered.current) unlock(); }
  useEffect(() => { if (import.meta.env.DEV && new URLSearchParams(location.search).has('spot')) void guest(); }, []);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); if (!allowed || !lock()) return;
    const form = e.currentTarget, data = new FormData(form); setStatus('正在验证账号…');
    try {
      const result = await auth('login', { email: String(data.get('email') ?? '').trim(), password: String(data.get('password') ?? '') });
      if (typeof result.accountId !== 'string' || !result.accountId) throw new Error('unavailable');
      form.reset(); setAccount(result.accountId); setFormOpen(false); await enterGame(true);
    } catch (error) {
      const code = error instanceof Error ? error.message : '';
      setStatus(code === 'invalid_credentials' ? '邮箱或密码不正确。' : code === 'rate_limit' ? '尝试过于频繁，请稍后再试。' : '账号服务暂不可用，请稍后重试或以游客进入。');
    } finally { form.reset(); if (!entered.current) unlock(); }
  }
  async function logout() {
    if (!allowed || !lock()) return;
    try { await auth('logout', {}); setAccount(null); setFormOpen(false); setStatus('已退出账号。'); }
    catch { setStatus('退出失败，请重试。'); } finally { unlock(); }
  }
  async function continueGame() { if (!account || !lock()) return; await enterGame(true); if (!entered.current) unlock(); }

  return <div className="tideline-login">
    <div className="home-art" aria-hidden="true"><div className="home-moon"/><div className="home-beam"/><div className="home-tower"/><div className="home-sea"/><div className="home-sea sea-back"/></div>
    <header className="home-header"><span className="home-brand"><span className="brand-mark">◈</span> TIDELINE <span className="brand-divider">/</span> SWARM</span><span className="ui-pill"><i/> PATCH 14.14</span></header>
    <main className="home-content">
      <div className="home-copy"><div className="home-kicker">01 / WAREHOUSE DISTRICT</div><h1>无尽<br/>狂潮<span>。</span></h1><p>守住最后一道防线。<br/>在潮汐吞没城市之前，逆流而上。</p><div className="home-meta"><span>生存挑战</span><span>仓库区</span><span>原版战斗</span></div></div>
      <section className="home-glass" aria-label="任务登录">
        <div className="login-heading"><div><div className="home-kicker">MISSION ACCESS</div><h2>准备出击</h2></div><span className="login-emblem" aria-hidden="true">↗</span></div>
        <p>选择你的进入方式。</p>
        {account ? <>
          <Button id="home-continue" className="home-primary ui-button" isDisabled={busy} onPress={() => void continueGame()}>继续游戏 <span aria-hidden="true">→</span></Button>
          <Button id="home-guest" variant="outline" className="home-secondary ui-button" isDisabled={busy} onPress={() => void guest()}>游客进入 <span aria-hidden="true">→</span></Button>
          <Button id="home-logout" variant="outline" className="home-secondary ui-button" isDisabled={busy} onPress={() => void logout()}>退出账号 <span aria-hidden="true">↗</span></Button>
        </> : <>
          <Button id="home-guest" className="home-primary ui-button" isDisabled={busy} onPress={() => void guest()}>游客进入 <span aria-hidden="true">→</span></Button>
          <Button id="home-email" variant="outline" className="home-secondary ui-button" isDisabled={busy} aria-expanded={formOpen} onPress={() => {
            if (!allowed) { setStatus('请在正式域名 swarm.cianasa888.cfd 使用邮箱登录；本地址支持游客。'); return; }
            setStatus(''); setFormOpen(v => !v);
          }}>邮箱账号登录 <span aria-hidden="true">{formOpen ? '−' : '+'}</span></Button>
        </>}
        {formOpen && !account && <form id="home-login-form" method="post" action="/api/swarm/auth/login" onSubmit={submit}>
          <label htmlFor="login-email">邮箱</label><Input ref={emailRef} id="login-email" type="email" name="email" autoComplete="username" required maxLength={254} placeholder="name@example.com" aria-label="邮箱" disabled={busy}/>
          <label htmlFor="login-password">密码</label><Input id="login-password" type="password" name="password" autoComplete="current-password" required maxLength={256} placeholder="输入账号密码" aria-label="密码" disabled={busy}/>
          <Button id="home-submit" className="home-primary ui-button" type="submit" isDisabled={busy}>登录并进入 <span aria-hidden="true">→</span></Button>
          <a className="home-register" href="https://game.cianasa888.cfd/" target="_blank" rel="noopener noreferrer">注册账号 / 管理原账号 ↗</a>
        </form>}
        <div className="login-note">共用垃圾处理器账号 · 不读取原游戏存档</div>
        <p id="home-status" role="status" aria-live="polite">{status}</p>
      </section>
    </main><footer className="home-footer"><span>非官方 · 朋友间非商业娱乐项目</span><span>TIDELINE / 01</span></footer>
  </div>;
}
export function mountLogin(container: HTMLElement, enter: Enter) { createRoot(container).render(<Login enter={enter}/>); }
