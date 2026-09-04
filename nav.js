/* Navigation der oeffentlichen Seiten: Schatten beim Scrollen und das
   Menue auf schmalen Bildschirmen. Liegt in einer eigenen Datei, weil
   alle fuenf Seiten dieselbe Kopfzeile benutzen. */
(function () {
  'use strict';

  const nav = document.getElementById('nav');
  if (nav) {
    const beimScrollen = () => nav.classList.toggle('is-stuck', window.scrollY > 12);
    beimScrollen();
    window.addEventListener('scroll', beimScrollen, { passive: true });
  }

  const burger = document.getElementById('burger');
  const sheet  = document.getElementById('navsheet');
  if (!burger || !sheet) return;

  const setzen = offen => {
    sheet.hidden = !offen;
    burger.setAttribute('aria-expanded', offen ? 'true' : 'false');
    burger.setAttribute('aria-label', offen ? 'Menü schließen' : 'Menü öffnen');
    document.body.style.overflow = offen ? 'hidden' : '';
  };

  burger.addEventListener('click', () => setzen(sheet.hidden));
  sheet.addEventListener('click', e => { if (e.target.tagName === 'A') setzen(false); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !sheet.hidden) setzen(false);
  });
})();
