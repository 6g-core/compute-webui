export const createObjectUrlStore = (urlApi = URL) => {
  let currentUrl = '';

  return {
    get currentUrl() {
      return currentUrl;
    },
    replace(blob) {
      if (currentUrl) {
        urlApi.revokeObjectURL(currentUrl);
      }
      currentUrl = urlApi.createObjectURL(blob);
      return currentUrl;
    },
    clear() {
      if (!currentUrl) {
        return;
      }
      urlApi.revokeObjectURL(currentUrl);
      currentUrl = '';
    },
  };
};
