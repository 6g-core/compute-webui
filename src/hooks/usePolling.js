import { useEffect, useState } from 'react';
import { getArStatusApiUrl, getLatencyApiUrl, getStageApiUrl } from '../config/runtimeUrls';
import {
  appendLatencyPoint,
  parseArLastWhisper,
  parseLatencyPayload,
  parseStagePayload,
} from '../utils/pollingPayloads';

const useStagePolling = () => {
  const [stage, setStage] = useState(1);
  const [connectionState, setConnectionState] = useState("connecting");
  const [error, setError] = useState(null);

  useEffect(() => {
    let disposed = false;
    let isPolling = false;

    const pollStage = async () => {
      if (isPolling) {
        return;
      }

      isPolling = true;

      try {
        const response = await fetch(getStageApiUrl(), {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`Stage API failed: ${response.status}`);
        }

        const contentType = response.headers.get("content-type") || "";
        if (!contentType.includes("application/json")) {
          throw new Error("Stage API did not return JSON");
        }

        const payload = await response.json();
        const nextStage = parseStagePayload(payload);

        if (!disposed) {
          setStage(nextStage);
          setConnectionState("connected");
          setError(null);
        }
      } catch (stageError) {
        if (!disposed) {
          setConnectionState("error");
          setError(stageError.message);
        }
      } finally {
        isPolling = false;
      }
    };

    pollStage();
    const interval = window.setInterval(pollStage, 1000);

    return () => {
      disposed = true;
      window.clearInterval(interval);
    };
  }, []);

  return { stage, connectionState, error };
};

const useArLastWhisper = () => {
  const [lastWhisper, setLastWhisper] = useState("");

  useEffect(() => {
    let disposed = false;
    let isPolling = false;

    const pollArStatus = async () => {
      if (isPolling) {
        return;
      }

      isPolling = true;

      try {
        const response = await fetch(getArStatusApiUrl(), {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`AR status API failed: ${response.status}`);
        }

        const payload = await response.json();
        const nextWhisper = parseArLastWhisper(payload);
        if (!disposed) {
          setLastWhisper(nextWhisper);
        }
      } catch (arStatusError) {
        console.error("AR status polling failed", arStatusError);
      } finally {
        isPolling = false;
      }
    };

    pollArStatus();
    const interval = window.setInterval(pollArStatus, 1000);

    return () => {
      disposed = true;
      window.clearInterval(interval);
    };
  }, []);

  return lastWhisper;
};

const useLatencySeries = (enabled) => {
  const [points, setPoints] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    let disposed = false;
    let isPolling = false;

    if (!enabled) {
      setPoints([]);
      setError(null);
      return undefined;
    }

    const pollLatency = async () => {
      if (isPolling) {
        return;
      }

      isPolling = true;

      try {
        const response = await fetch(getLatencyApiUrl(), {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`Latency API failed: ${response.status}`);
        }

        const point = parseLatencyPayload(await response.json());

        if (!disposed) {
          setPoints((current) => appendLatencyPoint(current, point));
          setError(null);
        }
      } catch (latencyError) {
        if (!disposed) {
          setError(latencyError.message);
        }
      } finally {
        isPolling = false;
      }
    };

    pollLatency();
    const interval = window.setInterval(pollLatency, 1000);

    return () => {
      disposed = true;
      window.clearInterval(interval);
    };
  }, [enabled]);

  return { points, error };
};


export { useArLastWhisper, useLatencySeries, useStagePolling };
