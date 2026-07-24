import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Clipboard, Download, Play, Save, Square } from 'lucide-react';
import { getVideoResolutionTestResultsApiUrl } from '../config/runtimeUrls';

const TEST_PROFILES = [
  { width: 640, height: 480, fps: 15 },
  { width: 1280, height: 720, fps: 15 },
  { width: 1280, height: 720, fps: 30 },
  { width: 1920, height: 1080, fps: 15 },
  { width: 1920, height: 1080, fps: 30 },
];

const STREAM_TYPES = [
  { value: "raw", label: "Raw" },
  { value: "enhanced", label: "Enhanced" },
];

const buildCaseId = (profile, streamType) => (
  `${profile.width}x${profile.height}@${profile.fps}/${streamType}`
);

const buildProfileLabel = (profile) => (
  `${profile.width}x${profile.height}@${profile.fps}`
);

const buildEnvCommands = (profile) => [
  `export DOG_CAMERA_WIDTH=${profile.width}`,
  `export DOG_CAMERA_HEIGHT=${profile.height}`,
  `export DOG_CAMERA_FPS=${profile.fps}`,
  `export SANDBOX_VIDEO_OUTPUT_FPS=${profile.fps}`,
  `export SANDBOX_YOLO_INPUT_SIZE=${profile.width},${profile.height}`,
].join("\n");

const numericAverage = (values) => {
  const usableValues = values.filter((value) => Number.isFinite(value));
  if (!usableValues.length) {
    return 0;
  }
  return usableValues.reduce((sum, value) => sum + value, 0) / usableValues.length;
};

const lastNonZero = (samples, field) => {
  for (let index = samples.length - 1; index >= 0; index -= 1) {
    const value = Number(samples[index]?.[field]);
    if (Number.isFinite(value) && value > 0) {
      return value;
    }
  }
  return 0;
};

const deltaMetric = (samples, field) => {
  if (samples.length < 2) {
    return Number(samples[0]?.[field]) || 0;
  }
  const first = Number(samples[0]?.[field]) || 0;
  const last = Number(samples[samples.length - 1]?.[field]) || 0;
  return Math.max(0, last - first);
};

const summarizeSamples = (samples) => {
  const fpsValues = samples.map((sample) => Number(sample.framesPerSecond)).filter((value) => Number.isFinite(value));
  const bitrateValues = samples.map((sample) => Number(sample.bitrateKbps)).filter((value) => Number.isFinite(value) && value > 0);
  const jitterValues = samples.map((sample) => Number(sample.jitterMs)).filter((value) => Number.isFinite(value));

  return {
    actualFrameWidth: Math.round(lastNonZero(samples, "frameWidth")),
    actualFrameHeight: Math.round(lastNonZero(samples, "frameHeight")),
    avgFps: Number(numericAverage(fpsValues).toFixed(1)),
    minFps: fpsValues.length ? Number(Math.min(...fpsValues).toFixed(1)) : 0,
    avgBitrateKbps: Math.round(numericAverage(bitrateValues)),
    maxBitrateKbps: bitrateValues.length ? Math.round(Math.max(...bitrateValues)) : 0,
    framesDropped: deltaMetric(samples, "framesDropped"),
    packetsLost: deltaMetric(samples, "packetsLost"),
    avgJitterMs: Math.round(numericAverage(jitterValues)),
    maxJitterMs: jitterValues.length ? Math.round(Math.max(...jitterValues)) : 0,
    freezeCount: deltaMetric(samples, "freezeCount"),
    totalFreezeDurationMs: deltaMetric(samples, "totalFreezesDurationMs"),
  };
};

const formatNumber = (value, digits = 0) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return "--";
  }
  return parsed.toFixed(digits);
};

const downloadBlob = (filename, content, type) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

const resultsToCsv = (results) => {
  const rows = Object.values(results);
  const header = [
    "runId",
    "caseId",
    "streamType",
    "targetWidth",
    "targetHeight",
    "targetFps",
    "durationSec",
    "actualFrameWidth",
    "actualFrameHeight",
    "avgFps",
    "minFps",
    "avgBitrateKbps",
    "maxBitrateKbps",
    "framesDropped",
    "packetsLost",
    "avgJitterMs",
    "maxJitterMs",
    "freezeCount",
    "totalFreezeDurationMs",
    "clarity",
    "smoothness",
    "notes",
  ];
  const escapeCell = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
  return [
    header.join(","),
    ...rows.map((result) => [
      result.runId,
      result.caseId,
      result.streamType,
      result.target.width,
      result.target.height,
      result.target.fps,
      result.durationSec,
      result.browser.actualFrameWidth,
      result.browser.actualFrameHeight,
      result.browser.avgFps,
      result.browser.minFps,
      result.browser.avgBitrateKbps,
      result.browser.maxBitrateKbps,
      result.browser.framesDropped,
      result.browser.packetsLost,
      result.browser.avgJitterMs,
      result.browser.maxJitterMs,
      result.browser.freezeCount,
      result.browser.totalFreezeDurationMs,
      result.subjective.clarity,
      result.subjective.smoothness,
      result.subjective.notes,
    ].map(escapeCell).join(",")),
  ].join("\n");
};

const VideoResolutionTestPanel = ({ raw, enhanced }) => {
  const [selectedProfileIndex, setSelectedProfileIndex] = useState(1);
  const [durationSec, setDurationSec] = useState(120);
  const [runId] = useState(() => {
    const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\..+/, "");
    return `web-video-${stamp}`;
  });
  const [activeCase, setActiveCase] = useState(null);
  const [samples, setSamples] = useState([]);
  const [results, setResults] = useState({});
  const [saveState, setSaveState] = useState({});
  const [subjective, setSubjective] = useState({
    clarity: "good",
    smoothness: "good",
    notes: "",
  });
  const [nowMs, setNowMs] = useState(Date.now());
  const samplesRef = useRef([]);
  const lastStatsAtRef = useRef(0);
  const finishingRef = useRef(false);

  const selectedProfile = TEST_PROFILES[selectedProfileIndex] || TEST_PROFILES[0];
  const envCommands = useMemo(() => buildEnvCommands(selectedProfile), [selectedProfile]);
  const activeStats = activeCase?.streamType === "raw" ? raw?.stats : enhanced?.stats;
  const activeElapsedSec = activeCase ? Math.floor((nowMs - activeCase.startedAtMs) / 1000) : 0;
  const remainingSec = activeCase ? Math.max(0, Number(durationSec) - activeElapsedSec) : Number(durationSec);

  const submitResult = async (result) => {
    const response = await fetch(getVideoResolutionTestResultsApiUrl(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(result),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || payload?.ok !== true) {
      throw new Error(payload?.reason || `save_failed_${response.status}`);
    }
    return payload;
  };

  const finishCase = async () => {
    if (!activeCase || finishingRef.current) {
      return;
    }
    finishingRef.current = true;
    const caseSnapshot = activeCase;
    const collectedSamples = samplesRef.current;
    const caseId = buildCaseId(caseSnapshot.profile, caseSnapshot.streamType);
    const result = {
      runId,
      caseId,
      streamType: caseSnapshot.streamType,
      target: {
        width: caseSnapshot.profile.width,
        height: caseSnapshot.profile.height,
        fps: caseSnapshot.profile.fps,
      },
      config: {
        dogCameraWidth: caseSnapshot.profile.width,
        dogCameraHeight: caseSnapshot.profile.height,
        dogCameraFps: caseSnapshot.profile.fps,
        sandboxVideoOutputFps: caseSnapshot.profile.fps,
        sandboxYoloInputSize: `${caseSnapshot.profile.width},${caseSnapshot.profile.height}`,
      },
      durationSec: Math.max(1, Math.round((Date.now() - caseSnapshot.startedAtMs) / 1000)),
      browser: summarizeSamples(collectedSamples),
      samples: collectedSamples,
      subjective,
      createdAtMs: Date.now(),
    };

    setActiveCase(null);
    setResults((current) => ({ ...current, [caseId]: result }));
    setSaveState((current) => ({ ...current, [caseId]: { status: "saving" } }));
    try {
      const payload = await submitResult(result);
      setSaveState((current) => ({ ...current, [caseId]: { status: "saved", path: payload.path } }));
    } catch (error) {
      setSaveState((current) => ({ ...current, [caseId]: { status: "failed", reason: error.message } }));
    } finally {
      finishingRef.current = false;
    }
  };

  const startCase = (profile, streamType) => {
    samplesRef.current = [];
    lastStatsAtRef.current = 0;
    finishingRef.current = false;
    setSamples([]);
    setActiveCase({
      profile,
      streamType,
      startedAtMs: Date.now(),
    });
  };

  useEffect(() => {
    if (!activeCase) {
      return undefined;
    }
    const timerId = window.setInterval(() => setNowMs(Date.now()), 500);
    return () => window.clearInterval(timerId);
  }, [activeCase]);

  useEffect(() => {
    if (!activeCase || !activeStats?.updatedAtMs) {
      return;
    }
    if (activeStats.updatedAtMs === lastStatsAtRef.current) {
      return;
    }
    lastStatsAtRef.current = activeStats.updatedAtMs;
    const nextSample = {
      ...activeStats,
      collectedAtMs: Date.now(),
      elapsedMs: Date.now() - activeCase.startedAtMs,
    };
    samplesRef.current = [...samplesRef.current, nextSample];
    setSamples(samplesRef.current);
  }, [activeCase, activeStats]);

  useEffect(() => {
    if (activeCase && remainingSec <= 0) {
      finishCase();
    }
  }, [activeCase, remainingSec]);

  const downloadJson = () => {
    downloadBlob(`${runId}.json`, JSON.stringify(Object.values(results), null, 2), "application/json");
  };

  const downloadCsv = () => {
    downloadBlob(`${runId}.csv`, resultsToCsv(results), "text/csv;charset=utf-8");
  };

  const copyEnvCommands = async () => {
    await navigator.clipboard?.writeText(envCommands);
  };

  const currentSummary = summarizeSamples(samples);
  const hasResults = Object.keys(results).length > 0;

  return (
    <div className="rounded-xl border border-cyan-400/30 bg-slate-950/58 p-3 text-cyan-50 shadow-[inset_0_0_18px_rgba(34,211,238,0.08)] backdrop-blur-md">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <div className="text-sm font-black tracking-wide text-cyan-100">网页视频分辨率测试</div>
          <div className="font-mono text-[10px] text-cyan-200/65">{runId}</div>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            className="grid h-8 w-8 place-items-center rounded border border-cyan-300/30 bg-cyan-950/40 text-cyan-100 transition hover:border-cyan-100"
            onClick={downloadJson}
            disabled={!hasResults}
            title="下载 JSON"
          >
            <Download className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="grid h-8 w-8 place-items-center rounded border border-cyan-300/30 bg-cyan-950/40 text-cyan-100 transition hover:border-cyan-100"
            onClick={downloadCsv}
            disabled={!hasResults}
            title="下载 CSV"
          >
            <Save className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mb-3 grid grid-cols-2 gap-1.5 xl:grid-cols-5">
        {TEST_PROFILES.map((profile, index) => (
          <button
            key={buildProfileLabel(profile)}
            type="button"
            className={`rounded border px-2 py-1.5 text-left font-mono text-[10px] transition ${
              selectedProfileIndex === index
                ? "border-cyan-200 bg-cyan-300/18 text-cyan-50"
                : "border-cyan-400/20 bg-slate-950/35 text-cyan-100/72 hover:border-cyan-300/55"
            }`}
            onClick={() => setSelectedProfileIndex(index)}
          >
            {buildProfileLabel(profile)}
          </button>
        ))}
      </div>

      <div className="mb-3 grid gap-2 lg:grid-cols-[1fr_112px]">
        <pre className="min-h-[96px] overflow-auto rounded border border-cyan-400/20 bg-black/35 p-2 font-mono text-[10px] leading-relaxed text-emerald-100">
          {envCommands}
        </pre>
        <div className="flex flex-row gap-2 lg:flex-col">
          <button
            type="button"
            className="flex flex-1 items-center justify-center gap-1 rounded border border-emerald-300/35 bg-emerald-950/45 px-2 py-2 text-[10px] font-bold text-emerald-100 transition hover:border-emerald-100"
            onClick={copyEnvCommands}
          >
            <Clipboard className="h-3.5 w-3.5" />
            ENV
          </button>
          <label className="flex flex-1 flex-col gap-1 rounded border border-cyan-400/20 bg-slate-950/35 px-2 py-1 text-[10px] text-cyan-100/70">
            Seconds
            <input
              className="w-full rounded border border-cyan-400/20 bg-slate-950 px-1 py-1 font-mono text-cyan-50 outline-none"
              type="number"
              min="10"
              max="600"
              value={durationSec}
              onChange={(event) => setDurationSec(Math.max(10, Number(event.target.value) || 120))}
            />
          </label>
        </div>
      </div>

      <div className="mb-3 grid gap-2 md:grid-cols-2">
        {STREAM_TYPES.map(({ value, label }) => {
          const stream = value === "raw" ? raw : enhanced;
          const stats = stream?.stats;
          const profile = selectedProfile;
          const caseId = buildCaseId(profile, value);
          const isActive = activeCase?.streamType === value;
          const saved = saveState[caseId];
          return (
            <div key={value} className="rounded border border-cyan-400/20 bg-slate-950/35 p-2">
              <div className="mb-2 flex items-center justify-between gap-2">
                <div>
                  <div className="text-xs font-black text-cyan-100">{label}</div>
                  <div className="font-mono text-[10px] text-cyan-200/65">{formatNumber(stats?.frameWidth)}x{formatNumber(stats?.frameHeight)} / {formatNumber(stats?.framesPerSecond, 1)}fps</div>
                </div>
                {isActive ? (
                  <button
                    type="button"
                    className="grid h-8 w-8 place-items-center rounded border border-rose-300/45 bg-rose-950/45 text-rose-100"
                    onClick={finishCase}
                    title="停止采样"
                  >
                    <Square className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    className="grid h-8 w-8 place-items-center rounded border border-emerald-300/45 bg-emerald-950/45 text-emerald-100 disabled:opacity-40"
                    onClick={() => startCase(profile, value)}
                    disabled={Boolean(activeCase)}
                    title="开始采样"
                  >
                    <Play className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-3 gap-1 font-mono text-[10px] text-cyan-100/80">
                <span className="rounded bg-black/25 px-1.5 py-1">{formatNumber(stats?.bitrateKbps)}kbps</span>
                <span className="rounded bg-black/25 px-1.5 py-1">drop {formatNumber(stats?.framesDropped)}</span>
                <span className="rounded bg-black/25 px-1.5 py-1">jit {formatNumber(stats?.jitterMs)}ms</span>
              </div>
              <div className="mt-2 h-4 font-mono text-[10px] text-cyan-200/70">
                {saved?.status === "saved" && "saved"}
                {saved?.status === "saving" && "saving"}
                {saved?.status === "failed" && `failed: ${saved.reason}`}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mb-3 grid gap-2 md:grid-cols-3">
        <label className="text-[10px] text-cyan-100/70">
          Clarity
          <select
            className="mt-1 w-full rounded border border-cyan-400/20 bg-slate-950 px-2 py-1.5 text-cyan-50"
            value={subjective.clarity}
            onChange={(event) => setSubjective((current) => ({ ...current, clarity: event.target.value }))}
          >
            <option value="good">good</option>
            <option value="ok">ok</option>
            <option value="bad">bad</option>
          </select>
        </label>
        <label className="text-[10px] text-cyan-100/70">
          Smoothness
          <select
            className="mt-1 w-full rounded border border-cyan-400/20 bg-slate-950 px-2 py-1.5 text-cyan-50"
            value={subjective.smoothness}
            onChange={(event) => setSubjective((current) => ({ ...current, smoothness: event.target.value }))}
          >
            <option value="good">good</option>
            <option value="ok">ok</option>
            <option value="bad">bad</option>
          </select>
        </label>
        <label className="text-[10px] text-cyan-100/70">
          Notes
          <input
            className="mt-1 w-full rounded border border-cyan-400/20 bg-slate-950 px-2 py-1.5 text-cyan-50 outline-none"
            value={subjective.notes}
            onChange={(event) => setSubjective((current) => ({ ...current, notes: event.target.value }))}
          />
        </label>
      </div>

      <div className="grid grid-cols-4 gap-1.5 font-mono text-[10px] text-cyan-100/85">
        <span className="rounded border border-cyan-400/15 bg-black/25 px-2 py-1">left {remainingSec}s</span>
        <span className="rounded border border-cyan-400/15 bg-black/25 px-2 py-1">avg {formatNumber(currentSummary.avgFps, 1)}fps</span>
        <span className="rounded border border-cyan-400/15 bg-black/25 px-2 py-1">max {formatNumber(currentSummary.maxBitrateKbps)}kbps</span>
        <span className="rounded border border-cyan-400/15 bg-black/25 px-2 py-1">freezes {formatNumber(currentSummary.freezeCount)}</span>
      </div>
    </div>
  );
};

export default VideoResolutionTestPanel;
