import { Button } from '@heroui/react/button';
import { Switch } from '@heroui/react/switch';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import type { DetailKey, DetailValue, FrameCap, QualitySetting, QualityTier } from '../render/quality';
import type { UpgradeOffer } from '../sim/weapons';

export interface SettingsState {
  setting: QualitySetting; recommended: QualityTier; active: QualityTier;
  details: Record<DetailKey, DetailValue>; frameCap: FrameCap; cameraHeight: number;
  reduceFlash: boolean; noShake: boolean; muted: boolean;
}
export interface SettingsActions {
  quality(value: QualitySetting): void;
  detail(key: DetailKey, value: DetailValue): void;
  frameCap(value: FrameCap): void;
  cameraHeight(value: number): void;
  toggle(key: 'reduceFlash' | 'noShake' | 'muted', value: boolean): void;
}
const tierLabels = {low:'低',medium:'中',high:'高'};
const choices = [['auto','跟随画质'],['low','低'],['high','高']] as const;
function Seg<T extends string | number>({label, value, options, onChange}: {label:string; value:T; options: readonly (readonly [T,string])[]; onChange:(value:T)=>void}) {
  return <div className="ui-segment" role="group" aria-label={label}>{options.map(([v,name])=><Button key={v} size="sm" variant="ghost" className={`ui-segment-button${value === v ? ' selected' : ''}`} aria-pressed={value === v} onPress={()=>onChange(v)}>{name}</Button>)}</div>;
}
function Toggle({label, hint, checked, onChange}: {label:string; hint?:string; checked:boolean; onChange:(v:boolean)=>void}) {
  return <Switch className="ui-switch" aria-label={label} isSelected={checked} onChange={onChange}>
    <Switch.Content aria-label={label}><span className="ui-switch-label"><span>{label}</span>{hint && <small>{hint}</small>}</span><Switch.Control><Switch.Thumb/></Switch.Control></Switch.Content>
  </Switch>;
}
function Settings({state,actions}: {state:SettingsState; actions:SettingsActions}) {
  return <div className="tideline-settings dark">
    <div className="settings-heading"><span>画质与性能</span><small>推荐 {tierLabels[state.recommended]} · 当前 {tierLabels[state.active]}</small></div>
    <div className="settings-grid">
      <div className="settings-card">
        <div className="settings-row"><span>画质预设</span><Seg<QualitySetting> label="画质预设" value={state.setting} options={ [['auto','自动'],['low','低'],['medium','中'],['high','高']] } onChange={actions.quality}/></div>
        <div className="settings-row"><span>实时阴影</span><Seg<DetailValue> label="实时阴影" value={state.details.shadows} options={ [['auto','自动'],['off','关'],['low','低'],['high','高']] } onChange={v=>actions.detail('shadows',v)}/></div>
        <div className="settings-row"><span>渲染分辨率</span><Seg<DetailValue> label="渲染分辨率" value={state.details.resolution} options={choices} onChange={v=>actions.detail('resolution',v)}/></div>
        <div className="settings-row"><span>帧率上限</span><Seg<FrameCap> label="帧率上限" value={state.frameCap} options={ [[30,'30'],[60,'60'],[0,'不限']] } onChange={actions.frameCap}/></div>
        <div className="settings-row"><span>镜头高度</span><Seg<number> label="镜头高度" value={state.cameraHeight} options={ [[0.8,'低'],[0.9,'较低'],[1,'默认'],[1.15,'较高'],[1.3,'高']] } onChange={actions.cameraHeight}/></div>
      </div>
      <div className="settings-card">
        <div className="settings-row"><span>特效粒子强度</span><Seg<DetailValue> label="特效粒子强度" value={state.details.fx} options={choices} onChange={v=>actions.detail('fx',v)}/></div>
        <Toggle label="减轻队友特效" hint="联机预留，不影响敌方预警" checked={state.details.teammates==='low'} onChange={v=>actions.detail('teammates',v?'low':'auto')}/>
        <Toggle label="减弱闪光" checked={state.reduceFlash} onChange={v=>actions.toggle('reduceFlash',v)}/>
        <Toggle label="关闭震屏" checked={state.noShake} onChange={v=>actions.toggle('noShake',v)}/>
        <Toggle label="静音" checked={state.muted} onChange={v=>actions.toggle('muted',v)}/>
      </div>
    </div><div className="settings-foot">设置即时生效 · 画质不会改变敌人数量或战斗数值</div>
  </div>;
}
export function mountSettings(container: HTMLElement) {
  const root = createRoot(container);
  return (state: SettingsState, actions: SettingsActions) => root.render(<Settings state={state} actions={actions}/>);
}

function Cards({offers, onPick, iconUrl}: {offers:UpgradeOffer[]; onPick:(idx:number)=>void; iconUrl:(url:string)=>string}) {
  return <>{offers.map((o,idx)=><Button key={`${o.id}:${o.nextLevel}:${idx}`} variant="ghost" className={`card upgrade-choice${o.kind==='evolve'?' evo-card':''}`} onPress={()=>onPick(idx)}>
    <span className="card-top"><img className="card-icon" src={iconUrl(o.icon)} alt=""/><span className="card-head"><span className={`card-tag ${o.kind}`}>{o.tag}</span><span className="card-name">{o.name}</span><span className="card-sub">{o.sub}</span><span className="card-pips">{Array.from({length:5},(_,i)=><span key={i} className={`card-pip${o.kind==='evolve'||i<o.nextLevel?' on':''}`}/>)}</span></span></span>
    <span className="card-desc">{o.desc}</span>
    <span className="card-footer"><span className={`card-hint${o.evolveReady?' ready':''}`}>{o.evolvePartnerIcon && <img src={iconUrl(o.evolvePartnerIcon)} alt=""/>}<span>{o.evolveHint??''}</span></span><span className="card-key">按 {idx+1}</span></span>
  </Button>)}</>;
}
export function mountUpgrade(container:HTMLElement) {
  const root=createRoot(container);
  return (offers:UpgradeOffer[], onPick:(idx:number)=>void, iconUrl:(url:string)=>string) => flushSync(()=>root.render(<Cards offers={offers} onPick={onPick} iconUrl={iconUrl}/>));
}
