const SUPPORTED_STORY_SCENARIOS = new Set(["blind_box_store", "parcel_pickup"]);
const DEFAULT_STORY_SCENARIO = "blind_box_store";

const getBrowserWindow = () => (
  typeof globalThis.window === "undefined" ? null : globalThis.window
);

const getViteEnv = () => import.meta.env || {};

const PARCEL_PICKUP_REPLACEMENTS = [
  ["Compute offloading for object recognition", "Compute offloading for parcel damage inspection"],
  ["object recognition", "parcel damage inspection"],
  ["item pickup and handover", "parcel pickup and handover"],
  ["item handover", "parcel handover"],
  ["target-item", "parcel-package"],
  ["target item", "parcel package"],
  ["store entrance", "pickup station entrance"],
  ["supermarket agent", "pickup-station agent"],
  ["store agent", "pickup-station agent"],
  ["go to the store", "go to the pickup station"],
  ["goods", "parcel packaging"],
  ["Store Agent", "Pickup Station Agent"],
  ["Supermarket Agent", "Pickup Station Agent"],
  ["Supermarket", "Pickup Station"],
  ["Store", "Pickup Station"],
  ["商品取件交接动作", "快递取件交接动作"],
  ["机器狗与超市智能体完成商品交接", "机器狗与快递站智能体完成快递交接"],
  ["机器狗与超市智能体交接物品", "机器狗与快递站智能体交接快递"],
  ["机器狗和AR眼镜分别与超市智能体双向认证", "机器狗和AR眼镜分别与快递站智能体双向认证"],
  ["AR眼镜、机器狗与超市智能体双向认证", "AR眼镜、机器狗与快递站智能体双向认证"],
  ["机器狗、AR眼镜与商店智能体完成双向认证", "机器狗、AR眼镜与快递站智能体完成双向认证"],
  ["获取超市智能体数字身份", "获取快递站智能体数字身份"],
  ["机器狗抵达商店门口", "机器狗抵达快递站门口"],
  ["AR眼镜指示机器狗前往商店", "AR眼镜指示机器狗前往快递站"],
  ["将机器狗实时视野接入视觉识别任务", "将机器狗实时视野接入快递包装检测任务"],
  ["响应用户寻找目标物的意图", "响应用户查询快递包装破损原因的意图"],
  ["网络算力节点识别商品", "网络算力节点检查快递包装"],
  ["商品交接", "快递交接"],
  ["交接物品", "交接快递"],
  ["物品交接", "快递交接"],
  ["目标物品", "快递包装"],
  ["目标物", "快递包装"],
  ["视觉识别任务", "快递包装检测任务"],
  ["商店门口", "快递站门口"],
  ["超市智能体", "快递站智能体"],
  ["商店智能体", "快递站智能体"],
  ["前往商店", "前往快递站"],
  ["抵达商店", "抵达快递站"],
  ["商店", "快递站"],
  ["超市", "快递站"],
  ["商品", "快递"],
];

const STORY_REPLACEMENTS = {
  parcel_pickup: PARCEL_PICKUP_REPLACEMENTS,
};

export const normalizeStoryScenario = (value) => {
  const scenario = String(value || "").trim();
  return SUPPORTED_STORY_SCENARIOS.has(scenario)
    ? scenario
    : DEFAULT_STORY_SCENARIO;
};

export const getStoryScenario = () => normalizeStoryScenario(
  getBrowserWindow()?.__RUNTIME_CONFIG__?.storyScenario
    || getViteEnv().VITE_STORY_SCENARIO
    || DEFAULT_STORY_SCENARIO,
);

export const applyStoryProfileToText = (
  text,
  scenario = getStoryScenario(),
) => {
  if (typeof text !== "string") {
    return text;
  }

  return (STORY_REPLACEMENTS[scenario] || []).reduce(
    (result, [source, target]) => result.split(source).join(target),
    text,
  );
};

export const applyStoryProfileToValue = (
  value,
  scenario = getStoryScenario(),
) => {
  if (typeof value === "string") {
    return applyStoryProfileToText(value, scenario);
  }
  if (Array.isArray(value)) {
    return value.map((item) => applyStoryProfileToValue(item, scenario));
  }
  if (!value || typeof value !== "object") {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [
      applyStoryProfileToText(key, scenario),
      applyStoryProfileToValue(item, scenario),
    ]),
  );
};

export const applyStoryProfileToArray = (
  target,
  scenario = getStoryScenario(),
) => {
  const nextValue = applyStoryProfileToValue(target, scenario);
  target.splice(0, target.length, ...nextValue);
  return target;
};

export const applyStoryProfileToObject = (
  target,
  scenario = getStoryScenario(),
) => {
  const nextValue = applyStoryProfileToValue(target, scenario);
  Object.keys(target).forEach((key) => {
    delete target[key];
  });
  Object.assign(target, nextValue);
  return target;
};

export const getStoryScenarioText = (text) => applyStoryProfileToText(text);

