/**
 * scale-text.js — Android font-scale emulator for the RN-web simulation.
 *
 * Why: on a real Android device, the OS "Font size" setting scales TEXT ONLY
 * (sp units), while layout boxes (dp) stay fixed. That mismatch is exactly
 * what truncates bold labels ("Doct…", "Hospit…") on real phones while the
 * web simulation looks perfect. Browsers have no equivalent switch, so we
 * walk the DOM and multiply every text element's fontSize + lineHeight by
 * the persona's font_scale — boxes untouched, same as the OS.
 *
 * Idempotent: safe to re-run after navigation / DOM changes. Original values
 * are kept in data attributes and used as the base on re-apply.
 *
 * Usage (agent-browser):
 *   agent-browser eval "$(cat scale-text.js) window.__applyFontScale__(1.3)"
 */
(function () {
  if (typeof window === "undefined") return "browser-only";
  window.__applyFontScale__ = function (factor) {
    if (typeof factor !== "number" || factor <= 0) factor = 1;
    var all = document.querySelectorAll("body *");
    var touched = 0;
    for (var i = 0; i < all.length; i++) {
      var el = all[i];
      // Only elements that directly own visible text (skip pure containers).
      var ownText = false;
      for (var n = 0; n < el.childNodes.length; n++) {
        var node = el.childNodes[n];
        if (node.nodeType === Node.TEXT_NODE && node.nodeValue.trim() !== "") {
          ownText = true;
          break;
        }
      }
      if (!ownText) continue;
      var cs = window.getComputedStyle(el);
      // Base values: first application reads computed style; later
      // applications re-read the stored originals so we never compound.
      var baseFont = parseFloat(el.dataset.fsBase || cs.fontSize);
      var baseLine = parseFloat(el.dataset.lhBase || cs.lineHeight);
      if (!el.dataset.fsBase) el.dataset.fsBase = String(baseFont);
      if (!el.dataset.lhBase) el.dataset.lhBase = String(baseLine);
      el.style.fontSize = baseFont * factor + "px";
      // Only scale lineHeight when it is a concrete px value (not "normal");
      // Android scales sp text AND its line height together.
      if (!isNaN(baseLine)) {
        el.style.lineHeight = baseLine * factor + "px";
      }
      touched++;
    }
    window.__FONT_SCALE__ = factor;
    return "fontScale=" + factor + " textNodes=" + touched;
  };
  // If a factor was staged before injection, apply immediately.
  if (window.__STAGE_FONT_SCALE__) {
    return window.__applyFontScale__(window.__STAGE_FONT_SCALE__);
  }
  return "injector-ready";
})();
