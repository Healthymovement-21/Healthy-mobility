/* Kostenlose Kurzfassung des Privatpatienten-Rechners.
   Eine Behandlungsart, Monatsumsatz und Stundensatz. */
(function () {
  'use strict';

  const el  = id => document.getElementById(id);
  if (!el('d_preis')) return;

  const num = id => Math.max(0, parseFloat(el(id).value) || 0);
  const eur = n => n.toLocaleString('de-DE', { maximumFractionDigits: 0 }) + ' €';
  const std = n => n.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' h';

  function rechne() {
    const umsatz  = num('d_preis') * num('d_termine');
    const stunden = num('d_termine') * num('d_dauer') / 60;
    el('d_umsatz').textContent = eur(umsatz);
    el('d_zeit').textContent   = std(stunden);
    el('d_std').textContent    = eur(stunden > 0 ? umsatz / stunden : 0);
  }

  ['d_preis', 'd_termine', 'd_dauer'].forEach(id => el(id).addEventListener('input', rechne));
  rechne();
})();
