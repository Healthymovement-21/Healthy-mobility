/* ============================================================
   CHECKOUT-KONFIGURATION — die einzige Stelle, die du ändern musst.

   Trag hier den Bestell-Link deines Digistore24-Produkts ein.
   Zu finden im Digistore24-Backend unter:
   Produkte → dein Produkt → Vermarktung → "Bestelllink"

   Beispiel: 'https://www.digistore24.com/product/612345'

   Solange das Feld leer bleibt, zeigen die Kauf-Buttons einen
   Hinweis statt eines toten Links — die Seite ist also nie kaputt,
   sie ist nur noch nicht verkaufsbereit.
   ============================================================ */

const CHECKOUT_URL = '';

/* Gültigkeit der Download-Links: unbegrenzt.
   Begründung: Käufer:innen wechseln Geräte und suchen die Dateien oft
   Monate später wieder. Ein ablaufender Link erzeugt genau dann
   Support-Aufwand, ohne den Schutz real zu erhöhen — wer weitergeben
   will, tut das in den ersten Minuten. Digistore24 hält den Link im
   Kundenkonto dauerhaft bereit. */

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
    const kaufBtns = Array.from(document.querySelectorAll('[data-checkout]'));
    const checkbox = document.getElementById('widerruf-ok');
    const hinweis  = document.getElementById('checkout-hinweis');

    /* Buttons, die nur zum Kauf-Abschnitt springen (z. B. oben im Hero):
       nach dem Sprung landet der Fokus auf der Zustimmung, damit der
       nächste Schritt sichtbar ist. */
    document.querySelectorAll('[data-checkout-jump]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (checkbox) setTimeout(() => checkbox.focus({ preventScroll: true }), 500);
      });
    });

    if (!kaufBtns.length) return;

    const eingerichtet = CHECKOUT_URL.trim().length > 0;

    /* Checkout noch nicht eingerichtet: Buttons sichtbar deaktivieren,
       damit niemand ins Leere klickt. */
    if (!eingerichtet) {
      kaufBtns.forEach(btn => {
        btn.setAttribute('aria-disabled', 'true');
        btn.classList.add('is-disabled');
        btn.removeAttribute('href');
      });
      if (hinweis) {
        hinweis.textContent = 'Der Checkout wird gerade eingerichtet — in Kürze kaufbar.';
        hinweis.hidden = false;
      }
      const gate = checkbox && checkbox.closest('.gate');
      if (gate) gate.hidden = true;
      return;
    }

    kaufBtns.forEach(btn => { btn.href = CHECKOUT_URL; });

    /* Widerrufs-Zustimmung als Kauf-Gate: ohne Häkchen kein Absprung
       in den Checkout. */
    if (!checkbox) return;

    const pruefen = () => {
      const ok = checkbox.checked;
      kaufBtns.forEach(btn => {
        btn.setAttribute('aria-disabled', ok ? 'false' : 'true');
        btn.classList.toggle('is-disabled', !ok);
      });
      if (hinweis) hinweis.hidden = ok;
    };

    checkbox.addEventListener('change', pruefen);
    pruefen();

    kaufBtns.forEach(btn => {
      btn.addEventListener('click', e => {
        if (!checkbox.checked) {
          e.preventDefault();
          if (hinweis) {
            hinweis.hidden = false;
            hinweis.textContent = 'Bitte bestätige zuerst den Hinweis zum Widerrufsrecht.';
          }
          checkbox.focus();
        }
      });
    });
  });
})();
