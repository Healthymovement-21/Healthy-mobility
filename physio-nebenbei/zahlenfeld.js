/* ============================================================
   Zahlenfeld — eigenes Ziffernraster statt Handytastatur.

   Problem: Auf dem Handy schiebt die System-Tastatur die Seite hoch,
   verdeckt das Ergebnis und klappt bei jedem Zurück-Tippen wieder zu.
   Man kommt nicht in Ruhe zum Eintragen.

   Loesung: Auf Touch-Geraeten wird jedes Zahlenfeld schreibgeschuetzt,
   damit die System-Tastatur gar nicht erst aufgeht. Stattdessen faehrt
   unten ein Raster mit grossen Ziffern hoch, das den aktuellen Wert
   und den Feldnamen mitanzeigt. Plus und Minus gehen dort auch.

   Mit Maus und Tastatur bleibt alles wie vorher tippbar.

   Einbinden: <script src="zahlenfeld.js" defer></script>
   Gilt automatisch fuer jedes input[type=number].
   ============================================================ */
(function () {
  'use strict';

  const touch = window.matchMedia('(pointer: coarse)').matches;

  /* ---------- Raster einmalig bauen ---------- */
  const pad = document.createElement('div');
  pad.className = 'zpad';
  pad.hidden = true;
  pad.innerHTML = `
    <div class="zpad-sheet" role="dialog" aria-modal="true" aria-label="Zahl eingeben">
      <div class="zpad-kopf">
        <span class="zpad-name"></span>
        <span class="zpad-wert"><span class="zpad-zahl">0</span><span class="zpad-einheit"></span></span>
      </div>
      <div class="zpad-schritt">
        <button type="button" data-z="step" data-dir="-1" aria-label="Weniger">−</button>
        <button type="button" data-z="step" data-dir="1" aria-label="Mehr">+</button>
      </div>
      <div class="zpad-raster">
        <button type="button" data-z="1">1</button>
        <button type="button" data-z="2">2</button>
        <button type="button" data-z="3">3</button>
        <button type="button" data-z="4">4</button>
        <button type="button" data-z="5">5</button>
        <button type="button" data-z="6">6</button>
        <button type="button" data-z="7">7</button>
        <button type="button" data-z="8">8</button>
        <button type="button" data-z="9">9</button>
        <button type="button" data-z="komma">,</button>
        <button type="button" data-z="0">0</button>
        <button type="button" data-z="weg" aria-label="Letzte Ziffer löschen">⌫</button>
      </div>
      <button type="button" class="zpad-fertig" data-z="fertig">Fertig</button>
    </div>`;

  let feld = null;      // aktuell bearbeitetes Eingabefeld
  let frisch = true;    // erste Ziffer ersetzt den alten Wert komplett

  const zahl     = () => pad.querySelector('.zpad-zahl');
  const nameEl   = () => pad.querySelector('.zpad-name');
  const einheitEl= () => pad.querySelector('.zpad-einheit');

  /* Beschriftung zum Feld finden: erst label[for], sonst aria-label */
  function beschriftung(el) {
    const lab = el.id && document.querySelector('label[for="' + CSS.escape(el.id) + '"]');
    if (lab) return lab.textContent.replace(/\s+/g, ' ').trim();
    return el.getAttribute('aria-label') || 'Wert';
  }

  /* Einheit aus dem Nachbarelement lesen, damit im Raster € oder Std steht */
  function einheit(el) {
    const n = el.parentElement && el.parentElement.querySelector('.unit, .zpad-unit');
    if (n) return ' ' + n.textContent.trim();
    const sib = el.nextElementSibling;
    if (sib && sib.tagName === 'SPAN' && sib.textContent.trim().length <= 4) {
      return ' ' + sib.textContent.trim();
    }
    return '';
  }

  function zeige(el) {
    feld = el;
    frisch = true;
    zahl().textContent = el.value === '' ? '0' : el.value.replace('.', ',');
    nameEl().textContent = beschriftung(el);
    einheitEl().textContent = einheit(el);
    pad.hidden = false;
    document.body.classList.add('zpad-offen');
  }

  function schliesse() {
    pad.hidden = true;
    document.body.classList.remove('zpad-offen');
    feld = null;
  }

  /* Wert ins Feld schreiben und die Rechner darueber informieren */
  function uebernehmen(text) {
    if (!feld) return;
    zahl().textContent = text === '' ? '0' : text;
    const wert = text.replace(',', '.');
    feld.value = wert === '' ? '' : wert;
    feld.dispatchEvent(new Event('input', { bubbles: true }));
    feld.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function begrenze(n) {
    const min = feld.min !== '' ? parseFloat(feld.min) : -Infinity;
    const max = feld.max !== '' ? parseFloat(feld.max) : Infinity;
    return Math.min(max, Math.max(min, n));
  }

  pad.addEventListener('click', e => {
    /* Tipp neben das Raster schliesst es */
    if (e.target === pad) { schliesse(); return; }

    const btn = e.target.closest('[data-z]');
    if (!btn || !feld) return;
    const z = btn.dataset.z;

    if (z === 'fertig') { schliesse(); return; }

    if (z === 'step') {
      const schritt = parseFloat(feld.step) || 1;
      const richtung = parseInt(btn.dataset.dir, 10);
      const neu = begrenze((parseFloat(feld.value) || 0) + schritt * richtung);
      frisch = true;
      uebernehmen(String(neu).replace('.', ','));
      return;
    }

    let text = frisch ? '' : zahl().textContent;
    if (text === '0' && z !== 'komma') text = '';

    if (z === 'weg') {
      text = text.slice(0, -1);
    } else if (z === 'komma') {
      if (text.includes(',')) return;
      text = (text === '' ? '0' : text) + ',';
    } else {
      if (text.replace(/[^0-9]/g, '').length >= 7) return;   /* Unfug abfangen */
      text += z;
    }

    frisch = false;
    uebernehmen(text);
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !pad.hidden) schliesse();
  });

  /* ---------- Felder anschliessen ---------- */
  function anschliessen(el) {
    if (el.dataset.zpad === 'aus' || el.dataset.zpadBereit) return;
    el.dataset.zpadBereit = '1';

    if (!touch) return;   /* Maus und Tastatur bleiben unveraendert */

    /* Schreibgeschuetzt verhindert die System-Tastatur zuverlaessig,
       inputmode allein reicht auf iOS nicht. */
    el.readOnly = true;
    el.setAttribute('inputmode', 'none');

    el.addEventListener('focus', () => zeige(el));
    el.addEventListener('click', e => { e.preventDefault(); zeige(el); });
  }

  function start() {
    document.body.appendChild(pad);
    document.querySelectorAll('input[type=number]').forEach(anschliessen);

    /* Rechner bauen Zeilen nach, darum neu hinzugekommene Felder mitnehmen */
    new MutationObserver(muts => {
      muts.forEach(m => m.addedNodes.forEach(n => {
        if (n.nodeType !== 1) return;
        if (n.matches && n.matches('input[type=number]')) anschliessen(n);
        if (n.querySelectorAll) n.querySelectorAll('input[type=number]').forEach(anschliessen);
      }));
    }).observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
