/* Visit counting for malcolmhyndman.com (homepage and lessons).
   Counts page visits with Google Analytics unless the visitor has said no,
   and shows a small one-time notice with an easy way to say no.
   The choice is kept in the visitor's own browser under "visits_choice" ("ok" or "off"). */
(function () {
  var ID = 'G-Y6FDKSPFLT', KEY = 'visits_choice';
  if (window.__visitsLoaded) return; window.__visitsLoaded = true;
  if (!/(^|\.)malcolmhyndman\.com$/.test(location.hostname) && !window.VISITS_TEST) return;

  var choice = null;
  try { choice = localStorage.getItem(KEY); } catch (e) {}
  if (choice === 'off') { window['ga-disable-' + ID] = true; return; }

  if (!window.gtag && !window.VISITS_TEST) {
    var g = document.createElement('script'); g.async = true;
    g.src = 'https://www.googletagmanager.com/gtag/js?id=' + ID;
    document.head.appendChild(g);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { dataLayer.push(arguments); };
    gtag('js', new Date()); gtag('config', ID);
  }
  if (choice) return;

  function save(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }
  function notice() {
    if (/\/privacy\.html$/.test(location.pathname)) return;   // that page has its own switch
    var box = document.createElement('div');
    box.setAttribute('role', 'region'); box.setAttribute('aria-label', 'Visit counting');
    box.style.cssText = 'position:fixed;left:12px;bottom:72px;z-index:99998;max-width:300px;background:#fffdf8;color:#1a1a17;' +
      'border:1px solid #e7e1d4;border-radius:12px;box-shadow:0 6px 24px rgba(0,0,0,.16);padding:12px 14px;' +
      'font:14px/1.45 system-ui,-apple-system,sans-serif';
    var p = document.createElement('div');
    p.textContent = 'This site counts visits to see which lessons are useful. No names, no adverts. ';
    var a = document.createElement('a');
    a.href = 'https://malcolmhyndman.com/privacy.html'; a.target = '_blank'; a.rel = 'noopener';
    a.textContent = 'More'; a.style.cssText = 'color:#1e3a2f;text-decoration:underline';
    p.appendChild(a); box.appendChild(p);
    var row = document.createElement('div'); row.style.cssText = 'display:flex;gap:8px;margin-top:10px;flex-wrap:wrap';
    function btn(text, css, fn) {
      var b = document.createElement('button'); b.type = 'button'; b.textContent = text;
      b.style.cssText = 'font:600 14px system-ui,-apple-system,sans-serif;border-radius:8px;padding:7px 14px;cursor:pointer;' + css;
      b.onclick = function () { fn(); box.remove(); }; row.appendChild(b);
    }
    btn('OK', 'background:#1e3a2f;color:#fff;border:1px solid #1e3a2f', function () { save('ok'); });
    btn("Don't count me", 'background:#fff;color:#1a1a17;border:1px solid #cfc8b8', function () {
      save('off'); window['ga-disable-' + ID] = true;
    });
    box.appendChild(row);
    document.body.appendChild(box);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', notice); else notice();
})();
