import { ChevronRight, Network, ShieldAlert, ShieldCheck, User } from 'lucide-react';

export const LeftPanel = ({ effectiveStageConfig, stage, components }) => {
  const {
    ARGlasses,
    ArRegistrationPanel,
    BackgroundVideoPanel,
    DogVisionStreams,
    HandoffPanel,
    RobotDog,
    SciFiPanel,
  } = components;

  return (
    <>
                {/* 左列：机器狗接入 */}
                <div>
                  <SciFiPanel className="h-full">
                    <div className="flex flex-col h-full">
                      <h2 className="text-blue-100 text-lg lg:text-xl font-bold text-center mb-4 pb-3 border-b border-blue-500/30">
                        {effectiveStageConfig.leftPanelTitle}
                      </h2>
                
                      <div className="flex flex-col flex-1 gap-2">
                        {Number(stage) >= 7 && (
                          <BackgroundVideoPanel visible={Boolean(effectiveStageConfig.showBackgroundVideo)} />
                        )}
                        {effectiveStageConfig.showArRegistration ? (
                          <ArRegistrationPanel />
                        ) : effectiveStageConfig.showBackgroundVideo ? (
                          null
                        ) : effectiveStageConfig.showHandoff ? (
                          <HandoffPanel />
                        ) : effectiveStageConfig.showDogVision || effectiveStageConfig.showEnhancedDogVision ? (
                          <DogVisionStreams
                            showEnhanced={Boolean(effectiveStageConfig.showEnhancedDogVision)}
                            preloadEnhanced={Number(stage) >= 5}
                          />
                        ) : effectiveStageConfig.showHomeDomainDevice && effectiveStageConfig.homeDomainDevicesReady === false ? (
                          <div className="flex-1 min-h-[424px] rounded-xl border border-emerald-500/20 bg-slate-950/10 backdrop-blur-md" aria-hidden="true" />
                        ) : effectiveStageConfig.showHomeDomainDevice ? (
                          <>
                          <div className={`border border-emerald-500/30 bg-slate-950/10 backdrop-blur-md flex flex-col overflow-hidden rounded-xl p-3 relative ${
                            effectiveStageConfig.showRegisteredDevice
                              ? "flex-1 h-[180px] lg:h-[210px]"
                              : "flex-1 h-[180px] lg:h-[210px]"
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

                              <div className="absolute bottom-1 left-1 w-28 lg:w-32 h-24 lg:h-28 z-10">
                                <ARGlasses className="w-full h-full object-contain" />
                              </div>

                              <div className="absolute top-1 right-1 w-[64%] max-w-[190px] origin-top-right bg-emerald-950/80 border border-cyan-400/50 p-2 sm:p-2.5 rounded-lg backdrop-blur-md shadow-[0_0_15px_rgba(16,185,129,0.3)] z-20 animate-hologram [transform:perspective(500px)_rotateY(-15deg)_rotateX(8deg)_scale(1.5)] leading-tight text-emerald-300">
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
                            <div className="flex-1 h-[180px] lg:h-[210px] opacity-0 pointer-events-none" aria-hidden="true" />
                          )}
                          </>
                        ) : (
                          <>
                            {/* === 未注册设备 (红色全息光锥投影) === */}
                            <div className={`border border-red-500/30 bg-red-950/10 backdrop-blur-md flex flex-col overflow-hidden rounded-xl p-3 relative ${
                              effectiveStageConfig.showRegisteredDevice
                                ? "flex-1 h-[180px] lg:h-[210px]"
                                : "flex-1 h-[180px] lg:h-[210px]"
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
                                <div className="absolute bottom-1 left-1 w-28 lg:w-32 h-24 lg:h-28 z-10">
                                  <RobotDog className="w-full h-full object-contain" status="unregistered" />
                                </div>

                                {/* 3D 悬浮红色警示全息牌 (靠右侧，朝狗身侧上方倾斜) */}
                                <div className="absolute top-1 right-1 w-[64%] max-w-[190px] origin-top-right bg-red-950/80 border border-red-500/50 p-2 sm:p-2.5 rounded-lg backdrop-blur-md shadow-[0_0_15px_rgba(239,68,68,0.25)] z-20 animate-hologram-red [transform:perspective(500px)_rotateY(-15deg)_rotateX(8deg)_scale(1.5)] text-red-300 leading-tight">
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
                              <div className="flex-1 h-[180px] lg:h-[210px] opacity-0 pointer-events-none" aria-hidden="true" />
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
                            <div className="border border-emerald-500/30 bg-slate-950/10 backdrop-blur-md flex-1 flex flex-col h-[180px] lg:h-[210px] overflow-hidden rounded-xl p-3 relative">
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
                                <div className="absolute bottom-1 left-1 w-28 lg:w-32 h-24 lg:h-28 z-10">
                                  <RobotDog className="w-full h-full object-contain" status="registered" />
                                </div>

                                {/* 3D 浮空倾斜全息卡片 (跟在机器狗身侧上部，带透视翻折) */}
                                <div className="absolute top-1 right-1 w-[64%] max-w-[190px] origin-top-right bg-emerald-950/80 border border-cyan-400/50 p-2 sm:p-2.5 rounded-lg backdrop-blur-md shadow-[0_0_15px_rgba(16,185,129,0.3)] z-20 animate-hologram [transform:perspective(500px)_rotateY(-15deg)_rotateX(8deg)_scale(1.5)] leading-tight text-emerald-300">
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
                          <div className="border border-emerald-500/30 bg-slate-950/10 backdrop-blur-md flex-1 flex flex-col h-[180px] lg:h-[210px] overflow-hidden rounded-xl p-3 relative">
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

                              <div className="absolute bottom-1 left-1 w-28 lg:w-32 h-24 lg:h-28 z-10">
                                <RobotDog className="w-full h-full object-contain" status="registered" />
                              </div>

                              <div className="absolute top-1 right-1 w-[64%] max-w-[190px] origin-top-right bg-emerald-950/80 border border-cyan-400/50 p-2 sm:p-2.5 rounded-lg backdrop-blur-md shadow-[0_0_15px_rgba(16,185,129,0.3)] z-20 animate-hologram [transform:perspective(500px)_rotateY(-15deg)_rotateX(8deg)_scale(1.5)] leading-tight text-emerald-300">
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

export const RightPanel = ({ effectiveStageConfig, latencySeries, bandwidthSeries, stage, components, networkRecoveryDemo }) => {
  const {
    BandwidthChart,
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
              {stage === 9 ? "已完成任务" : "实时状态"}
            </h2>
            {stage === 9 ? (
              <CompletedTasksPanel />
            ) : (
              <div className="flex min-h-0 flex-1 flex-col gap-4">
                {/* 子栏目 1: 实时状态 */}
                <div className="flex-none border border-blue-500/30 rounded-lg p-3.5 bg-slate-900/30 backdrop-blur-md flex flex-col justify-center shadow-md">
                  {stage === 8 ? (
                    <>
                      {networkRecoveryDemo ? (
                        <div className="mb-3 rounded border border-cyan-300/35 bg-slate-950/55 p-3">
                          <button
                            type="button"
                            disabled={networkRecoveryDemo.disabled}
                            onClick={networkRecoveryDemo.onStart}
                            className="w-full rounded border border-cyan-300/60 bg-cyan-400/15 px-3 py-2 text-sm font-bold text-cyan-50 transition hover:bg-cyan-300/25 disabled:cursor-not-allowed disabled:border-slate-500/40 disabled:bg-slate-800/50 disabled:text-slate-400"
                          >
                            {networkRecoveryDemo.pending ? "启动中..." : "模拟网络拥塞恢复"}
                          </button>
                          {networkRecoveryDemo.error ? (
                            <div className="mt-2 text-xs text-amber-200">{networkRecoveryDemo.error}</div>
                          ) : null}
                        </div>
                      ) : null}
                      <LatencyChart points={latencySeries.points} error={latencySeries.error} />
                      {BandwidthChart && bandwidthSeries ? (
                        <BandwidthChart
                          points={bandwidthSeries.points}
                          error={bandwidthSeries.error}
                          unit={bandwidthSeries.unit}
                        />
                      ) : null}
                    </>
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

export const StepBar = ({ steps }) => (
  <>
    {/* 底部步骤条 - 升级为精致高对比度毛玻璃条 */}
    <div className="stepbar-grid mt-8 grid grid-cols-2 md:grid-cols-5 gap-3 relative z-10">
      {steps.map((step) => {
        const StepIcon = step.icon;
        const isDone = step.status === "success";
        const isWorking = step.status === "working";

        return (
          <div
            key={step.id}
            className={`stepbar-card border bg-slate-900/30 backdrop-blur-md rounded-lg px-3.5 py-2 flex items-center gap-3 relative overflow-hidden shadow-md ${
              isDone
                ? "border-emerald-500/80 shadow-[0_0_18px_rgba(16,185,129,0.25)]"
                : isWorking
                  ? "border-amber-400/70 shadow-[0_0_18px_rgba(251,191,36,0.18)]"
                  : "border-blue-500/30"
            }`}
          >
            {(isDone || isWorking) && (
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                isDone
                  ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,1)]"
                  : "bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.9)]"
              }`} />
            )}
            <span className={`stepbar-id shrink-0 font-mono font-bold text-2xl ${
              isDone ? "text-emerald-400 opacity-90" : isWorking ? "text-amber-300 opacity-90" : "text-blue-300 opacity-60"
            }`}>
              {step.id}
            </span>
            <StepIcon className={`stepbar-icon w-7 h-7 shrink-0 ${
              isDone ? "text-emerald-400" : isWorking ? "text-amber-300 animate-pulse" : "text-blue-300/80"
            }`} />
            <div className="stepbar-copy flex min-w-0 flex-col gap-0 leading-none">
              <span className="stepbar-title text-blue-100 font-bold text-lg leading-[1.05]">{step.title}</span>
              <span className={`stepbar-subtitle text-base font-semibold leading-[1.05] ${isDone ? "text-emerald-400" : isWorking ? "text-amber-300" : "text-blue-300/70"}`}>
                {step.subtitle}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  </>
);
