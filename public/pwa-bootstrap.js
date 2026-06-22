(function () {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(function () {});
  }

  window.addEventListener("beforeinstallprompt", function (event) {
    event.preventDefault();
    window.__ghazatnaDeferredInstall = event;
    window.dispatchEvent(new Event("ghazatna-pwa-install-ready"));
  });

  window.addEventListener("appinstalled", function () {
    window.__ghazatnaDeferredInstall = null;
  });
})();
