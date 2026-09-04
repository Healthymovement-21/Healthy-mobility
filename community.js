/* ============================================================
   COMMUNITY-KONFIGURATION — die einzige Stelle, die du ändern musst.

   Trag hier deinen WhatsApp-Einladungslink ein, sobald die Gruppe
   oder der Community-Kanal steht.

   Beispiel: 'https://chat.whatsapp.com/AbCdEfGhIjKlMnOp'

   Solange das Feld leer bleibt, zeigt der Beitreten-Button einen
   Hinweis statt eines toten Links.
   ============================================================ */

const WHATSAPP_URL = '';

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
    const btns = Array.from(document.querySelectorAll('[data-whatsapp]'));
    if (!btns.length) return;

    const hinweis = document.getElementById('community-hinweis');
    const eingerichtet = WHATSAPP_URL.trim().length > 0;

    if (!eingerichtet) {
      btns.forEach(btn => {
        btn.setAttribute('aria-disabled', 'true');
        btn.classList.add('is-disabled');
        btn.removeAttribute('href');
      });
      if (hinweis) {
        hinweis.textContent = 'Der Einladungslink wird gerade eingerichtet — in Kürze verfügbar.';
        hinweis.hidden = false;
      }
      return;
    }

    btns.forEach(btn => { btn.href = WHATSAPP_URL; btn.target = '_blank'; btn.rel = 'noopener'; });
  });
})();
