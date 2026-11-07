/* Keep bookmarks from the earlier edition usable after the weekly topics moved. */
(() => {
  const anchor = window.location.hash;
  if (!anchor) return;
  let id;
  try {
    id = decodeURIComponent(anchor.slice(1));
  } catch {
    return;
  }
  if (!document.getElementById(id)) {
    window.location.replace('reference.html' + window.location.search + anchor);
  }
})();
