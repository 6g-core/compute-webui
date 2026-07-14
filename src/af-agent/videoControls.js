export const toggleVideoPlayback = async (videoElement) => {
  if (!videoElement) {
    return false;
  }
  if (videoElement.paused || videoElement.ended) {
    await videoElement.play();
    return true;
  }
  videoElement.pause();
  return false;
};

export const toggleVideoMuted = (videoElement) => {
  if (!videoElement) {
    return false;
  }
  videoElement.muted = !videoElement.muted;
  return videoElement.muted;
};

export const requestElementFullscreen = async (element) => {
  const requestFullscreen = element?.requestFullscreen
    || element?.webkitRequestFullscreen
    || element?.msRequestFullscreen;
  if (!requestFullscreen) {
    return false;
  }
  await requestFullscreen.call(element);
  return true;
};
