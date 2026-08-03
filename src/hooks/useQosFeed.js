import { useEffect, useState } from 'react';
import { getQosPushChannelUrl } from '../config/runtimeUrls.js';
import { parseQosPushPayload } from '../utils/qosPayloads.js';

const EMPTY_QOS_STATE = {
  metrics: [],
  dialogItems: [],
  error: null,
};

export const useQosFeed = (enabled) => {
  const [qosState, setQosState] = useState(EMPTY_QOS_STATE);

  useEffect(() => {
    if (!enabled) {
      setQosState(EMPTY_QOS_STATE);
      return undefined;
    }

    if (typeof EventSource === "undefined") {
      setQosState((current) => ({
        ...current,
        error: "EventSource is not available",
      }));
      return undefined;
    }

    const source = new EventSource(getQosPushChannelUrl());

    const handleMessage = (event) => {
      try {
        const parsed = parseQosPushPayload(JSON.parse(event.data));

        if (parsed.type === "metrics") {
          setQosState((current) => ({
            ...current,
            metrics: parsed.metrics,
            error: null,
          }));
          return;
        }

        if (parsed.type === "dialogImages") {
          setQosState((current) => ({
            ...current,
            dialogItems: parsed.dialogItems,
            error: null,
          }));
        }
      } catch (parseError) {
        setQosState((current) => ({
          ...current,
          error: parseError instanceof Error ? parseError.message : "Invalid QoS push payload",
        }));
      }
    };

    source.addEventListener("qos", handleMessage);
    source.onmessage = handleMessage;
    source.onerror = () => {
      setQosState((current) => ({
        ...current,
        error: "QoS push channel disconnected",
      }));
    };

    return () => {
      source.removeEventListener("qos", handleMessage);
      source.close();
    };
  }, [enabled]);

  return qosState;
};
