(function(){
'use strict';

var $ = function(id){ return document.getElementById(id); };

var fmtEUR = function(n){
  if (!isFinite(n)) return '–';
  return Math.round(n).toLocaleString('de-DE') + ' €';
};
var fmtPct = function(n, d){
  if (!isFinite(n)) return '–';
  return n.toFixed(d == null ? 2 : d).replace('.', ',') + ' %';
};
var fmtNum = function(n, d){
  if (!isFinite(n)) return '–';
  return n.toFixed(d == null ? 1 : d).replace('.', ',');
};

function calc(){
  var kaufpreis = parseFloat($('kaufpreis').value) || 0;
  var wohnflaeche = parseFloat($('wohnflaeche').value) || 0;
  var kaltmiete = parseFloat($('kaltmiete').value) || 0;
  var hausgeld = parseFloat($('hausgeld').value) || 0;
  var hgnuPct = parseFloat($('hgnu').value) || 0;
  var gestPct = parseFloat($('bundesland').value) || 0;
  var maklerPct = parseFloat($('makler').value) || 0;
  var eigenkapital = parseFloat($('eigenkapital').value) || 0;
  var zinsPct = parseFloat($('zins').value) || 0;
  var tilgungPct = parseFloat($('tilgung').value) || 0;

  $('hgnu-out').textContent = hgnuPct + ' % — Rücklage, Verwaltung u. a. trägt der Eigentümer';

  var notarPct = 1.5, grundbuchPct = 0.5;
  var ppqm = wohnflaeche > 0 ? kaufpreis / wohnflaeche : NaN;
  var jahreskaltmiete = kaltmiete * 12;
  var faktor = jahreskaltmiete > 0 ? kaufpreis / jahreskaltmiete : NaN;

  var gest = kaufpreis * gestPct / 100;
  var notar = kaufpreis * notarPct / 100;
  var grundbuch = kaufpreis * grundbuchPct / 100;
  var makler = kaufpreis * maklerPct / 100;
  var nebenkosten = gest + notar + grundbuch + makler;
  var gesamtkapital = kaufpreis + nebenkosten;

  var renditeKP = kaufpreis > 0 ? jahreskaltmiete / kaufpreis * 100 : NaN;
  var renditeGK = gesamtkapital > 0 ? jahreskaltmiete / gesamtkapital * 100 : NaN;

  var darlehen = Math.max(gesamtkapital - eigenkapital, 0);
  var rate = darlehen * (zinsPct + tilgungPct) / 100 / 12;

  var hgNichtUmlagefaehig = hausgeld * hgnuPct / 100;
  var cashflowMtl = kaltmiete - rate - hgNichtUmlagefaehig;
  var cashflowJahr = cashflowMtl * 12;

  $('m-ppqm').textContent = isFinite(ppqm) ? fmtEUR(ppqm) : '–';
  $('m-faktor').textContent = isFinite(faktor) ? fmtNum(faktor) + '×' : '–';
  $('m-rendite-kp').textContent = fmtPct(renditeKP);
  $('m-rendite-gk').textContent = fmtPct(renditeGK);

  $('b-gest').textContent = fmtEUR(gest) + ' (' + fmtPct(gestPct, 1) + ')';
  $('b-notar').textContent = fmtEUR(notar);
  $('b-grundbuch').textContent = fmtEUR(grundbuch);
  $('b-makler').textContent = fmtEUR(makler) + ' (' + fmtPct(maklerPct, 2) + ')';
  $('b-gesamt').textContent = fmtEUR(gesamtkapital);

  $('m-darlehen').textContent = fmtEUR(darlehen);
  $('m-rate').textContent = fmtEUR(rate);
  $('m-cashflow').textContent = (cashflowMtl >= 0 ? '+' : '') + fmtEUR(cashflowMtl);
  $('m-cashflow-jahr').textContent = (cashflowJahr >= 0 ? '+' : '') + fmtEUR(cashflowJahr);

  var cfCard = $('m-cashflow-card');
  cfCard.classList.remove('pos', 'neg');
  cfCard.classList.add(cashflowMtl >= 0 ? 'pos' : 'neg');

  // ---- Kennzahlen-Score (nur quantitativ: Faktor, Rendite auf GK, Cashflow) ----
  var sFaktor = 0;
  if (isFinite(faktor)) {
    if (faktor <= 18) sFaktor = 35;
    else if (faktor <= 20) sFaktor = 30;
    else if (faktor <= 22) sFaktor = 24;
    else if (faktor <= 25) sFaktor = 16;
    else if (faktor <= 28) sFaktor = 8;
    else sFaktor = 2;
  }
  var sRendite = 0;
  if (isFinite(renditeGK)) {
    if (renditeGK >= 6) sRendite = 35;
    else if (renditeGK >= 5) sRendite = 28;
    else if (renditeGK >= 4.5) sRendite = 22;
    else if (renditeGK >= 4) sRendite = 16;
    else if (renditeGK >= 3.5) sRendite = 10;
    else if (renditeGK >= 3) sRendite = 5;
    else sRendite = 0;
  }
  var sCashflow = 0;
  if (cashflowMtl >= 150) sCashflow = 30;
  else if (cashflowMtl >= 50) sCashflow = 24;
  else if (cashflowMtl >= 0) sCashflow = 16;
  else if (cashflowMtl >= -100) sCashflow = 8;
  else sCashflow = 0;

  var score = Math.round(sFaktor + sRendite + sCashflow);
  var band, color;
  if (score >= 80) { band = 'Kennzahlen stark'; color = 'good'; }
  else if (score >= 60) { band = 'Kennzahlen solide'; color = 'good'; }
  else if (score >= 40) { band = 'Prüfen / verhandeln'; color = 'warn'; }
  else if (score >= 20) { band = 'Schwache Kennzahlen'; color = 'bad'; }
  else { band = 'Kennzahlen sprechen dagegen'; color = 'bad'; }

  var colorVar = color === 'good' ? 'var(--good)' : color === 'warn' ? 'var(--warn)' : 'var(--bad)';
  $('score').textContent = score;
  $('score').style.color = colorVar;
  $('score-label').textContent = band;
  $('score-label').style.color = colorVar;
  $('score-label').style.background = color === 'good' ? 'rgba(var(--good-rgb),.12)' : color === 'warn' ? 'rgba(224,178,74,.12)' : 'rgba(var(--bad-rgb),.12)';
  $('score-label').style.border = '1px solid ' + colorVar;
  var bar = $('score-bar');
  bar.style.width = Math.max(score, 2) + '%';
  bar.style.background = colorVar;
}

document.addEventListener('input', function(e){
  if (e.target.closest('#form')) calc();
});
calc();

// scroll reveal
var io = new IntersectionObserver(function(es){
  es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
}, { threshold: .12 });
document.querySelectorAll('.reveal').forEach(function(el){ io.observe(el); });
})();
