import { useRef } from 'react';
import { usePresentationViewport } from '../hooks/usePresentationViewport.js';
import './PptPresentation.css';

export default function PptPresentation({ stage, title, connectionState, followingBackend, selectStage, moveStage, language, setLanguage, children }) {
  const presentationRef = useRef(null);
  const { viewportRef, scale, backgroundStyle, readScroll } = usePresentationViewport();

  return (
    <main ref={presentationRef} className="presentation-viewport">
      <div className="presentation-background" style={backgroundStyle} aria-hidden="true" />
      <div ref={viewportRef} className="presentation-scroll" onScroll={readScroll}>
        <div className="presentation-fit" style={{ width: 1920 * scale, height: 1080 * scale }}>
          <div className="presentation-canvas" data-stage={stage} style={{ transform: `scale(${scale})` }}>
            <div className="ppt-header-logos">
              <img className="ppt-logo-cmcc" src="/assets/ppt/logo-cmcc.png" alt="China Mobile" draggable="false" />
              <img className="ppt-logo-huawei" src="/assets/ppt/logo-huawei.png" alt="Huawei" draggable="false" />
            </div>
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
                <p>交互体验佳：首Token时延 1.2秒 → E2E&lt;400毫秒</p>
              </div>
            </section>
            <section className="scene-frame" aria-label="Stage 1 动态组网场景" hidden={stage !== 1}>
              <div className="scene-illustration" role="img" aria-label="动态组网：AR 眼镜、ACN、小区机器狗智能体与快递点机械臂智能体，任务专属通信网络已建立">
                <img className="scene-image" src="/assets/ppt/image001-background.png" width="1556" height="1011" fetchPriority="high" draggable="false" alt="" aria-hidden="true" />
                {/* Keep labels as vector text so browser zoom never enlarges raster glyphs. */}
                <svg className="scene-labels" viewBox="0 0 1556 1011" aria-hidden="true" focusable="false" textAnchor="middle">
                  <text className="scene-label-title" x="772" y="134">动态组网</text>
                  <text className="scene-label-glasses" x="326" y="138">AR眼镜</text>
                  <text className="scene-label-acn" x="779" y="284">ACN</text>
                  <text x="1134" y="194"><tspan x="1134">快递点机械臂</tspan><tspan x="1134" dy="37">智能体</tspan></text>
                  <text x="362" y="443">小区机器狗智能体</text>
                  <text className="scene-label-status" x="820" y="566">任务专属通信网络已建立</text>
                </svg>
              </div>
            </section>
            <section className="runtime-frame" aria-label="原三栏布局左栏" hidden={stage === 1}>
              {children}
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
