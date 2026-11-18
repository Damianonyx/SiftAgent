// Applied before first paint (CSP forbids inline scripts). Preference only; no account data.
(function () {
  var stored = null;
  try { stored = localStorage.getItem('sift-theme'); } catch (e) {}
  var root = document.documentElement;
  if (stored === 'light' || stored === 'dark') root.setAttribute('data-theme', stored);
  if (navigator.platform && /Mac|iPhone|iPad/.test(navigator.platform)) root.classList.add('is-apple');
})();
