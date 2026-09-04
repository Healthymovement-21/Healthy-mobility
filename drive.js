/* ============================================================
   GOOGLE-DRIVE-KONFIGURATION — die einzige Stelle, die du ändern musst.

   Trag hier den Freigabe-Link des Google-Drive-Ordners ein, in dem
   die elf Dateien liegen.

   So kommst du an den Link:
   Ordner in Google Drive öffnen → Freigeben → unter „Allgemeiner
   Zugriff" auf „Jeder, der über den Link verfügt" stellen, Rolle
   „Betrachter" → „Link kopieren".

   Beispiel: 'https://drive.google.com/drive/folders/1AbCdEfGhIjKlMn'

   Solange das Feld leer bleibt, zeigt der Button einen Hinweis statt
   eines toten Links. Die Dateien im Ordner „dateien/" bleiben davon
   unberührt und funktionieren weiter — Drive ist der bequemere Weg,
   nicht der einzige.
   ============================================================ */

const DRIVE_URL = '';

/* ------------------------------------------------------------
   Ab hier nichts mehr ändern.
   ------------------------------------------------------------ */
(function () {
  'use strict';

  const ready = fn =>
    document.readyState === 'loading'
      ? document.addEventListener('DOMContentLoaded', fn)
      : fn();

  ready(function () {
    const btns = Array.from(document.querySelectorAll('[data-drive]'));
    if (!btns.length) return;

    const hinweis = document.getElementById('drive-hinweis');
    const eingerichtet = DRIVE_URL.trim().length > 0;

    if (!eingerichtet) {
      btns.forEach(btn => {
        btn.setAttribute('aria-disabled', 'true');
        btn.classList.add('is-disabled');
        btn.removeAttribute('href');
      });
      if (hinweis) {
        hinweis.textContent = 'Der Google-Drive-Ordner wird gerade eingerichtet. Bis dahin nimm das ZIP oder die einzelnen Dateien weiter unten.';
        hinweis.hidden = false;
      }
      return;
    }

    btns.forEach(btn => { btn.href = DRIVE_URL; btn.target = '_blank'; btn.rel = 'noopener'; });
  });
})();
