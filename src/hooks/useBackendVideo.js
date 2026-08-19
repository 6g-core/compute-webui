import { useEffect, useRef, useState } from 'react';
import { buildRuntimeBackendUrl, getRuntimeConfig, getSandboxHealthApiUrl } from '../config/runtimeUrls';

const waitForIceGathering = (pc) => {
  if (pc.iceGatheringState === "complete") {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const timeout = window.setTimeout(() => {
      pc.removeEventListener("icegatheringstatechange", onStateChange);
      resolve();
    }, 3000);

    const onStateChange = () => {
      if (pc.iceGatheringState === "complete") {
        window.clearTimeout(timeout);
        pc.removeEventListener("icegatheringstatechange", onStateChange);
        resolve();
      }
    };
    pc.addEventListener("icegatheringstatechange", onStateChange);
  });
};

const getWebRtcOfferUrl = () => {
  const runtimeConfig = getRuntimeConfig();
  const configuredUrl = runtimeConfig.webRtcSignalUrl || import.meta.env.VITE_WEBRTC_SIGNAL_URL;
  if (configuredUrl) {
    return configuredUrl;
  }

  return buildRuntimeBackendUrl("sandboxApiUrl", "sandboxPort", 8787, "/api/v1/web/sdp/offer", "sandboxHost");
};

const getDogVisionOfferUrl = () => {
  const runtimeConfig = getRuntimeConfig();
  const configuredUrl = runtimeConfig.dogWebRtcSignalUrl || import.meta.env.VITE_DOG_WEBRTC_SIGNAL_URL;
  if (configuredUrl) {
    return configuredUrl;
  }

  return getWebRtcOfferUrl();
};

const getDogEnhancedOfferUrl = () => {
  const runtimeConfig = getRuntimeConfig();
  const configuredUrl = runtimeConfig.dogEnhancedWebRtcSignalUrl || import.meta.env.VITE_DOG_ENHANCED_WEBRTC_SIGNAL_URL;
  if (configuredUrl) {
    return configuredUrl;
  }

  return getWebRtcOfferUrl();
};

const isLocalNetworkHost = (hostname) => {
  if (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "::1"
  ) {
    return true;
  }

  const ipv4Match = hostname.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!ipv4Match) {
    return false;
  }

  const octets = ipv4Match.slice(1).map(Number);
  if (octets.some((octet) => octet < 0 || octet > 255)) {
    return false;
  }

  const [first, second] = octets;
  return (
    first === 10 ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 168) ||
    (first === 169 && second === 254)
  );
};

const getWebRtcIceServers = () => {
  if (isLocalNetworkHost(window.location.hostname)) {
    return [];
  }

  return [
    {
      urls: [
        "stun:101.245.78.174:28002",
        "turn:101.245.78.174:28002?transport=udp",
        "turn:101.245.78.174:28002?transport=tcp",
      ],
      username: "cloudproxy",
      credential: "f41bd6b00f9fe5b5980197d793699aea",
    },
  ];
};

const connectBackendVideoPeer = async (pc, offerUrl, clientId, streamType) => {
  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  await waitForIceGathering(pc);

  const localDescription = pc.localDescription || offer;
  const response = await fetch(offerUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: clientId,
      ...(streamType ? { streamType } : {}),
      sdp_offer: {
        type: localDescription.type,
        sdp: localDescription.sdp,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`WebRTC offer failed: ${response.status}`);
  }

  const payload = await response.json();
  if (!payload?.sdp_answer) {
    throw new Error("WebRTC answer missing sdp_answer");
  }

  if (pc.signalingState === "closed") {
    return;
  }

  await pc.setRemoteDescription(payload.sdp_answer);
};

const DOG_VIDEO_HEALTH_POLL_MS = 500;
const DOG_VIDEO_CONNECT_TIMEOUT_MS = 10000;

const getDogVideoGateState = (health, hasError = false) => {
  if (hasError) {
    return "waiting-sandbox";
  }
  if (!health) {
    return "waiting-task";
  }
  if (!health.streamRequested) {
    return "waiting-task";
  }
  if (!health.videoReady) {
    return "waiting-stream";
  }
  return "ready";
};

const isDogVideoReadyForOffer = (health) => (
  health?.ok === true
  && health?.streamRequested === true
  && health?.videoReady === true
);

const useDogVideoOfferGate = (enabled = true) => {
  const [snapshot, setSnapshot] = useState({
    health: null,
    ready: false,
    state: enabled ? "waiting-task" : "idle",
  });

  useEffect(() => {
    if (!enabled) {
      setSnapshot({
        health: null,
        ready: false,
        state: "idle",
      });
      return undefined;
    }

    let disposed = false;
    let timerId = null;

    const poll = async () => {
      try {
        const response = await fetch(getSandboxHealthApiUrl(), { cache: "no-store" });
        if (!response.ok) {
          throw new Error(`Sandbox health failed: ${response.status}`);
        }

        const health = await response.json();
        if (!disposed) {
          const ready = isDogVideoReadyForOffer(health);
          setSnapshot({
            health,
            ready,
            state: ready ? "ready" : getDogVideoGateState(health),
          });
        }
      } catch (error) {
        console.error("Sandbox health polling failed", error);
        if (!disposed) {
          setSnapshot((current) => ({
            health: current.health,
            ready: false,
            state: getDogVideoGateState(current.health, true),
          }));
        }
      }

      if (!disposed) {
        timerId = window.setTimeout(poll, DOG_VIDEO_HEALTH_POLL_MS);
      }
    };

    poll();

    return () => {
      disposed = true;
      if (timerId !== null) {
        window.clearTimeout(timerId);
      }
    };
  }, [enabled]);

  return snapshot;
};

const formatVideoState = (state) => {
  if (state === "receiving" || state === "connected") {
    return "Live";
  }

  const labels = {
    idle: "Idle",
    ready: "Ready",
    connecting: "Connecting",
    failed: "Failed",
    disconnected: "Disconnected",
    closed: "Closed",
    "waiting-task": "Waiting task",
    "waiting-dog": "Waiting dog",
    "waiting-stream": "Waiting stream",
    "waiting-sandbox": "Waiting sandbox",
  };

  return labels[state] || state;
};

const useBackendVideoStream = ({
  enabled,
  ready,
  gateState,
  streamEpoch,
  offerUrl,
  clientId,
  streamType,
  label,
  attachKey,
}) => {
  const videoRef = useRef(null);
  const [state, setState] = useState(enabled ? "waiting-task" : "idle");
  const [stream, setStream] = useState(null);
  const [retryToken, setRetryToken] = useState(0);

  useEffect(() => {
    if (!enabled) {
      setState("idle");
      setStream(null);
      setRetryToken(0);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      return;
    }

    if (!ready) {
      setState(gateState);
      setStream(null);
      setRetryToken(0);
    }
  }, [enabled, gateState, ready]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      if (stream) {
        videoRef.current.play?.().catch((error) => {
          console.warn(`${label} video playback did not start immediately`, error);
        });
      }
    }
  }, [attachKey, label, stream]);

  useEffect(() => {
    if (!enabled || !ready) {
      return undefined;
    }

    let disposed = false;
    let retryTimer = null;
    let connectTimeout = null;
    let receivedTrack = false;
    const iceServers = getWebRtcIceServers();
    const pc = new RTCPeerConnection({
      iceServers,
      iceTransportPolicy: iceServers.length ? "relay" : "all",
    });
    setState("connecting");

    const clearScheduledRetry = () => {
      if (retryTimer !== null) {
        window.clearTimeout(retryTimer);
        retryTimer = null;
      }
    };

    const clearConnectTimeout = () => {
      if (connectTimeout !== null) {
        window.clearTimeout(connectTimeout);
        connectTimeout = null;
      }
    };

    const scheduleRetry = (delayMs = 1200) => {
      if (disposed || retryTimer !== null) {
        return;
      }

      retryTimer = window.setTimeout(() => {
        retryTimer = null;
        if (!disposed) {
          setRetryToken((token) => token + 1);
        }
      }, delayMs);
    };

    const closeAndRetry = (reason, delayMs = 1200) => {
      if (disposed) {
        return;
      }

      console.warn(`${label} WebRTC retrying: ${reason}`, {
        clientId,
        connectionState: pc.connectionState,
        iceConnectionState: pc.iceConnectionState,
        signalingState: pc.signalingState,
      });
      clearConnectTimeout();
      setState("failed");
      scheduleRetry(delayMs);
      pc.close();
    };

    pc.addTransceiver("video", { direction: "recvonly" });

    pc.onconnectionstatechange = () => {
      if (!disposed) {
        setState(pc.connectionState);
        if (["connected", "connecting"].includes(pc.connectionState)) {
          clearScheduledRetry();
        } else if (pc.connectionState === "disconnected") {
          scheduleRetry(10000);
        } else if (["failed", "closed"].includes(pc.connectionState)) {
          clearConnectTimeout();
          scheduleRetry();
        }
      }
    };

    pc.ontrack = (event) => {
      if (!disposed) {
        receivedTrack = true;
        clearConnectTimeout();
        setStream(event.streams[0]);
        setState("receiving");
      }
    };

    connectTimeout = window.setTimeout(() => {
      if (!receivedTrack) {
        closeAndRetry("timed out before video track arrived");
      }
    }, DOG_VIDEO_CONNECT_TIMEOUT_MS);

    const connect = async () => {
      try {
        await connectBackendVideoPeer(pc, offerUrl, clientId, streamType);
      } catch (error) {
        console.error(`${label} WebRTC connection failed`, error);
        if (!disposed) {
          setState("failed");
          scheduleRetry();
        }
        pc.close();
      }
    };

    connect();

    return () => {
      disposed = true;
      clearScheduledRetry();
      clearConnectTimeout();
      setStream(null);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      pc.close();
    };
  }, [clientId, enabled, gateState, label, offerUrl, ready, retryToken, streamEpoch, streamType]);

  return { state, videoRef, hasStream: Boolean(stream) };
};


export {
  connectBackendVideoPeer,
  formatVideoState,
  getDogEnhancedOfferUrl,
  getDogVideoGateState,
  getDogVisionOfferUrl,
  getWebRtcIceServers,
  getWebRtcOfferUrl,
  isDogVideoReadyForOffer,
  useBackendVideoStream,
  useDogVideoOfferGate,
  waitForIceGathering,
};
