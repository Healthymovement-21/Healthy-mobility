/* ---------------------------------------------------------------
   Der rote Faden: die zehn Schritte an einer einzigen Stelle.

   Bis eben stand die Liste zweimal im Projekt — einmal ausfuehrlich
   in schritte.html und einmal verkuerzt in Mein Bereich. Die beiden
   waren auseinandergelaufen: derselbe Schritt hiess an einer Stelle
   "Deinen Behandlungspreis festlegen" und an der anderen "Deinen Preis
   festlegen". Jetzt liest jede Seite dieselben Namen aus dieser Datei.

   Ueber den zehn Schritten liegen sechs Abschnitte. Sie sagen dem
   Nutzer, in welchem Teil der Reise er gerade ist:

     1 Verstehen · 2 Planen · 3 Kalkulieren
     4 Vorbereiten · 5 Starten · 6 Arbeiten
--------------------------------------------------------------- */
(function(){
  'use strict';

  const ABSCHNITTE = [
    'Verstehen', 'Planen', 'Kalkulieren', 'Vorbereiten', 'Starten', 'Arbeiten'
  ];

  const SCHRITTE = [
    {
      id: 's1', abschnitt: 'Verstehen',
      titel: 'Lohnt sich das überhaupt?',
      zweck: 'Bevor du irgendetwas anmeldest: rechne einmal durch, was neben dem Hauptjob realistisch übrig bleibt und wie viele Abende dich das kostet.',
      links: [
        {text:'Verdienst berechnen', art:'Rechner', href:'verdienst.html', haupt:true},
        {text:'Kapitel 1 lesen', art:'5 Minuten', href:'fahrplan.html'}
      ]
    },
    {
      id: 's2', abschnitt: 'Planen',
      titel: 'Anmeldung und Absicherung',
      zweck: 'Der Teil, der wirklich erledigt sein muss, bevor die erste Patientin auf der Bank liegt: Finanzamt, BGW, Berufshaftpflicht.',
      links: [
        {text:'Checkliste abarbeiten', art:'18 Punkte', href:'fahrplan.html#checkliste', haupt:true},
        {text:'Kapitel 2 und 3', art:'Anmeldung, Versicherung', href:'fahrplan.html'}
      ]
    },
    {
      id: 's3', abschnitt: 'Kalkulieren',
      titel: 'Deinen Preis festlegen',
      zweck: 'Vom Wunscheinkommen rückwärts zum Preis pro Behandlung, mit Fahrtzeit und Steuerrücklage statt Bauchgefühl.',
      links: [
        {text:'Preis berechnen', art:'Rechner', href:'werkzeuge.html', haupt:true},
        {text:'Kapitel 4', art:'Preise und Kalkulation', href:'fahrplan.html'}
      ]
    },
    {
      id: 's4', abschnitt: 'Kalkulieren',
      titel: 'Wie viele Patient:innen du brauchst',
      zweck: 'Du sagst, was am Monatsende übrig bleiben soll. Der Rechner sagt dir, wie viele Termine das bei welchem Preis bedeutet.',
      links: [
        {text:'Rückwärts rechnen', art:'Rechner', href:'ziel-rechner.html', haupt:true}
      ]
    },
    {
      id: 's5', abschnitt: 'Kalkulieren',
      titel: 'Was am Monatsende übrig bleibt',
      zweck: 'Trag deine echten Behandlungen ein und sieh, was nach Ausgaben und Rücklage tatsächlich bleibt. Mit PDF-Export fürs eigene Archiv.',
      links: [
        {text:'Monat kalkulieren', art:'Rechner', href:'monatsrechner.html', haupt:true},
        {text:'Zeit und Auslastung', art:'Rechner', href:'planungsrechner.html'}
      ]
    },
    {
      id: 's6', abschnitt: 'Vorbereiten',
      titel: 'Deine Unterlagen vorbereiten',
      zweck: 'Honorarvereinbarung, Behandlungsvertrag und Datenschutz-Information ausfüllen — und prüfen lassen, bevor jemand unterschreibt.',
      links: [
        {text:'Honorarvereinbarung', art:'PDF', href:'dateien/Honorarvereinbarung.pdf', haupt:true},
        {text:'Behandlungsvertrag', art:'PDF', href:'dateien/Behandlungsvertrag.pdf'},
        {text:'Datenschutz-Information', art:'PDF', href:'dateien/Datenschutz-Patienten.pdf'}
      ]
    },
    {
      id: 's7', abschnitt: 'Starten',
      titel: 'Patient:innen und Termine organisieren',
      zweck: 'Wer kommt wann, und wo steht das? Eine Liste und ein Wochenplan reichen für den Anfang völlig — Hauptsache, es steht nicht nur im Kopf.',
      links: [
        {text:'Kalender', art:'im Browser', href:'termine.html', haupt:true},
        {text:'Patientenliste', art:'PDF', href:'dateien/Patientenliste.pdf'},
        {text:'Terminübersicht', art:'PDF', href:'dateien/Terminuebersicht.pdf'},
        {text:'Online-Terminbuchung', art:'Kurzkapitel', href:'terminbuchung.html'}
      ]
    },
    {
      id: 's8', abschnitt: 'Starten',
      titel: 'Behandlungen dokumentieren',
      zweck: 'Anamnese beim ersten Termin, danach jede Behandlung in zwei Sätzen festhalten. Eine Dokumentation wird von dir erwartet, und im Zweifel schützt sie dich.',
      links: [
        {text:'Anamnesebogen', art:'PDF', href:'dateien/Anamnesebogen.pdf', haupt:true},
        {text:'Dokumentationsbogen', art:'PDF', href:'dateien/Dokumentationsvorlage.pdf'},
        {text:'Kapitel 6', art:'Dokumentation', href:'fahrplan.html'}
      ]
    },
    {
      id: 's9', abschnitt: 'Starten',
      titel: 'Deine erste Rechnung schreiben',
      zweck: 'Deine Daten trägst du einmal ein, danach dauert jede Rechnung zwei Minuten. Die Nummer läuft automatisch weiter, der QR-Code zum Überweisen ist drauf.',
      links: [
        {text:'Rechnung erstellen', art:'Rechner', href:'dateien/PhysioNebenbei-Rechnungsgenerator.html', haupt:true},
        {text:'Kapitel 5', art:'Pflichtangaben', href:'fahrplan.html'}
      ]
    },
    {
      id: 's10', abschnitt: 'Arbeiten',
      titel: 'Dranbleiben und nachsteuern',
      zweck: 'Nach ein paar Monaten weißt du, was wirklich läuft. Dann lohnt der Blick auf Einnahmen, Auslastung und das, was der Nebenjob mit deiner Woche macht.',
      links: [
        {text:'Einnahmen und Ausgaben', art:'Rechner', href:'dateien/PhysioNebenbei-Einnahmen-Ausgaben.html', haupt:true},
        {text:'Gehalt und Stunden', art:'Rechner', href:'gehaltsrechner.html'},
        {text:'Häufige Fehler', art:'10 Punkte', href:'fehler.html'}
      ]
    }
  ];

  const KEY = 'physionebenbei-schritte';

  function stand(){
    try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {}; }
    catch(e){ return {}; }
  }
  function speichern(s){
    try { localStorage.setItem(KEY, JSON.stringify(s)); } catch(e){}
  }

  /* Der naechste offene Schritt — der erste ohne Haken. Ist alles
     abgehakt, gibt es keinen mehr und die Seiten zeigen den
     Abschlusstext. */
  function naechster(s){
    s = s || stand();
    for (let i = 0; i < SCHRITTE.length; i++){
      if (!s[SCHRITTE[i].id]) return {schritt: SCHRITTE[i], nr: i + 1};
    }
    return null;
  }

  function erledigt(s){
    s = s || stand();
    return SCHRITTE.filter(x => s[x.id]).length;
  }

  window.Fahrplan = {
    KEY: KEY,
    ABSCHNITTE: ABSCHNITTE,
    SCHRITTE: SCHRITTE,
    anzahl: SCHRITTE.length,
    stand: stand,
    speichern: speichern,
    naechster: naechster,
    erledigt: erledigt
  };
})();
