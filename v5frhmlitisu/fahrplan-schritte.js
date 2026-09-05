/* ---------------------------------------------------------------
   Die Roadmap: die zehn Kapitel an einer einzigen Stelle.

   Das sind dieselben zehn Kapitel wie im Handbuch (fahrplan.html),
   in derselben Reihenfolge. Mein Bereich, die Roadmap-Übersicht und
   die einzelnen Kapitel-Seiten lesen alle von hier, damit nirgends
   ein anderer Titel für dasselbe Kapitel auftaucht.

   Ueber den zehn Kapiteln liegen sechs Abschnitte. Sie sagen dem
   Nutzer, in welchem Teil der Reise er gerade ist:

     1 Verstehen · 2 Planen · 3 Kalkulieren
     4 Vorbereiten · 5 Starten · 6 Arbeiten

   "link" ist optional und wird nur auf der Kapitel-Seite selbst als
   ein einziger, zurückhaltender Hinweis auf ein passendes Werkzeug
   gezeigt — nie als Pflichtschritt. Fehlt er, gibt es keinen.
--------------------------------------------------------------- */
(function(){
  'use strict';

  const ABSCHNITTE = [
    'Verstehen', 'Planen', 'Kalkulieren', 'Vorbereiten', 'Starten', 'Arbeiten'
  ];

  const SCHRITTE = [
    {
      id: 's1', abschnitt: 'Verstehen',
      titel: 'Bist du bereit?',
      zweck: 'Ein kurzer Realitäts-Check, ob eine Nebentätigkeit gerade in dein Leben passt.'
    },
    {
      id: 's2', abschnitt: 'Planen',
      titel: 'Anmeldung & Formalitäten',
      zweck: 'Die Anmeldung beim Finanzamt und die nötigen Formalitäten für den Start.'
    },
    {
      id: 's3', abschnitt: 'Planen',
      titel: 'Versicherungen',
      zweck: 'Berufshaftpflicht, Kranken- und Rentenversicherung: was für dich als Nebenberufler:in gilt.'
    },
    {
      id: 's4', abschnitt: 'Kalkulieren',
      titel: 'Preise & Kalkulation',
      zweck: 'Wie du einen Preis festlegst und was du dabei einkalkulieren solltest.'
      /* Kein zusaetzlicher Werkzeug-Hinweis: das Kapitel verlinkt den
         Preisrechner schon in seinem eigenen Text. */
    },
    {
      id: 's5', abschnitt: 'Vorbereiten',
      titel: 'Rechnung',
      zweck: 'Was auf eine ordnungsgemäße Rechnung gehört.',
      link: {text:'Rechnung erstellen', href:'dateien/PhysioNebenbei-Rechnungsgenerator.html'}
    },
    {
      id: 's6', abschnitt: 'Vorbereiten',
      titel: 'Dokumentation',
      zweck: 'Was du zu jeder Behandlung schriftlich festhalten solltest.'
      /* Kein zusaetzlicher Werkzeug-Hinweis: das Kapitel verlinkt die
         Vorlage schon in seinem eigenen Text. */
    },
    {
      id: 's7', abschnitt: 'Vorbereiten',
      titel: 'Datenschutz-Grundlagen',
      zweck: 'Die wichtigsten Grundregeln im Umgang mit Patientendaten.',
      link: {text:'Datenschutz-Information', href:'dateien/Datenschutz-Patienten.pdf'}
    },
    {
      id: 's8', abschnitt: 'Starten',
      titel: 'Erste Patient:innen gewinnen',
      zweck: 'Wie die ersten Patient:innen in der Praxis meistens wirklich zustande kommen.',
      link: {text:'Kalender', href:'termine.html'}
    },
    {
      id: 's9', abschnitt: 'Starten',
      titel: 'Die ersten 30 Tage',
      zweck: 'Ein realistischer Zeitplan für die ersten vier Wochen.'
    },
    {
      id: 's10', abschnitt: 'Arbeiten',
      titel: 'Typische Anfänger-Fehler',
      zweck: 'Die Fehler, die am Anfang am häufigsten passieren — und wie du sie vermeidest.',
      link: {text:'Häufige Fehler', href:'fehler.html'}
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

  /* Das naechste offene Kapitel — das erste ohne Haken. Ist alles
     abgehakt, gibt es keins mehr und die Seiten zeigen den
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

  /* Ein einzelnes Kapitel als erledigt markieren, unabhaengig davon,
     ob vorherige Kapitel schon abgehakt sind — wer in der Uebersicht
     vor- oder zurueckspringt, soll trotzdem seinen eigenen Stand
     behalten. */
  function markieren(nr){
    const s = stand();
    const k = SCHRITTE[nr - 1];
    if (!k) return;
    s[k.id] = true;
    speichern(s);
  }

  window.Fahrplan = {
    KEY: KEY,
    ABSCHNITTE: ABSCHNITTE,
    SCHRITTE: SCHRITTE,
    anzahl: SCHRITTE.length,
    stand: stand,
    speichern: speichern,
    naechster: naechster,
    erledigt: erledigt,
    markieren: markieren
  };
})();
