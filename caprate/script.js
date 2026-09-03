(function(){
'use strict';

var $ = function(id){ return document.getElementById(id); };

/* ============ formatting ============ */
var fmtEUR = function(n){ return isFinite(n) ? Math.round(n).toLocaleString('de-DE') + ' €' : '–'; };
var fmtPct = function(n, d){ return isFinite(n) ? n.toFixed(d == null ? 2 : d).replace('.', ',') + ' %' : '–'; };
var fmtNum = function(n, d){ return isFinite(n) ? n.toFixed(d == null ? 1 : d).replace('.', ',') : '–'; };
var parseGermanNumber = function(str){
  if (!str) return NaN;
  var s = String(str).trim().replace(/\./g, '').replace(',', '.');
  return parseFloat(s);
};

/* ============ Marktmiete-Schätzung (Heuristik) ============ */
var RENT_TABLE = {
  'münchen':21,'muenchen':21,'munich':21,
  'frankfurt':16,'frankfurt am main':16,
  'stuttgart':15,'hamburg':14.5,'berlin':13.5,
  'köln':13,'koeln':13,'cologne':13,
  'düsseldorf':13.5,'duesseldorf':13.5,
  'heidelberg':15.5,'leimen':12.5,'mannheim':11.5,'karlsruhe':12.5,
  'freiburg':15,'freiburg im breisgau':15,
  'leipzig':9.5,'dresden':10,'nürnberg':12,'nuernberg':12,
  'hannover':11,'bremen':10,'essen':9,'dortmund':9,
  'münster':12,'muenster':12,'mainz':12.5,'wiesbaden':12.5,'bonn':12,
  'augsburg':11,'bielefeld':9,'bochum':9,'wuppertal':8.5,'duisburg':8,'potsdam':12.5
};
var RENT_DEFAULT = 10.5;

function estimateRent(ort, wohnflaeche, baujahr, zustand){
  if (!wohnflaeche) return null;
  var key = (ort || '').trim().toLowerCase();
  var base = RENT_TABLE[key];
  var known = !!base;
  if (!base) base = RENT_DEFAULT;

  var bjMod = 0;
  if (baujahr) {
    if (baujahr < 1950) bjMod = -0.08;
    else if (baujahr < 1980) bjMod = -0.05;
    else if (baujahr < 2000) bjMod = 0;
    else if (baujahr < 2016) bjMod = 0.05;
    else bjMod = 0.12;
  }
  var zMod = zustand === 'saniert' ? 0.10 : zustand === 'renovierung' ? -0.12 : 0;

  var raw = base * wohnflaeche * (1 + bjMod + zMod);
  var rounded = Math.round(raw / 5) * 5;
  return { miete: rounded, basePerSqm: base, known: known, bjMod: bjMod, zMod: zMod };
}

/* ============ Exposé-Parser ============ */
function parseExpose(text){
  var found = {};
  if (!text || !text.trim()) return found;

  var mKauf = text.match(/kaufpreis\D{0,15}([\d.,]+)\s*€/i);
  if (mKauf) {
    found.kaufpreis = parseGermanNumber(mKauf[1]);
  } else {
    var euroMatches = text.match(/([\d]{1,3}(?:[.\s]\d{3})+(?:,\d+)?)\s*€/g) || [];
    var nums = euroMatches.map(function(s){ return parseGermanNumber(s.replace('€','')); }).filter(function(n){ return n >= 10000; });
    if (nums.length) found.kaufpreis = Math.max.apply(null, nums);
  }

  var mFlaeche = text.match(/(\d+(?:[.,]\d+)?)\s*m²/i);
  if (mFlaeche) found.wohnflaeche = parseGermanNumber(mFlaeche[1]);

  var mZimmer = text.match(/(\d+(?:[.,]\d+)?)[\s-]*(?:zimmer|zi\.)/i);
  if (mZimmer) found.zimmer = parseGermanNumber(mZimmer[1]);

  var mBaujahr = text.match(/baujahr\D{0,10}(\d{4})/i);
  if (mBaujahr) found.baujahr = parseInt(mBaujahr[1], 10);

  var mHausgeld = text.match(/hausgeld\D{0,15}([\d.,]+)\s*€/i);
  if (mHausgeld) found.hausgeld = parseGermanNumber(mHausgeld[1]);

  var mOrt = text.match(/(\d{5})\s+([A-ZÄÖÜ][A-Za-zäöüßÄÖÜ\-]+(?:\s[A-Za-zäöüßÄÖÜ\-]+){0,2})/);
  if (mOrt) { found.plz = mOrt[1]; found.ort = mOrt[2].trim(); }

  return found;
}

/* ============ Wizard state ============ */
var STEP_COUNT = 5;
var currentStep = 0;
var renteOverridden = false;

function updateStepper(){
  document.querySelectorAll('.step-dot').forEach(function(dot){
    var i = parseInt(dot.dataset.step, 10);
    dot.classList.toggle('active', i === currentStep);
    dot.classList.toggle('done', i < currentStep);
  });
  var labels = ['Exposé (optional)', 'Objekt & Lage', 'Miete', 'Hausgeld & Kaufnebenkosten', 'Finanzierung'];
  $('step-label').innerHTML = 'Schritt <b>' + (currentStep + 1) + '</b> von ' + STEP_COUNT + ' — ' + labels[currentStep];
}

function goToStep(n){
  currentStep = Math.max(0, Math.min(STEP_COUNT - 1, n));
  document.querySelectorAll('.step').forEach(function(s){
    s.classList.toggle('active', parseInt(s.dataset.step, 10) === currentStep);
  });
  $('btn-back').style.visibility = currentStep === 0 ? 'hidden' : 'visible';
  $('btn-next').style.display = currentStep === STEP_COUNT - 1 ? 'none' : 'inline-flex';
  $('btn-analyze').style.display = currentStep === STEP_COUNT - 1 ? 'inline-flex' : 'none';
  updateStepper();
  if (currentStep === 2) updateRentEstimate();
  window.scrollTo({ top: $('tool').offsetTop - 90, behavior: 'smooth' });
}

$('btn-next').addEventListener('click', function(){ goToStep(currentStep + 1); });
$('btn-back').addEventListener('click', function(){ goToStep(currentStep - 1); });
document.querySelectorAll('.step-dot').forEach(function(dot){
  dot.style.cursor = 'pointer';
  dot.addEventListener('click', function(){ goToStep(parseInt(dot.dataset.step, 10)); });
});

/* ============ Exposé step ============ */
var URL_PATTERN = /https?:\/\/\S+|www\.\S+/i;
$('parse-btn').addEventListener('click', function(){
  var raw = $('expose').value;
  var box = $('parse-result');
  var containsUrl = URL_PATTERN.test(raw);

  var found = parseExpose(raw);
  var applied = [];
  ['ort','plz','kaufpreis','wohnflaeche','zimmer','baujahr','hausgeld'].forEach(function(key){
    var val = found[key];
    var isValid = typeof val === 'string' ? val !== '' : (val !== undefined && !isNaN(val));
    if (isValid) {
      var el = $(key);
      if (el) { el.value = found[key]; applied.push(key); }
      var tag = $('tag-' + key);
      if (tag) tag.style.display = 'inline';
    }
  });

  box.style.display = 'block';
  if (applied.length) {
    box.innerHTML = '<b>' + applied.length + ' Feld' + (applied.length === 1 ? '' : 'er') + ' erkannt:</b> ' + applied.join(', ') + '. Bitte in Schritt 2 kurz prüfen.' +
      (containsUrl ? ' <span style="color:var(--faint)">(Den Link darin konnte ich nicht öffnen — nur der Text drumherum wurde ausgewertet.)</span>' : '');
  } else if (containsUrl) {
    box.innerHTML = '<b style="color:var(--bad)">Diesen Link kann ich nicht selbst öffnen</b> — Browser blockieren das Nachladen fremder Seiten aus Sicherheitsgründen (Cross-Origin-Sperre), das lässt sich auf einer statischen Seite ohne eigenen Server nicht umgehen, auch nicht mit Tracking-Parametern oder Begleittext dran. Öffne den Link selbst, kopier den Beschreibungstext des Inserats (Kaufpreis, Wohnfläche, Zimmer, Baujahr, Hausgeld, Ort) und füg den hier ein — dann erkenne ich die Werte automatisch.';
  } else {
    box.innerHTML = 'Es konnten keine Werte erkannt werden — bitte manuell eintragen.';
  }
  if (applied.length) setTimeout(function(){ goToStep(1); }, 900);
});
$('skip-expose').addEventListener('click', function(){ goToStep(1); });

/* ============ radio chips ============ */
document.querySelectorAll('.radio-row').forEach(function(row){
  row.addEventListener('change', function(){
    row.querySelectorAll('.radio-chip').forEach(function(chip){
      chip.classList.toggle('checked', chip.querySelector('input').checked);
    });
  });
  row.querySelectorAll('.radio-chip').forEach(function(chip){
    chip.classList.toggle('checked', chip.querySelector('input').checked);
  });
});

/* ============ "weiß ich nicht" Toggles ============ */
document.querySelectorAll('.unknown-toggle').forEach(function(btn){
  var input = $(btn.dataset.target);
  btn.addEventListener('click', function(){
    var nowUnknown = !input.disabled;
    if (nowUnknown) {
      input.dataset.prevValue = input.value;
      input.dataset.prevPlaceholder = input.placeholder || '';
      input.value = '';
      input.placeholder = 'nicht bekannt';
      input.disabled = true;
      input.classList.add('is-unknown');
      btn.classList.add('active');
      btn.textContent = 'unbekannt ✕';
    } else {
      input.disabled = false;
      input.classList.remove('is-unknown');
      input.value = input.dataset.prevValue || '';
      input.placeholder = input.dataset.prevPlaceholder || '';
      btn.classList.remove('active');
      btn.textContent = 'weiß ich nicht';
    }
    if (input.id === 'baujahr') updateRentEstimate();
  });
});
function isUnknown(id){ return $(id).disabled; }

/* ============ vermietet toggle ============ */
document.getElementById('vermietet-row').addEventListener('change', function(e){
  var val = document.querySelector('input[name="vermietet"]:checked').value;
  $('miete-aktuell-group').style.display = val === 'ja' ? 'block' : 'none';
});

/* ============ Marktmiete live update ============ */
function updateRentEstimate(){
  var ort = $('ort').value;
  var wohnflaeche = parseFloat($('wohnflaeche').value);
  var baujahr = parseInt($('baujahr').value, 10);
  var zustand = (document.querySelector('input[name="zustand"]:checked') || {}).value;
  var est = estimateRent(ort, wohnflaeche, baujahr, zustand);
  if (!est) {
    $('miete-basis').textContent = 'Schätzung erscheint, sobald Ort, Wohnfläche und Baujahr aus Schritt 1 vorliegen. Frei überschreibbar — kein amtlicher Mietspiegel, sondern grobe Orientierung.';
    return;
  }
  if (!renteOverridden) $('miete_markt').value = est.miete;
  var baujahrPart = isUnknown('baujahr') ? ', Baujahr nicht bekannt (keine Anpassung)' : baujahr ? ', Baujahr-Anpassung ' + (est.bjMod >= 0 ? '+' : '') + fmtPct(est.bjMod * 100, 0) : '';
  var zustandPart = zustand === 'unbekannt' ? ', Zustand nicht bekannt (keine Anpassung)' : ', Zustand-Anpassung ' + (est.zMod >= 0 ? '+' : '') + fmtPct(est.zMod * 100, 0);
  $('miete-basis').textContent = (est.known ? 'Basis: ' : 'Ort nicht hinterlegt, bundesweiter Richtwert: ') +
    fmtNum(est.basePerSqm, 1) + ' €/m² × ' + fmtNum(wohnflaeche, 0) + ' m²' + baujahrPart + zustandPart + '. Frei überschreibbar.';
}
$('miete_markt').addEventListener('input', function(){ renteOverridden = true; });

/* ============ Kennzahlen-Berechnung ============ */
var HAUSGELD_PER_SQM = 2.8;

function calcAll(){
  var kaufpreis = parseFloat($('kaufpreis').value) || 0;
  var wohnflaeche = parseFloat($('wohnflaeche').value) || 0;
  var vermietet = document.querySelector('input[name="vermietet"]:checked').value === 'ja';

  var flags = { hausgeld: false, makler: false, mieteAktuell: false, baujahr: isUnknown('baujahr') };

  var mieteAktuellUnknown = vermietet && isUnknown('miete_aktuell');
  flags.mieteAktuell = mieteAktuellUnknown;
  var kaltmiete;
  if (vermietet && !mieteAktuellUnknown) {
    kaltmiete = parseFloat($('miete_aktuell').value) || 0;
  } else {
    kaltmiete = parseFloat($('miete_markt').value) || 0;
  }

  var hausgeld;
  if (isUnknown('hausgeld')) {
    flags.hausgeld = true;
    hausgeld = HAUSGELD_PER_SQM * wohnflaeche;
  } else {
    hausgeld = parseFloat($('hausgeld').value) || 0;
  }

  var hgnuPct = parseFloat($('hgnu').value) || 0;
  var gestPct = parseFloat($('bundesland').value) || 0;

  var maklerPct;
  if (isUnknown('makler')) {
    flags.makler = true;
    maklerPct = 0;
  } else {
    maklerPct = parseFloat($('makler').value) || 0;
  }

  var eigenkapital = parseFloat($('eigenkapital').value) || 0;
  var zinsPct = parseFloat($('zins').value) || 0;
  var tilgungPct = parseFloat($('tilgung').value) || 0;
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

  var sFaktor = 0;
  if (isFinite(faktor)) {
    if (faktor <= 18) sFaktor = 35; else if (faktor <= 20) sFaktor = 30; else if (faktor <= 22) sFaktor = 24;
    else if (faktor <= 25) sFaktor = 16; else if (faktor <= 28) sFaktor = 8; else sFaktor = 2;
  }
  var sRendite = 0;
  if (isFinite(renditeGK)) {
    if (renditeGK >= 6) sRendite = 35; else if (renditeGK >= 5) sRendite = 28; else if (renditeGK >= 4.5) sRendite = 22;
    else if (renditeGK >= 4) sRendite = 16; else if (renditeGK >= 3.5) sRendite = 10; else if (renditeGK >= 3) sRendite = 5; else sRendite = 0;
  }
  var sCashflow = cashflowMtl >= 150 ? 30 : cashflowMtl >= 50 ? 24 : cashflowMtl >= 0 ? 16 : cashflowMtl >= -100 ? 8 : 0;
  var score = Math.round(sFaktor + sRendite + sCashflow);

  return {
    ort: $('ort').value, plz: $('plz').value, kaufpreis: kaufpreis, wohnflaeche: wohnflaeche, zimmer: $('zimmer').value,
    baujahr: $('baujahr').value, zustand: (document.querySelector('input[name="zustand"]:checked')||{}).value,
    vermietet: vermietet, kaltmiete: kaltmiete,
    ppqm: ppqm, faktor: faktor, gest: gest, gestPct: gestPct, notar: notar, grundbuch: grundbuch, makler: makler, maklerPct: maklerPct,
    nebenkosten: nebenkosten, gesamtkapital: gesamtkapital, renditeKP: renditeKP, renditeGK: renditeGK,
    darlehen: darlehen, rate: rate, cashflowMtl: cashflowMtl, cashflowJahr: cashflowJahr, score: score, flags: flags
  };
}
function unknownBadge(text){ return ' <span class="badge badge-bad" style="margin-left:6px">🔴 ' + text + '</span>'; }
function estBadge(text){ return ' <span class="badge badge-warn" style="margin-left:6px">🟡 ' + text + '</span>'; }

function scoreBand(score){
  if (score >= 80) return { label: 'Kennzahlen stark', cls: 'good' };
  if (score >= 60) return { label: 'Kennzahlen solide', cls: 'good' };
  if (score >= 40) return { label: 'Prüfen / verhandeln', cls: 'warn' };
  if (score >= 20) return { label: 'Schwache Kennzahlen', cls: 'bad' };
  return { label: 'Kennzahlen sprechen dagegen', cls: 'bad' };
}

var BESICHTIGUNG = {
  'Substanz & Technik': ['Fenster (Dichtungen, Verglasung, Alter)', 'Feuchtigkeit an Wänden und Decken', 'Schimmel, auch hinter Möbeln/Schränken', 'Heizung (Alter, Wartungsprotokoll, Verteilung)', 'Elektrik (Sicherungskasten, Zustand der Leitungen)', 'Wasserleitungen und Wasserdruck', 'Böden (Risse, Unebenheiten, Trittschall)', 'Wände (Risse, Putzschäden)'],
  'Ausstattung': ['Bad (Fugen, Lüftung, Abfluss)', 'Küche (falls vorhanden, Alter, Zustand)', 'Balkon/Terrasse (Abdichtung, Zustand)', 'Keller (Feuchtigkeit, Geruch)', 'Stellplatz/Garage (Zufahrt, Zustand)'],
  'Umfeld': ['Lärm zu unterschiedlichen Tageszeiten', 'Nachbarschaft und Hausgemeinschaft', 'Gerüche im Treppenhaus/Keller', 'Mobilfunkempfang', 'Internetverfügbarkeit (Anbieter, Bandbreite)']
};
var UNTERLAGEN = {
  'Objekt': ['Exposé', 'Grundriss', 'Wohnflächenberechnung', 'Energieausweis'],
  'Eigentum & WEG': ['Grundbuchauszug', 'Teilungserklärung', 'Gemeinschaftsordnung', 'Wirtschaftsplan', 'Jahresabrechnung', 'Vermögensbericht', 'WEG-Protokolle der letzten 3 Jahre', 'Beschlusssammlung', 'Verwaltervertrag', 'Höhe der Instandhaltungsrücklage'],
  'Vermietung (falls vermietet)': ['Mietvertrag', 'Mietkonto / Zahlungsnachweise', 'Nebenkostenabrechnungen', 'Mietaufstellung'],
  'Sonstiges': ['Gebäudeversicherung', 'Informationen zu geplanten Sanierungen', 'Informationen zu bestehenden/geplanten Sonderumlagen']
};

function renderChecklist(data, cls){
  var html = '';
  for (var cat in data) {
    html += '<div class="check-cat">' + cat + '</div><ul class="check-list ' + cls + '">';
    data[cat].forEach(function(item){ html += '<li>' + item + '</li>'; });
    html += '</ul>';
  }
  return html;
}

/* ============ Ergebnis-Rendering ============ */
$('btn-analyze').addEventListener('click', function(){
  var d = calcAll();
  var band = scoreBand(d.score);
  var colorVar = 'var(--' + band.cls + ')';
  var cfPosNeg = d.cashflowMtl >= 0 ? 'pos' : 'neg';

  var blocks = [];

  var zustandText = d.zustand === 'unbekannt' ? 'nicht bekannt' : (d.zustand || '–');
  blocks.push('<div class="result-block reveal"><div class="card"><div class="rk"><span class="rk-num">01</span><h3>Objekt</h3></div>' +
    '<p class="sub" style="max-width:none">' + (d.zimmer ? d.zimmer + '-Zimmer-Wohnung' : 'Wohnung') + (d.ort ? ' in ' + d.ort : '') + (d.plz ? ' (' + d.plz + ')' : '') +
    (d.baujahr ? ', Baujahr ' + d.baujahr : d.flags.baujahr ? ', Baujahr nicht bekannt' : '') + ', ' + fmtNum(d.wohnflaeche, 0) + ' m², Zustand: ' + zustandText + '.</p></div></div>');

  blocks.push('<div class="result-block reveal"><div class="card"><div class="rk"><span class="rk-num">02</span><h3>Kaufpreisanalyse</h3></div>' +
    '<div class="metric-grid three">' +
    '<div class="metric"><span>Kaufpreis</span><b>' + fmtEUR(d.kaufpreis) + '</b></div>' +
    '<div class="metric"><span>Preis / m²</span><b>' + fmtEUR(d.ppqm) + '</b></div>' +
    '<div class="metric"><span>Kaufpreisfaktor</span><b>' + (isFinite(d.faktor) ? fmtNum(d.faktor) + '×' : '–') + '</b></div>' +
    '</div></div></div>');

  var mieteLabel = (d.vermietet && !d.flags.mieteAktuell) ? 'Aktuelle Kaltmiete' : 'Marktmiete (geschätzt)';
  blocks.push('<div class="result-block reveal"><div class="card"><div class="rk"><span class="rk-num">03</span><h3>Mietanalyse</h3></div>' +
    (d.flags.mieteAktuell ? '<p class="field-hint" style="margin-bottom:14px">' + unknownBadge('Aktuelle Miete nicht bekannt') + ' — mit der Marktmiete-Schätzung aus Schritt 2 gerechnet.</p>' : '') +
    '<div class="metric-grid">' +
    '<div class="metric"><span>' + mieteLabel + '</span><b>' + fmtEUR(d.kaltmiete) + ' / Monat</b></div>' +
    '<div class="metric"><span>Jahreskaltmiete</span><b>' + fmtEUR(d.kaltmiete * 12) + '</b></div>' +
    '</div></div></div>');

  blocks.push('<div class="result-block reveal"><div class="card"><div class="rk"><span class="rk-num">04</span><h3>Rendite &amp; Kaufnebenkosten</h3></div>' +
    '<div class="metric-grid" style="margin-bottom:18px">' +
    '<div class="metric accent"><span>Bruttorendite (Kaufpreis)</span><b>' + fmtPct(d.renditeKP) + '</b></div>' +
    '<div class="metric accent"><span>Bruttorendite (Gesamtkapital)</span><b>' + fmtPct(d.renditeGK) + '</b></div>' +
    '</div>' +
    '<div class="breakdown-row"><span>Grunderwerbsteuer (' + fmtPct(d.gestPct, 1) + ')</span><b>' + fmtEUR(d.gest) + '</b></div>' +
    '<div class="breakdown-row"><span>Notar (1,5 %)</span><b>' + fmtEUR(d.notar) + '</b></div>' +
    '<div class="breakdown-row"><span>Grundbuch (0,5 %)</span><b>' + fmtEUR(d.grundbuch) + '</b></div>' +
    '<div class="breakdown-row"><span>Maklerprovision' + (d.flags.makler ? unknownBadge('unbekannt, mit 0 % gerechnet') : ' (' + fmtPct(d.maklerPct, 2) + ')') + '</span><b>' + fmtEUR(d.makler) + '</b></div>' +
    '<div class="breakdown-row total"><span>Gesamtkapitalbedarf</span><b>' + fmtEUR(d.gesamtkapital) + '</b></div>' +
    '</div></div>');

  blocks.push('<div class="result-block reveal"><div class="card"><div class="rk"><span class="rk-num">05</span><h3>Finanzierung &amp; Cashflow</h3></div>' +
    (d.flags.hausgeld ? '<p class="field-hint" style="margin-bottom:14px">' + estBadge('Hausgeld nicht bekannt') + ' — mit ' + fmtNum(HAUSGELD_PER_SQM,1) + ' €/m² geschätzt, bitte vor der Besichtigung erfragen.</p>' : '') +
    '<div class="metric-grid">' +
    '<div class="metric"><span>Darlehenssumme</span><b>' + fmtEUR(d.darlehen) + '</b></div>' +
    '<div class="metric"><span>Monatliche Rate</span><b>' + fmtEUR(d.rate) + '</b></div>' +
    '<div class="metric ' + cfPosNeg + '"><span>Cashflow / Monat</span><b>' + (d.cashflowMtl >= 0 ? '+' : '') + fmtEUR(d.cashflowMtl) + '</b></div>' +
    '<div class="metric ' + cfPosNeg + '"><span>Cashflow / Jahr</span><b>' + (d.cashflowJahr >= 0 ? '+' : '') + fmtEUR(d.cashflowJahr) + '</b></div>' +
    '</div></div></div>');

  var flagCount = (d.flags.baujahr?1:0) + (d.flags.hausgeld?1:0) + (d.flags.makler?1:0) + (d.flags.mieteAktuell?1:0);
  blocks.push('<div class="result-block reveal"><div class="card score-card">' +
    '<span class="field-hint">KENNZAHLEN-SCORE</span>' +
    '<div class="score-num" style="color:' + colorVar + '">' + d.score + '</div>' +
    '<span class="badge badge-' + band.cls + '"><span class="badge-dot"></span>' + band.label + '</span>' +
    '<div class="score-bar"><div class="score-bar-fill" style="width:' + Math.max(d.score, 2) + '%;background:' + colorVar + '"></div></div>' +
    (flagCount ? '<p class="field-hint" style="margin-top:16px;text-align:left">🔴/🟡 ' + flagCount + ' Angabe' + (flagCount===1?'':'n') + ' war' + (flagCount===1?'':'en') + ' nicht bekannt und wurde' + (flagCount===1?'':'n') + ' mit einer Schätzung ersetzt (markiert in den Blöcken oben) — Score entsprechend mit Vorsicht lesen.</p>' : '') +
    '<p class="field-hint" style="margin-top:10px;text-align:left">Score bewertet nur Kaufpreisfaktor, Rendite und Cashflow. Lage, Zustand, WEG-Risiken und Red Flags fließen hier <strong>nicht</strong> ein — dafür braucht es die echten Objektunterlagen. Zinssatz ist ein Platzhalter, kein aktuelles Bankangebot.</p>' +
    '</div></div>');

  blocks.push('<div class="result-block reveal"><div class="card"><div class="rk"><span class="rk-num">06</span><h3>Checkliste für die Besichtigung</h3></div>' +
    renderChecklist(BESICHTIGUNG, '') + '</div></div>');

  blocks.push('<div class="result-block reveal"><div class="card"><div class="rk"><span class="rk-num">07</span><h3>Unterlagen, die du anfordern solltest</h3></div>' +
    renderChecklist(UNTERLAGEN, 'docs') + '</div></div>');

  $('results-inner').innerHTML = blocks.join('');
  $('results').style.display = 'block';
  $('tool').style.display = 'none';

  var els = document.querySelectorAll('#results .reveal');
  els.forEach(function(el, i){
    setTimeout(function(){ el.classList.add('in'); }, i * 140);
  });

  window.scrollTo({ top: $('results').offsetTop - 80, behavior: 'smooth' });
});

$('btn-edit').addEventListener('click', function(){
  $('results').style.display = 'none';
  $('tool').style.display = 'block';
  window.scrollTo({ top: $('tool').offsetTop - 90, behavior: 'smooth' });
});

/* ============ init ============ */
goToStep(0);
$('hgnu-out').textContent = $('hgnu').value + ' % — Rücklage, Verwaltung u. a. trägt der Eigentümer';
$('hgnu').addEventListener('input', function(){ $('hgnu-out').textContent = $('hgnu').value + ' % — Rücklage, Verwaltung u. a. trägt der Eigentümer'; });

var io = new IntersectionObserver(function(es){
  es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
}, { threshold: .12 });
document.querySelectorAll('#methodik.reveal').forEach(function(el){ io.observe(el); });
})();
