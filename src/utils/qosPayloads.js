const HORIZONTAL_IMAGE_PLACEMENTS = new Set(["left", "right"]);
const VERTICAL_IMAGE_PLACEMENTS = new Set(["above", "below"]);
const VALID_IMAGE_PLACEMENTS = new Set([
  ...HORIZONTAL_IMAGE_PLACEMENTS,
  ...VERTICAL_IMAGE_PLACEMENTS,
]);
const SUPPORTED_DATA_IMAGE_PATTERN = /^data:image\/(?:png|jpeg|gif);base64,[A-Za-z0-9+/=]+$/i;

const hasOwn = (payload, key) => Object.prototype.hasOwnProperty.call(payload, key);

const toFiniteNumber = (value, fieldName) => {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    throw new Error(`QoS payload ${fieldName} must be a finite number`);
  }
  return numericValue;
};

const normalizeTimestamp = (value) => {
  if (typeof value === "number" || typeof value === "bigint") {
    return toFiniteNumber(value, "timestamp");
  }

  if (typeof value === "string" && value.trim()) {
    const numericValue = Number(value);
    if (Number.isFinite(numericValue)) {
      return numericValue;
    }

    const parsedTime = Date.parse(value);
    if (Number.isFinite(parsedTime)) {
      return parsedTime;
    }
  }

  throw new Error("QoS payload timestamp must be a number or valid datetime string");
};

export const isSupportedQosImageSource = (imageSource) => {
  if (typeof imageSource !== "string" || !imageSource.trim()) {
    return false;
  }

  const trimmedSource = imageSource.trim();
  if (SUPPORTED_DATA_IMAGE_PATTERN.test(trimmedSource)) {
    return true;
  }

  try {
    const parsedUrl = new URL(trimmedSource);
    return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
  } catch {
    return false;
  }
};

export const parseQosMetricsPayload = (payload) => {
  if (!Array.isArray(payload?.metrics)) {
    throw new Error("QoS metrics payload must include a metrics array");
  }

  return payload.metrics.map((metric, index) => {
    if (!metric || typeof metric !== "object" || Array.isArray(metric)) {
      throw new Error(`QoS metrics item ${index} must be an object`);
    }

    return {
      timestamp: normalizeTimestamp(metric.timestamp),
      sendrate_kbps: toFiniteNumber(metric.sendrate_kbps, "sendrate_kbps"),
      gbr_kbps: toFiniteNumber(metric.gbr_kbps, "gbr_kbps"),
      q_lvl: toFiniteNumber(metric.q_lvl, "q_lvl"),
    };
  });
};

export const normalizeQosImagePlacement = (placement, index) => {
  const rawValues = Array.isArray(placement) ? placement : [placement];
  if (rawValues.length < 1 || rawValues.length > 2) {
    throw new Error(`QoS imagePlacement item ${index} must include one or two placement values`);
  }

  const normalizedValues = [];
  let imageHorizontalPlacement = null;
  let imageVerticalPlacement = null;

  rawValues.forEach((rawValue) => {
    const value = String(rawValue || "").trim().toLowerCase();
    if (!VALID_IMAGE_PLACEMENTS.has(value)) {
      throw new Error(`QoS imagePlacement item ${index} must use above, below, left, or right`);
    }

    if (HORIZONTAL_IMAGE_PLACEMENTS.has(value)) {
      if (imageHorizontalPlacement) {
        throw new Error(`QoS imagePlacement item ${index} can include only one left/right value`);
      }
      imageHorizontalPlacement = value;
    } else if (VERTICAL_IMAGE_PLACEMENTS.has(value)) {
      if (imageVerticalPlacement) {
        throw new Error(`QoS imagePlacement item ${index} can include only one above/below value`);
      }
      imageVerticalPlacement = value;
    }
    normalizedValues.push(value);
  });

  return {
    imagePlacement: normalizedValues,
    imageHorizontalPlacement,
    imageVerticalPlacement: imageVerticalPlacement || "above",
  };
};

export const buildQosDialogItems = (dialogs, images, imagePlacements) => {
  if (!Array.isArray(dialogs) || !Array.isArray(images) || !Array.isArray(imagePlacements)) {
    throw new Error("QoS dialog payload must include dialogs, images, and imagePlacements arrays");
  }

  if (dialogs.length !== images.length || dialogs.length !== imagePlacements.length) {
    throw new Error("QoS dialogs, images, and imagePlacements arrays must have the same length");
  }

  return dialogs.map((dialog, index) => {
    const image = images[index];
    const placement = normalizeQosImagePlacement(imagePlacements[index], index);

    if (typeof dialog !== "string") {
      throw new Error(`QoS dialog item ${index} must be a string`);
    }

    if (!isSupportedQosImageSource(image)) {
      throw new Error(`QoS image item ${index} must be a png/jpeg/gif data URI or http(s) URL`);
    }

    return {
      id: `${index}-${dialog}-${image.slice(0, 32)}-${placement.imagePlacement.join("-")}`,
      dialog,
      image,
      ...placement,
    };
  });
};

export const parseQosDialogImagePayload = (payload) => (
  buildQosDialogItems(payload?.dialogs, payload?.images, payload?.imagePlacements)
);

export const parseQosPushPayload = (payload) => {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error("QoS push payload must be a JSON object");
  }

  const hasMetrics = hasOwn(payload, "metrics");
  const hasDialogLayer = hasOwn(payload, "dialogs") || hasOwn(payload, "images") || hasOwn(payload, "imagePlacements");
  const hasReset = payload?.reset === true || String(payload?.type || "").trim().toLowerCase() === "reset";
  const hasEmptyDialogLayer = hasDialogLayer
    && Array.isArray(payload.dialogs)
    && Array.isArray(payload.images)
    && Array.isArray(payload.imagePlacements)
    && payload.dialogs.length === 0
    && payload.images.length === 0
    && payload.imagePlacements.length === 0;

  if (hasMetrics && hasDialogLayer) {
    throw new Error("QoS push payload cannot mix metrics with dialogs/images");
  }

  if (hasReset || hasEmptyDialogLayer) {
    if (hasDialogLayer) {
      if (hasEmptyDialogLayer) {
        return {
          type: "reset",
        };
      }
      throw new Error("QoS push payload cannot mix reset with metrics or dialogs/images");
    }
    return {
      type: "reset",
    };
  }

  if (hasMetrics) {
    return {
      type: "metrics",
      metrics: parseQosMetricsPayload(payload),
    };
  }

  if (hasDialogLayer) {
    return {
      type: "dialogImages",
      dialogItems: parseQosDialogImagePayload(payload),
    };
  }

  throw new Error("QoS push payload must include metrics or dialogs/images");
};
