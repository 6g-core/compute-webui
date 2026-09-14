import { useRef } from 'react';
import { usePresentationViewport } from '../hooks/usePresentationViewport.js';
import { PRESENTATION_STAGES } from '../hooks/usePresentationStage.js';
import './PptPresentation.css';

export default function PptPresentation({ stage, title, connectionState, followingBackend, selectStage, moveStage, language, setLanguage, children }) {
  const presentationRef = useRef(null);
  const { viewportRef, scale, backgroundStyle, readScroll } = usePresentationViewport();
  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await presentationRef.current.requestFullscreen();
    } catch { /* Embedded previews may not allow fullscreen. */ }
  };

  return (
    <main ref={presentationRef} className="presentation-viewport">
      <div className="presentation-background" style={backgroundStyle} aria-hidden="true" />
      <div ref={viewportRef} className="presentation-scroll" onScroll={readScroll}>
        <div className="presentation-fit" style={{ width: 1920 * scale, height: 1080 * scale }}>
          <div className="presentation-canvas" data-stage={stage} style={{ transform: `scale(${scale})` }}>
            <section className="ppt-artwork" aria-label="智能体通信网络">
              <img className="ppt-artwork-image" src="/assets/ppt/presentation.svg" width="1920" height="1080" alt="" aria-hidden="true" draggable="false" />
              <div className="sr-only" data-language-managed>
                <h1>智能体通信网络</h1>
                <h2>核心网</h2><p>数字身份管理、智能体会话</p>
                <p>① 可信数字身份　② 个人AI专网@任务QoS</p>
                <p>AR 眼镜与 eSIM 连接核心网。智能体网关连接任务调度、基站、eSIM、机器狗和机械臂。</p>
                <h2>可信数字身份</h2><p>硬件级可信 防篡改 可追溯</p>
                <p>软件数字身份 → 数字身份绑定SIM卡</p><p>联网即智能：软件AI账号 → 码号即AI账号</p>
                <h2>个人AI专网</h2><p>隐私防泄漏：数据公网绕行 → 数据不出网</p>
                <p>交互体验佳：首Token时延 1.2秒 → E2E 400毫秒</p>
              </div>
            </section>
            <section className="scene-frame" aria-label="Stage 1 动态组网场景" hidden={stage !== 1}>
              <img className="scene-image" src="/assets/ppt/image001.png" width="905" height="588" fetchPriority="high" draggable="false"
                alt="动态组网：AR 眼镜、NGC、小区机器狗智能体与快递点机械臂智能体，任务专属通信网络已建立" />
            </section>
            <section className="runtime-frame" aria-label="原三栏布局左栏" hidden={stage === 1}>
              {children}
            </section>
            <nav className="stage-toolbar" aria-label="演示阶段">
              <div className="stage-heading">
                <label>Stage <select aria-label="演示阶段" value={stage} onChange={(event) => selectStage(event.target.value)}>
                  {PRESENTATION_STAGES.map(value => <option key={value} value={value}>{value}</option>)}
                </select></label>
                <span className="stage-title">{stage === 1 ? '动态组网' : title}</span>
              </div>
              <div className="stage-status">
                <span className={`connection-dot ${connectionState === 'connected' ? 'online' : ''}`} />
                <span>{connectionState === 'connected' ? '后端已连接' : '后端连接中断'}</span>
                <button className="follow-button" aria-pressed={followingBackend} onClick={() => selectStage(null)}>{followingBackend ? '跟随后端' : '恢复跟随后端'}</button>
                <button className="language-button" aria-label="Toggle language" onClick={() => setLanguage(language === 'zh' ? 'en' : 'zh')}>{language === 'zh' ? 'EN' : '中文'}</button>
                <button onClick={toggleFullscreen}>全屏</button>
              </div>
            </nav>
            <nav className="ppt-navigation" aria-label="页面导航">
              <button aria-label="回到 Stage 1" title="回到 Stage 1" onClick={() => selectStage(1)} />
              <button aria-label="上一阶段" title="上一阶段（←）" onClick={() => moveStage(-1)} />
              <button aria-label="下一阶段" title="下一阶段（→）" onClick={() => moveStage(1)} />
            </nav>
          </div>
        </div>
      </div>
    </main>
  );
}
