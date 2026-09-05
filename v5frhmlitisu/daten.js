/* ============================================================
   PhysioNebenbei — gemeinsame Datenschicht

   Alle Rechner und der Mein-Bereich lesen und schreiben durch dieses
   Modul. Dadurch ist der Preis, den du im Preis-Kalkulator einträgst,
   auch im Ziel-Rechner und im Mein-Bereich derselbe.

   Gespeichert wird im localStorage des Browsers, also auf dem Gerät.
   Kein Konto, kein Server, keine Übertragung. Google Drive ist ein
   getrennter, freiwilliger Zusatz (siehe drive-sync.js) und wird nie
   von allein aktiv.

   Aufbau des Datensatzes:

     zahlen      die geteilten Rechnerwerte (Ziel, Preis, Zeiten, Kosten)
     finanzen    Umsatz und Ausgaben des laufenden Monats
     profil      deine eigenen Angaben für Rechnungen
     termine     deine Termine — enthalten Patientennamen und werden
                 deshalb nur auf ausdrücklichen Wunsch synchronisiert
     einstellung was du synchronisieren möchtest
   ============================================================ */
(function (global) {
  'use strict';

  const SCHLUESSEL = 'physionebenbei-daten';
  const VERSION = 1;

  const LEER = {
    version: VERSION,
    gespeichertAm: null,
    zahlen: {
      ziel: 500,        // gewünschter Betrag im Monat, nach Rücklage
      preis: 70,        // Preis je Behandlung
      satz: 30,         // Rücklage für Steuer in Prozent
      fix: 60,          // feste Ausgaben im Monat
      dauer: 45,        // reine Behandlungsdauer in Minuten
      fahrzeit: 20,     // Fahrt hin und zurück in Minuten
      doku: 5,          // Dokumentation und Orga in Minuten
      km: 12,           // gefahrene Kilometer je Termin
      kmsatz: 0.30,     // Kosten je Kilometer
      stunden: 4,       // eingeplante Stunden pro Woche
      auslastung: 80,   // realistische Auslastung in Prozent
      frequenz: 1       // Termine je Patient:in und Woche
    },
    finanzen: { umsatz: 0, ausgaben: 0, monat: '' },
    profil:   { name: '', zusatz: '', strasse: '', plzOrt: '', email: '', telefon: '' },
    termine:  [],
    einstellung: {
      driveZahlen: true,    // Zahlen und Einstellungen synchronisieren
      driveTermine: false   // Termine bewusst standardmäßig aus
    }
  };

  /* ---------- tief kopieren, damit LEER unangetastet bleibt ---------- */
  function kopie(o){ return JSON.parse(JSON.stringify(o)); }

  /* ---------- zusammenführen: fehlende Felder aus LEER auffüllen ----------
     So bleiben ältere gespeicherte Datensätze nutzbar, wenn später ein
     Feld dazukommt. */
  function ergaenzen(ziel, vorlage){
    Object.keys(vorlage).forEach(k => {
      if (vorlage[k] !== null && typeof vorlage[k] === 'object' && !Array.isArray(vorlage[k])){
        if (typeof ziel[k] !== 'object' || ziel[k] === null || Array.isArray(ziel[k])) ziel[k] = {};
        ergaenzen(ziel[k], vorlage[k]);
      } else if (!(k in ziel)){
        ziel[k] = vorlage[k];
      }
    });
    return ziel;
  }

  let daten = kopie(LEER);
  let schmutzig = false;                 // ungespeicherte Änderungen?
  const horcher = [];                    // Rückrufe bei Änderungen

  function laden(){
    try {
      const roh = localStorage.getItem(SCHLUESSEL);
      if (roh){
        const geparst = JSON.parse(roh);
        daten = ergaenzen(geparst, LEER);
      }
    } catch(e){
      daten = kopie(LEER);
    }
    schmutzig = false;
    return daten;
  }

  function speichern(){
    daten.gespeichertAm = new Date().toISOString();
    try {
      localStorage.setItem(SCHLUESSEL, JSON.stringify(daten));
      schmutzig = false;
      melden();
      return true;
    } catch(e){
      /* Privates Fenster oder voller Speicher: ehrlich melden statt
         so zu tun, als sei gespeichert worden. */
      return false;
    }
  }

  function melden(){ horcher.forEach(fn => { try { fn(daten, schmutzig); } catch(e){} }); }

  /* ---------- öffentliche Schnittstelle ---------- */
  const Daten = {
    alle(){ return daten; },
    zahlen(){ return daten.zahlen; },
    profil(){ return daten.profil; },
    termine(){ return daten.termine; },
    finanzen(){ return daten.finanzen; },
    einstellung(){ return daten.einstellung; },

    /* Einen Wert setzen. Speichert nicht sofort — erst wenn jemand
       speichern() aufruft oder die Seite es automatisch tut. */
    setze(bereich, feld, wert){
      if (!daten[bereich]) daten[bereich] = {};
      if (daten[bereich][feld] === wert) return false;
      daten[bereich][feld] = wert;
      schmutzig = true;
      melden();
      return true;
    },

    setzeBereich(bereich, objekt){
      daten[bereich] = objekt;
      schmutzig = true;
      melden();
    },

    speichern: speichern,
    laden: laden,
    schmutzig(){ return schmutzig; },
    gespeichertAm(){ return daten.gespeichertAm; },

    /* Auf Änderungen horchen, etwa für die Statuszeile */
    beiAenderung(fn){ horcher.push(fn); },

    /* ---------- Export und Import ----------
       Ein einzelnes JSON, das man sich selbst speichert. Nichts geht
       dabei an einen Server. */
    exportieren(){
      const inhalt = JSON.stringify(daten, null, 2);
      const blob = new Blob([inhalt], {type:'application/json'});
      const url = URL.createObjectURL(blob);
      const heute = new Date().toISOString().slice(0,10);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'PhysioNebenbei-Daten-' + heute + '.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    },

    /* Gibt eine Zusammenfassung zurück, damit die Seite melden kann,
       was tatsächlich übernommen wurde. */
    importieren(text){
      let neu;
      try { neu = JSON.parse(text); }
      catch(e){ return {ok:false, grund:'Das ist keine gültige PhysioNebenbei-Datei.'}; }

      if (!neu || typeof neu !== 'object' || !neu.zahlen){
        return {ok:false, grund:'In der Datei fehlen die erwarteten Felder.'};
      }
      daten = ergaenzen(neu, LEER);
      daten.version = VERSION;
      const ok = speichern();
      return {
        ok: ok,
        grund: ok ? '' : 'Der Browser lässt gerade kein Speichern zu.',
        termine: Array.isArray(daten.termine) ? daten.termine.length : 0
      };
    },

    /* Alles auf Anfang. Der Fahrplan-Fortschritt liegt in einem eigenen
       Schlüssel und bleibt davon unberührt. */
    zuruecksetzen(){
      daten = kopie(LEER);
      return speichern();
    },

    /* ---------- Felder mit Eingaben verbinden ----------
       koppeln('zahlen', {preis:'#preis', ziel:'#ziel'}) füllt die Felder
       aus dem Speicher und schreibt Änderungen zurück. Rechner, die
       diese Funktion nutzen, teilen sich damit automatisch ihre Werte. */
    koppeln(bereich, zuordnung, beiAenderung){
      const felder = [];
      Object.keys(zuordnung).forEach(feld => {
        const el = document.querySelector(zuordnung[feld]);
        if (!el) return;
        const gespeichert = daten[bereich] ? daten[bereich][feld] : undefined;
        if (gespeichert !== undefined && gespeichert !== null && gespeichert !== '') {
          el.value = gespeichert;
        }
        const schreiben = () => {
          const roh = el.type === 'number'
            ? parseFloat(String(el.value).replace(',', '.'))
            : el.value;
          Daten.setze(bereich, feld, el.type === 'number' ? (isFinite(roh) ? roh : 0) : roh);
          if (typeof beiAenderung === 'function') beiAenderung();
        };
        el.addEventListener('input', schreiben);
        el.addEventListener('change', schreiben);
        felder.push(el);
      });
      return felder;
    }
  };

  laden();
  global.Daten = Daten;

})(window);
