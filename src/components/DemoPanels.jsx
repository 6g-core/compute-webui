import {
  ChevronRight,
  Cpu,
  Network,
  RadioTower,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  User,
} from 'lucide-react';
import { isQosExperienceStage } from '../utils/topologyStageVisibility.js';
import personalNetworkDiagram from '../../88.png';
import agentCommunicationDiagram from '../../89.png';

export const LeftPanel = ({ effectiveStageConfig, stage, language = "zh", translateText = (text) => text, components, qosDialogItems = [], onStage5VideoFrame }) => {
  const {
    ARGlasses,
    ArRegistrationPanel,
    BackgroundVideoPanel,
    DogVisionStreams,
    HandoffPanel,
    RobotDog,
    SciFiPanel,
  } = components;
  const showQosExperience = isQosExperienceStage(stage);

  return (
    <>
                {/* 左列：机器狗接入 */}
                <div className="min-h-0">
                  <SciFiPanel className="h-full">
                    <div className="flex flex-col h-full">
                      <h2
                        key={`${stage}-${language}-${effectiveStageConfig.leftPanelTitle}`}
                        data-language-managed
                        className="text-blue-100 text-lg lg:text-xl font-bold text-center mb-4 pb-3 border-b border-blue-500/30"
                      >
                        {language === "en"
                          ? translateText(effectiveStageConfig.leftPanelTitle)
                          : effectiveStageConfig.leftPanelTitle}
                      </h2>

                      <div className="relative flex min-h-0 flex-1 flex-col gap-3">
                        {Number(stage) === 5 && (
                          <div
                            data-stage5-video-prewarm={effectiveStageConfig.stage5Prewarming ? "warming" : "ready"}
                            aria-hidden={effectiveStageConfig.stage5Prewarming ? "true" : undefined}
                            className={effectiveStageConfig.stage5Prewarming
                              ? "pointer-events-none absolute inset-0 flex opacity-0"
                              : "contents"}
                          >
                            <DogVisionStreams
                              showEnhanced
                              preloadEnhanced
                              sampleRaw
                              stage5QoeComplete={Boolean(effectiveStageConfig.stage5QoeComplete)}
                              stage5SandboxComplete={Boolean(effectiveStageConfig.stage5SandboxComplete)}
                              stageAnimationDone={Boolean(effectiveStageConfig.stageAnimationDone)}
                              onFirstFrame={onStage5VideoFrame}
                            />
                          </div>
                        )}
                        {Number(stage) >= 7 && (
                          <BackgroundVideoPanel visible={Boolean(effectiveStageConfig.showBackgroundVideo)} />
                        )}
                        {effectiveStageConfig.showArRegistration ? (
                          <ArRegistrationPanel />
                        ) : effectiveStageConfig.showBackgroundVideo ? (
                          null
                        ) : effectiveStageConfig.showHandoff ? (
                          <HandoffPanel />
                        ) : Number(stage) === 5 && !effectiveStageConfig.stage5Prewarming ? (
                          null
                        ) : effectiveStageConfig.showDogVision || effectiveStageConfig.showEnhancedDogVision ? (
                          <DogVisionStreams
                            showEnhanced={Boolean(effectiveStageConfig.showEnhancedDogVision)}
                            preloadEnhanced={Number(stage) >= 5}
                            sampleRaw={Number(stage) === 5}
                            stage5QoeComplete={Boolean(effectiveStageConfig.stage5QoeComplete)}
                            stage5SandboxComplete={Boolean(effectiveStageConfig.stage5SandboxComplete)}
                            stageAnimationDone={Boolean(effectiveStageConfig.stageAnimationDone)}
                            onFirstFrame={Number(stage) === 5 ? onStage5VideoFrame : undefined}
                            showQosConversation={showQosExperience}
                            qosDialogItems={showQosExperience ? qosDialogItems : []}
                            enhancedLabel={effectiveStageConfig.enhancedDogVisionLabel}
                          />
                        ) : effectiveStageConfig.showHomeDomainDevice && effectiveStageConfig.homeDomainDevicesReady === false ? (
                          <div className="min-h-[520px] flex-1 rounded-xl border border-emerald-500/20 bg-slate-950/10 backdrop-blur-md" aria-hidden="true" />
                        ) : effectiveStageConfig.showHomeDomainDevice ? (
                          <>
                          <div className={`border border-emerald-500/30 bg-slate-950/10 backdrop-blur-md flex flex-col overflow-hidden rounded-xl p-3 relative ${
                            effectiveStageConfig.showRegisteredDevice
                              ? "min-h-[260px] flex-1"
                              : "min-h-[260px] flex-1"
                          }`}>
                            <div className="flex items-center gap-2 text-emerald-400 mb-2 relative z-20">
                              <ShieldCheck className="w-5 h-5 animate-pulse" />
                              <div>
                                <div className="font-bold text-xs lg:text-sm">已注册设备</div>
                                <div className="text-[10px] opacity-70">Registered Device</div>
                              </div>
                            </div>

                            <div className="flex-1 w-full relative mt-1">
                              <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox="0 0 100 100" preserveAspectRatio="none">
                                <defs>
                                  <linearGradient id="ar-cone-beam" x1="0" y1="0.8" x2="0.8" y2="0.2">
                                    <stop offset="0%" stopColor="rgba(34, 211, 238, 0.35)" stopOpacity="0.7" />
                                    <stop offset="100%" stopColor="rgba(34, 211, 238, 0)" stopOpacity="0" />
                                  </linearGradient>
                                </defs>
                                <polygon points="34,65 65,15 95,50" fill="url(#ar-cone-beam)" className="opacity-40 animate-pulse" />
                                <line x1="34" y1="65" x2="65" y2="15" stroke="rgba(34, 211, 238, 0.4)" strokeWidth="0.5" strokeDasharray="2 2" />
                                <line x1="34" y1="65" x2="95" y2="50" stroke="rgba(34, 211, 238, 0.4)" strokeWidth="0.5" strokeDasharray="2 2" />
                                <circle cx="34" cy="65" r="1.5" fill="#22d3ee" />
                              </svg>

                              <div className="absolute bottom-1 left-1 z-10 h-24 w-28 lg:h-28 lg:w-32 2xl:h-48 2xl:w-64">
                                <ARGlasses className="w-full h-full object-contain" />
                              </div>

                              <div className="absolute right-3 top-3 w-[44%] max-w-[155px] origin-top-right bg-emerald-950/80 border border-cyan-400/50 p-2 sm:p-2.5 2xl:max-w-[220px] 2xl:p-3 rounded-lg backdrop-blur-md shadow-[0_0_15px_rgba(16,185,129,0.3)] z-20 animate-hologram [transform:perspective(500px)_rotateY(-15deg)_rotateX(8deg)_scale(1.25)] leading-tight text-emerald-300">
                                <div className="text-cyan-300 font-extrabold mb-1 border-b border-cyan-500/20 pb-1 uppercase tracking-wide text-[10px] sm:text-[11px]">
                                  Digital ID
                                </div>
                                <div className="text-gray-100 font-mono font-bold tracking-tight mb-1 truncate text-[10px] sm:text-[11px]">
                                  3lt1zY73G@CMCC.org
                                </div>
                                <div className="flex flex-col gap-0.5 text-[9px] sm:text-[10px] font-medium">
                                  <div className="flex flex-col gap-0.5">
                                    <span className="opacity-75">Capabilities:</span>
                                    <span className="font-bold text-cyan-300 leading-tight break-words">
                                      [Device-Network Synergy, AR]
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="opacity-75">Status:</span>
                                    <span className="font-bold flex items-center gap-0.5 text-emerald-400">
                                      Active <span className="w-1 h-1 bg-emerald-400 rounded-full inline-block"></span>
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          {!effectiveStageConfig.showRegisteredDevice && (
                            <div className="min-h-[260px] flex-1 opacity-0 pointer-events-none" aria-hidden="true" />
                          )}
                          </>
                        ) : (
                          <>
                            {/* === 未注册设备 (红色全息光锥投影) === */}
                            <div className={`border border-red-500/30 bg-red-950/10 backdrop-blur-md flex flex-col overflow-hidden rounded-xl p-3 relative ${
                              effectiveStageConfig.showRegisteredDevice
                                ? "min-h-[260px] flex-1"
                                : "min-h-[260px] flex-1"
                            }`}>
                              <div className="flex items-center gap-2 text-red-400 mb-2 relative z-20">
                                <ShieldAlert className="w-5 h-5 animate-bounce" />
                                <div>
                                  <div className="font-bold text-xs lg:text-sm">未注册设备</div>
                                  <div className="text-[10px] opacity-70">Unknown Device</div>
                                </div>
                              </div>

                              <div className="flex-1 w-full relative mt-1">
                                {/* 红色发散全息光锥层 */}
                                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox="0 0 100 100" preserveAspectRatio="none">
                                  <defs>
                                    <linearGradient id="unreg-cone-beam" x1="0" y1="0.8" x2="0.8" y2="0.2">
                                      <stop offset="0%" stopColor="rgba(239, 68, 68, 0.35)" stopOpacity="0.7" />
                                      <stop offset="100%" stopColor="rgba(239, 68, 68, 0)" stopOpacity="0" />
                                    </linearGradient>
                                  </defs>
                                  {/* 雷达源到全息面板的扩散半透明光锥 */}
                                  <polygon points="34,65 65,15 95,50" fill="url(#unreg-cone-beam)" className="opacity-40 animate-pulse" />
                                  <line x1="34" y1="65" x2="65" y2="15" stroke="rgba(248, 113, 113, 0.4)" strokeWidth="0.5" strokeDasharray="2 2" />
                                  <line x1="34" y1="65" x2="95" y2="50" stroke="rgba(248, 113, 113, 0.4)" strokeWidth="0.5" strokeDasharray="2 2" />
                                  {/* 发射微点 */}
                                  <circle cx="34" cy="65" r="1.5" fill="#ef4444" />
                                </svg>

                                {/* 机器狗本体 (靠左下坐立) */}
                                <div className="absolute bottom-1 left-1 z-10 h-24 w-28 lg:h-28 lg:w-32 2xl:h-48 2xl:w-64">
                                  <RobotDog className="w-full h-full object-contain" status="unregistered" />
                                </div>

                                {/* 3D 悬浮红色警示全息牌 (靠右侧，朝狗身侧上方倾斜) */}
                                <div className="absolute right-3 top-3 w-[44%] max-w-[155px] origin-top-right bg-red-950/80 border border-red-500/50 p-2 sm:p-2.5 2xl:max-w-[220px] 2xl:p-3 rounded-lg backdrop-blur-md shadow-[0_0_15px_rgba(239,68,68,0.25)] z-20 animate-hologram-red [transform:perspective(500px)_rotateY(-15deg)_rotateX(8deg)_scale(1.25)] text-red-300 leading-tight">
                                  <div className="text-red-400 font-black mb-1 border-b border-red-500/20 pb-1 uppercase tracking-wide text-[10px] sm:text-[11px]">
                                    Device Warning
                                  </div>
                                  <div className="font-mono font-bold text-[11px] sm:text-xs truncate mb-1">
                                    Robot Dog
                                  </div>
                                  <div className="opacity-80 text-[9px] sm:text-[10px] mb-1">
                                    待注册 / Unregistered
                                  </div>
                                  <div className="mt-1 flex justify-between text-[9px] sm:text-[10px] font-bold">
                                    <span>Status:</span>
                                    <span className="text-red-400 animate-pulse">Blocked</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {!effectiveStageConfig.showRegisteredDevice && (
                              <div className="min-h-[260px] flex-1 opacity-0 pointer-events-none" aria-hidden="true" />
                            )}

                        {effectiveStageConfig.showRegisteredDevice && (
                          <>
                            {!effectiveStageConfig.hideDeviceArrow && (
                              <div className="flex justify-center text-blue-500 my-[-10px] z-10">
                                <ChevronRight className="w-8 h-8 rotate-90 bg-slate-900 border border-blue-500/30 rounded-full" />
                              </div>
                            )}
                            {effectiveStageConfig.hideDeviceArrow && (
                              <div className="h-3 shrink-0 opacity-0 pointer-events-none" aria-hidden="true" />
                            )}

                            {/* === 已注册设备 (绿色3D全息投影面板) === */}
                            <div className="border border-emerald-500/30 bg-slate-950/10 backdrop-blur-md flex min-h-[260px] flex-1 flex-col overflow-hidden rounded-xl p-3 relative">
                              <div className="flex items-center gap-2 text-emerald-400 mb-2 relative z-20">
                                <ShieldCheck className="w-5 h-5 animate-pulse" />
                                <div>
                                  <div className="font-bold text-xs lg:text-sm">已注册设备</div>
                                  <div className="text-[10px] opacity-70">Registered Device</div>
                                </div>
                              </div>

                              <div className="flex-1 w-full relative mt-1">
                                {/* 全息透视光锥 (激光散射线) */}
                                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox="0 0 100 100" preserveAspectRatio="none">
                                  <defs>
                                    <linearGradient id="reg-cone-beam" x1="0" y1="0.8" x2="0.8" y2="0.2">
                                      <stop offset="0%" stopColor="rgba(16, 185, 129, 0.35)" stopOpacity="0.7" />
                                      <stop offset="100%" stopColor="rgba(16, 185, 129, 0)" stopOpacity="0" />
                                    </linearGradient>
                                  </defs>
                                  {/* 光罩 */}
                                  <polygon points="34,65 65,15 95,50" fill="url(#reg-cone-beam)" className="opacity-40 animate-pulse" />
                                  <line x1="34" y1="65" x2="65" y2="15" stroke="rgba(52, 211, 153, 0.4)" strokeWidth="0.5" strokeDasharray="2 2" />
                                  <line x1="34" y1="65" x2="95" y2="50" stroke="rgba(52, 211, 153, 0.4)" strokeWidth="0.5" strokeDasharray="2 2" />
                                  {/* 激光雷达发射核心 */}
                                  <circle cx="34" cy="65" r="1.5" fill="#10b981" />
                                </svg>

                                {/* 机器狗本体 (靠左下安稳站立) */}
                                <div className="absolute bottom-1 left-1 z-10 h-24 w-28 lg:h-28 lg:w-32 2xl:h-48 2xl:w-64">
                                  <RobotDog className="w-full h-full object-contain" status="registered" />
                                </div>

                                {/* 3D 浮空倾斜全息卡片 (跟在机器狗身侧上部，带透视翻折) */}
                                <div className="absolute right-3 top-3 w-[44%] max-w-[155px] origin-top-right bg-emerald-950/80 border border-cyan-400/50 p-2 sm:p-2.5 2xl:max-w-[220px] 2xl:p-3 rounded-lg backdrop-blur-md shadow-[0_0_15px_rgba(16,185,129,0.3)] z-20 animate-hologram [transform:perspective(500px)_rotateY(-15deg)_rotateX(8deg)_scale(1.25)] leading-tight text-emerald-300">
                                  <div className="text-cyan-300 font-extrabold mb-1 border-b border-cyan-500/20 pb-1 uppercase tracking-wide text-[10px] sm:text-[11px]">
                                    Digital ID
                                  </div>
                                  <div className="text-gray-100 font-mono font-bold tracking-tight mb-1 truncate text-[10px] sm:text-[11px]">
                                    DID:2168nLB3G@CMCC.org
                                  </div>
                                  <div className="flex flex-col gap-0.5 text-[9px] sm:text-[10px] font-medium">
                                    <div className="flex flex-col gap-0.5">
                                      <span className="opacity-75">Capabilities:</span>
                                      <span className="font-bold text-cyan-300 leading-tight break-words">
                                        [4 Legs, Camera, Payload:10KG/10KM]
                                      </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                      <span className="opacity-75">Status:</span>
                                      <span className="font-bold flex items-center gap-0.5 text-emerald-400">
                                        Active <span className="w-1 h-1 bg-emerald-400 rounded-full inline-block"></span>
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                          </>
                        )}
                        {effectiveStageConfig.showHomeDomainDevice && effectiveStageConfig.showRegisteredDevice && (
                          <div className="border border-emerald-500/30 bg-slate-950/10 backdrop-blur-md flex min-h-[260px] flex-1 flex-col overflow-hidden rounded-xl p-3 relative">
                            <div className="flex items-center gap-2 text-emerald-400 mb-2 relative z-20">
                              <ShieldCheck className="w-5 h-5 animate-pulse" />
                              <div>
                                <div className="font-bold text-xs lg:text-sm">已注册设备</div>
                                <div className="text-[10px] opacity-70">Registered Device</div>
                              </div>
                            </div>

                            <div className="flex-1 w-full relative mt-1">
                              <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox="0 0 100 100" preserveAspectRatio="none">
                                <defs>
                                  <linearGradient id="stage4-reg-cone-beam" x1="0" y1="0.8" x2="0.8" y2="0.2">
                                    <stop offset="0%" stopColor="rgba(16, 185, 129, 0.35)" stopOpacity="0.7" />
                                    <stop offset="100%" stopColor="rgba(16, 185, 129, 0)" stopOpacity="0" />
                                  </linearGradient>
                                </defs>
                                <polygon points="34,65 65,15 95,50" fill="url(#stage4-reg-cone-beam)" className="opacity-40 animate-pulse" />
                                <line x1="34" y1="65" x2="65" y2="15" stroke="rgba(52, 211, 153, 0.4)" strokeWidth="0.5" strokeDasharray="2 2" />
                                <line x1="34" y1="65" x2="95" y2="50" stroke="rgba(52, 211, 153, 0.4)" strokeWidth="0.5" strokeDasharray="2 2" />
                                <circle cx="34" cy="65" r="1.5" fill="#10b981" />
                              </svg>

                              <div className="absolute bottom-1 left-1 z-10 h-24 w-28 lg:h-28 lg:w-32 2xl:h-48 2xl:w-64">
                                <RobotDog className="w-full h-full object-contain" status="registered" />
                              </div>

                              <div className="absolute right-3 top-3 w-[44%] max-w-[155px] origin-top-right bg-emerald-950/80 border border-cyan-400/50 p-2 sm:p-2.5 2xl:max-w-[220px] 2xl:p-3 rounded-lg backdrop-blur-md shadow-[0_0_15px_rgba(16,185,129,0.3)] z-20 animate-hologram [transform:perspective(500px)_rotateY(-15deg)_rotateX(8deg)_scale(1.25)] leading-tight text-emerald-300">
                                <div className="text-cyan-300 font-extrabold mb-1 border-b border-cyan-500/20 pb-1 uppercase tracking-wide text-[10px] sm:text-[11px]">
                                  Digital ID
                                </div>
                                <div className="text-gray-100 font-mono font-bold tracking-tight mb-1 truncate text-[10px] sm:text-[11px]">
                                  DID:2168nLB3G@CMCC.org
                                </div>
                                <div className="flex flex-col gap-0.5 text-[9px] sm:text-[10px] font-medium">
                                  <div className="flex flex-col gap-0.5">
                                    <span className="opacity-75">Capabilities:</span>
                                    <span className="font-bold text-cyan-300 leading-tight break-words">
                                      [4 Legs, Camera, Payload:10KG/10KM]
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="opacity-75">Status:</span>
                                    <span className="font-bold flex items-center gap-0.5 text-emerald-400">
                                      Active <span className="w-1 h-1 bg-emerald-400 rounded-full inline-block"></span>
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                      </div>

                      {effectiveStageConfig.showRegisteredDevice && !effectiveStageConfig.hideDeviceArrow && (
                        <div className="flex justify-between text-[10px] lg:text-xs text-blue-200 mt-4 px-1 font-medium">
                          <span>① 身份申请</span>
                          <ChevronRight className="w-3 lg:w-4 h-3 lg:h-4 text-blue-400" />
                          <span>② 业务授权</span>
                          <ChevronRight className="w-3 lg:w-4 h-3 lg:h-4 text-blue-400" />
                          <span>③ 能力发布</span>
                        </div>
                      )}
                      {effectiveStageConfig.showRegisteredDevice && effectiveStageConfig.hideDeviceArrow && (
                        <div className="mt-4 h-[18px] opacity-0 pointer-events-none" aria-hidden="true" />
                      )}
                    </div>
                  </SciFiPanel>
                </div>

    </>
  );
};

export const RightPanel = ({ effectiveStageConfig, latencySeries, stage, components }) => {
  const {
    CompletedTasksPanel,
    LatencyChart,
    SciFiPanel,
    StatusRow,
    TaskBriefPanel,
  } = components;

  return (
    <>
      {/* 右列：实时状态 */}
      <div className="h-[900px] min-h-0">
        <SciFiPanel className="h-full">
          <div className="flex h-full min-h-0 flex-col">
            <h2 className="text-blue-200 text-base lg:text-lg font-bold text-center mb-4 pb-3 border-b border-blue-500/30">
              {stage === 10 ? "已完成任务" : "实时状态"}
            </h2>
            {stage === 10 ? (
              <CompletedTasksPanel />
            ) : (
              <div className="flex min-h-0 flex-1 flex-col gap-4">
                {/* 子栏目 1: 实时状态 */}
                <div className="flex-none border border-blue-500/30 rounded-lg p-3.5 bg-slate-900/30 backdrop-blur-md flex flex-col justify-center shadow-md">
                  {stage === 8 ? (
                    <LatencyChart points={latencySeries.points} error={latencySeries.error} />
                  ) : (
                    <>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded bg-blue-900/25 border border-blue-500/40 flex items-center justify-center">
                          <User className="w-4 h-4 text-blue-300" />
                        </div>
                        <h3 className="status-panel-title text-white font-bold text-base lg:text-lg">{effectiveStageConfig.statusTitle}</h3>
                      </div>
                      <div className="flex flex-col">
                        {effectiveStageConfig.statusRows.map((item) => (
                          <StatusRow
                            key={item.label}
                            label={item.label}
                            value={item.value}
                            status={item.status}
                            isMono={item.isMono}
                            stacked={item.stacked}
                            valueClassName={[
                              item.valueClassName || "",
                              item.isMono ? "leading-tight text-right break-all" : "",
                            ].filter(Boolean).join(" ")}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* 子栏目 2: 意图解析处理摘要 */}
                <div className="min-h-0 flex-1 overflow-hidden border border-blue-500/30 rounded-lg p-3.5 bg-slate-900/30 backdrop-blur-md flex flex-col shadow-md">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded bg-blue-900/25 border border-blue-500/40 flex items-center justify-center">
                      <Network className="w-4 h-4 text-blue-300" />
                    </div>
                    <h3 className="text-white font-bold text-base lg:text-lg">意图解析处理摘要</h3>
                  </div>
                  <TaskBriefPanel logs={effectiveStageConfig.intentSummary || effectiveStageConfig.logs} />
                </div>
              </div>
            )}
          </div>
        </SciFiPanel>
      </div>
    </>
  );
};

const STEP_DETAIL_ITEMS = {
  "01": ["颁发数字身份", "能力注册", "接入网络"],
  "02": ["创建家庭域", "更新签约数据", "下发域接入凭证", "下发物理组网配置"],
  "03": ["ID寻址路由", "身份可信认证", "Agent协议转换"],
  "04": ["创建算力会话", "分配算力资源", "L3级通信保障"],
  "05": ["机器狗感知输入", "网络算力节点识别标注", "标注结果回传AR眼镜", "随路QoS保障"],
};

const STAGE24_PLANNING_DETAIL_ITEMS = [
  "连接智能体：端侧QoE感知",
  "QoS策略工具：保障策略生成",
  "RAN / UPF：保障通道建立",
];

const buildSequentialDetailStatuses = (length, activeIndex) => (
  Array.from({ length }, (_, index) => (
    index < activeIndex ? "success" : index === activeIndex ? "working" : "pending"
  ))
);

const getStepDetailStatuses = ({ step, detailItems, stage, stagePhaseKey, workflow }) => {
  if (step.status === "success") {
    return detailItems.map(() => "success");
  }

  if (step.status !== "working") {
    return detailItems.map(() => "pending");
  }

  const phaseKey = stagePhaseKey || "";

  if (Number(stage) === 24 && step.id === "04") {
    return ["success", "success", "working"];
  }

  if (step.id === "01") {
    const activeIndex = /stage2_4_arf/.test(phaseKey)
      ? 1
      : /stage2_(4_done|5_|6)/.test(phaseKey) ? 2 : 0;
    return buildSequentialDetailStatuses(detailItems.length, activeIndex);
  }

  if (step.id === "02") {
    const activeIndex = /stage4_4_subscription/.test(phaseKey)
      ? 1
      : /stage4_4_(subnet_context|issue_token|validate_token)/.test(phaseKey)
        ? 2
        : /stage4_(4_done|5_|6)/.test(phaseKey) || Number(stage) === 5 ? 3 : 0;
    return buildSequentialDetailStatuses(detailItems.length, activeIndex);
  }

  if (step.id === "03" && workflow?.length === detailItems.length) {
    return workflow.map((item) => item.status || "pending");
  }

  if (step.id === "04") {
    const activeIndex = /stage7_4_sandbox_(resources|template|validate|service)/.test(phaseKey)
      ? 1
      : /stage7_(4_done|5_)/.test(phaseKey) ? 2 : 0;
    return buildSequentialDetailStatuses(detailItems.length, activeIndex);
  }

  if (step.id === "05") {
    if (Number(stage) >= 9) {
      return ["success", "success", "success", "working"];
    }

    return ["success", "working", "pending", "pending"];
  }

  return buildSequentialDetailStatuses(detailItems.length, 0);
};

const DETAIL_STATUS_LABELS = {
  success: "已完成",
  working: "进行中",
  pending: "待完成",
};

export const StepBar = ({ steps, orientation = "horizontal", stage, stagePhaseKey, workflow = [] }) => {
  const isVertical = orientation === "vertical";
  const workingStepIndex = steps.findIndex((step) => step.status === "working");
  const latestCompletedStepIndex = steps.reduce((latestIndex, step, index) => (
    step.status === "success" ? index : latestIndex
  ), -1);
  const expandedStepIndex = workingStepIndex >= 0 ? workingStepIndex : latestCompletedStepIndex;

  return (
    <aside
      className={`stepbar-panel relative z-10 min-h-0 overflow-hidden border border-cyan-400/35 bg-slate-950/38 shadow-[inset_0_0_30px_rgba(14,116,144,0.08),0_0_20px_rgba(8,47,73,0.2)] backdrop-blur-md ${
        isVertical ? "flex h-full flex-col rounded-xl p-3" : "mt-3 rounded-lg p-2"
      }`}
      aria-label="关键步骤展示"
    >
      {isVertical && (
        <div className="mb-3 shrink-0 border-b border-cyan-400/25 pb-2.5">
          <h2 className="text-center text-lg font-bold tracking-[0.08em] text-cyan-100 xl:text-xl">
            关键步骤展示
          </h2>
          <div className="mx-auto mt-2 h-px w-4/5 bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent" />
        </div>
      )}

      <div className={`stepbar-grid min-h-0 ${
        isVertical
          ? "flex flex-1 flex-col gap-2 overflow-y-auto pr-0.5"
          : "grid grid-cols-2 gap-2 md:grid-cols-5"
      }`}>
        {steps.map((step, stepIndex) => {
          const StepIcon = step.icon;
          const isDone = step.status === "success";
          const isWorking = step.status === "working";
          const detailItems = Number(stage) === 24 && step.id === "04"
            ? STAGE24_PLANNING_DETAIL_ITEMS
            : STEP_DETAIL_ITEMS[step.id] || [];
          const compactSubtitle = step.subtitle.split(" / ")[0];
          const isExpanded = isVertical && stepIndex === expandedStepIndex && detailItems.length > 0;
          const detailStatuses = getStepDetailStatuses({
            step,
            detailItems,
            stage,
            stagePhaseKey,
            workflow,
          });

          return (
            <div
              key={step.id}
              aria-expanded={isExpanded}
              style={isExpanded ? { height: `${104 + detailItems.length * 42}px` } : undefined}
              className={`stepbar-card relative flex overflow-hidden rounded-lg border bg-slate-900/45 shadow-md transition-colors ${
                isVertical
                  ? `${isExpanded ? "shrink-0" : "h-[72px] shrink-0 justify-center"} flex-col items-stretch gap-1.5 px-3 py-2`
                  : "items-center gap-3 px-3 py-1.5"
              } ${
                isDone
                  ? "border-emerald-500/75 shadow-[0_0_18px_rgba(16,185,129,0.2)]"
                  : isWorking
                    ? "border-amber-400/70 shadow-[0_0_18px_rgba(251,191,36,0.18)]"
                    : "border-blue-500/30"
              }`}
            >
              {(isDone || isWorking) && (
                <div className={`absolute bottom-0 left-0 top-0 w-1 ${
                  isDone
                    ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,1)]"
                    : "bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.9)]"
                }`} />
              )}
              <div className="flex min-w-0 items-center gap-3">
                <span className={`stepbar-id shrink-0 font-mono text-2xl font-bold ${
                  isDone ? "text-emerald-400 opacity-90" : isWorking ? "text-amber-300 opacity-90" : "text-blue-300 opacity-60"
                }`}>
                  {step.id}
                </span>
                <StepIcon className={`stepbar-icon shrink-0 ${isVertical ? "h-6 w-6" : "h-7 w-7"} ${
                  isDone ? "text-emerald-400" : isWorking ? "animate-pulse text-amber-300" : "text-blue-300/80"
                }`} />
                <div className={`stepbar-copy flex min-w-0 leading-none ${
                  isVertical ? "flex-1 flex-row items-center justify-between gap-2" : "flex-col gap-1"
                }`}>
                  <span className={`stepbar-title min-w-0 font-bold leading-tight text-blue-100 ${
                    isVertical ? "whitespace-nowrap text-base xl:text-[17px]" : "text-lg"
                  }`}>
                    {step.title}
                  </span>
                  <span className={`stepbar-subtitle shrink-0 font-semibold leading-tight ${isVertical ? "text-[11px] xl:text-xs" : "text-base"} ${
                    isDone ? "text-emerald-400" : isWorking ? "text-amber-300" : "text-blue-300/70"
                  }`}>
                    {isVertical ? compactSubtitle : step.subtitle}
                  </span>
                </div>
              </div>

              {isExpanded && (
                <div className={`ml-12 flex min-h-0 flex-1 flex-col border-t pt-2 ${
                  isDone ? "border-emerald-300/20" : "border-amber-300/20"
                }`}>
                  <ol className="grid min-h-0 flex-1 content-center gap-1.5">
                    {detailItems.map((detail, detailIndex) => {
                      const detailStatus = detailStatuses[detailIndex] || "pending";

                      return (
                        <li
                          key={detail}
                          data-status={detailStatus}
                          className={`flex min-w-0 items-center gap-2 rounded-md border px-2.5 py-2 text-sm font-semibold leading-[1.15] xl:text-base ${
                            detailStatus === "success"
                              ? "border-emerald-400/25 bg-emerald-400/[0.07] text-emerald-100"
                              : detailStatus === "working"
                                ? "border-amber-300/40 bg-amber-300/[0.08] text-amber-100 shadow-[inset_0_0_14px_rgba(251,191,36,0.04)]"
                                : "border-slate-500/20 bg-slate-800/20 text-slate-400"
                          }`}
                        >
                          <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border font-mono text-[10px] ${
                            detailStatus === "success"
                              ? "border-emerald-400/55 bg-emerald-400/15 text-emerald-300"
                              : detailStatus === "working"
                                ? "animate-pulse border-amber-300/60 bg-amber-300/15 text-amber-200"
                                : "border-slate-500/35 bg-slate-700/15 text-slate-500"
                          }`}>
                            {detailStatus === "success" ? "✓" : detailIndex + 1}
                          </span>
                          <span className="min-w-0 flex-1">{detail}</span>
                          <span className={`shrink-0 text-[11px] font-bold xl:text-xs ${
                            detailStatus === "success"
                              ? "text-emerald-400"
                              : detailStatus === "working"
                                ? "text-amber-300"
                                : "text-slate-500"
                          }`}>
                            {DETAIL_STATUS_LABELS[detailStatus]}
                          </span>
                        </li>
                      );
                    })}
                  </ol>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
};

const ValuePanelHeading = ({ title, children }) => (
  <header className="relative z-10 shrink-0 text-center">
    <h3 className="font-['Microsoft_YaHei','PingFang_SC',sans-serif] text-[21px] font-black leading-none tracking-[0.02em] text-[#f5c128] xl:text-[24px]">
      {title}
    </h3>
    <div className="mt-2 whitespace-nowrap font-['Microsoft_YaHei','PingFang_SC',sans-serif] text-[13px] font-medium leading-none text-slate-100 xl:text-[15px]">
      {children}
    </div>
  </header>
);

const HumanAgentTaskMap = () => (
  <div className="flex h-full min-h-0 flex-col items-center" aria-label="围绕人的群智协同任务拓扑">
    <div className="shrink-0 whitespace-nowrap text-center text-[11px] font-medium leading-[1.15] text-slate-100 xl:text-[13px]">
      <div>统一数字身份</div>
      <div className="mt-0.5 text-[#f5c128]">绑定SIM卡</div>
    </div>
    <div className="mt-1 flex min-h-0 w-full flex-1 items-center justify-center overflow-hidden px-[5%]">
      <img
        src={personalNetworkDiagram}
        alt="任务1、任务2和任务3围绕用户协同"
        className="block h-auto max-h-[110px] w-auto max-w-full object-contain xl:max-h-[118px]"
        draggable="false"
      />
    </div>
  </div>
);

const TokenChannel = () => {
  const nodes = [
    { label: '终端', Icon: Smartphone },
    { label: 'RAN', Icon: RadioTower },
    { label: '用户面', Icon: Network },
    { label: '算力/MaaS/工具', Icon: Cpu },
  ];

  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center pt-1">
      <div className="text-[17px] font-black leading-none text-[#f5c128] xl:text-[20px]">Token通道</div>
      <div className="mt-2 flex w-[72%] items-center justify-center" aria-label="终端到算力的Token通道">
        {nodes.map(({ label, Icon }, index) => (
          <div key={label} className="contents">
            {index > 0 && <span className="h-[3px] min-w-3 flex-1 bg-[#f5c128] shadow-[0_0_7px_rgba(245,193,40,0.28)]" />}
            <div className={`relative flex h-[36px] shrink-0 items-center justify-center border border-slate-500/70 bg-[#252c37] px-2 text-center text-[10px] font-medium leading-[1.05] text-slate-100 xl:h-[40px] xl:text-[12px] ${index === nodes.length - 1 ? 'w-[105px] xl:w-[124px]' : 'w-[52px] xl:w-[60px]'}`}>
              <Icon className="mr-1 h-3.5 w-3.5 shrink-0 text-slate-300" strokeWidth={1.5} />
              <span>{label}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-2 whitespace-nowrap text-center text-[11px] font-medium leading-tight text-slate-100 xl:text-[13px]">
        400KB 图片/视频上行传输，
        <span className="ml-1 text-[#f5c128]">E2E时延 &lt; 400ms</span>
      </div>
      <div className="mt-0.5 text-center text-[10px] font-medium leading-none text-slate-200 xl:text-[12px]">（多尔蒂阈值，类人交互）</div>
    </div>
  );
};

const AgentCommunicationMap = () => (
  <div className="flex h-full min-h-0 items-center justify-center overflow-hidden px-[7%] py-1" aria-label="智能体南北向与东西向通信拓扑">
    <img
      src={agentCommunicationDiagram}
      alt="人、手机和机器狗之间的智能体通信网络"
      className="block h-auto max-h-[110px] w-auto max-w-full object-contain xl:max-h-[118px]"
      draggable="false"
    />
  </div>
);

export const CoreNetworkValuePanel = () => (
  <section
    aria-label="核心网价值能力"
    className="core-network-value-panel relative z-10 mt-3 h-[22vh] min-h-[200px] max-h-[260px] shrink-0 overflow-hidden rounded-xl border border-white/[0.06] bg-[linear-gradient(105deg,#191b1a_0%,#171918_46%,#1a1c1b_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_10px_30px_rgba(0,0,0,0.32)]"
  >
    <div className="pointer-events-none absolute inset-0 opacity-[0.16] [background-image:radial-gradient(circle,rgba(255,255,255,0.22)_0.55px,transparent_0.7px)] [background-size:4px_4px]" />
    <div className="pointer-events-none absolute inset-y-3 left-[34.2%] w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />
    <div className="pointer-events-none absolute inset-y-3 left-[68.2%] w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />

    <div className="relative grid h-full grid-cols-[1.04fr_1.08fr_1fr]">
      <article className="grid min-w-0 grid-rows-[46px_minmax(0,1fr)] px-5 py-3">
        <ValuePanelHeading title="个人专网">通信对象：人 → 智能体</ValuePanelHeading>
        <div className="grid min-h-0 grid-cols-[max-content_minmax(180px,240px)] justify-center gap-3 pt-1 xl:gap-5">
          <div className="flex min-w-0 flex-col justify-center gap-6 whitespace-nowrap text-center text-[15px] font-black leading-tight text-[#f5c128] xl:text-[18px]">
            <div>跨生态安全互信</div>
            <div>围绕人的群智协同</div>
          </div>
          <HumanAgentTaskMap />
        </div>
      </article>

      <article className="grid min-w-0 grid-rows-[46px_minmax(0,1fr)] px-5 py-3">
        <ValuePanelHeading title="AI任务低时延">差异化体验保障：面向人 → 面向AI任务</ValuePanelHeading>
        <TokenChannel />
      </article>

      <article className="grid min-w-0 grid-rows-[46px_minmax(0,1fr)] px-5 py-3">
        <ValuePanelHeading title="智能体通信网络">数据路径：南-北 → 东-西</ValuePanelHeading>
        <div className="grid min-h-0 grid-cols-[minmax(170px,230px)_max-content] justify-center gap-4 pt-1 xl:gap-6">
          <AgentCommunicationMap />
          <div className="flex min-w-0 flex-col items-center justify-center text-center">
            <div className="whitespace-nowrap text-[17px] font-black leading-none text-[#f5c128] xl:text-[20px]">安全&nbsp;&nbsp;高效</div>
            <div className="mt-2 whitespace-nowrap text-[16px] font-black leading-none text-white xl:text-[19px]">免公网绕行</div>
          </div>
        </div>
      </article>
    </div>
  </section>
);
