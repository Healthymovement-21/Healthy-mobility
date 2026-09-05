/* ============================================================
   PhysioNebenbei — freiwillige Google-Drive-Synchronisation

   ── Was du eintragen musst ──────────────────────────────────
   Damit der Knopf funktioniert, brauchst du eine OAuth-Client-ID aus
   deinem eigenen Google-Cloud-Projekt:

     1. console.cloud.google.com öffnen, Projekt anlegen
     2. APIs & Dienste → Bibliothek → "Google Drive API" aktivieren
     3. APIs & Dienste → OAuth-Zustimmungsbildschirm ausfüllen
     4. Anmeldedaten → OAuth-Client-ID erstellen, Typ "Webanwendung"
     5. Unter "Autorisierte JavaScript-Quellen" die Adresse eintragen,
        unter der dein Kundenbereich läuft, zum Beispiel
        https://healthymovement-21.github.io
     6. Die erzeugte Client-ID unten einsetzen

   Solange das Feld leer ist, zeigt der Bereich einen Hinweis statt
   eines toten Knopfes. Alles andere im Produkt funktioniert
   unverändert weiter — Drive ist ein Zusatz, kein Fundament.
   ============================================================ */

const DRIVE_CLIENT_ID = '';

/* ------------------------------------------------------------
   Ab hier nichts mehr ändern.
   ------------------------------------------------------------ */
(function (global) {
  'use strict';

  /* Wir fragen bewusst nur "drive.file" an. Diese Berechtigung erlaubt
     ausschließlich den Zugriff auf Dateien, die diese Anwendung selbst
     angelegt hat. Dein übriges Google Drive bleibt unsichtbar. */
  const BERECHTIGUNG = 'https://www.googleapis.com/auth/drive.file';
  const DATEINAME = 'PhysioNebenbei-Daten.json';
  const MERKER = 'physionebenbei-drive';

  let token = null;          // nur im Arbeitsspeicher, wird nie gespeichert
  let tokenClient = null;
  let gisGeladen = false;

  function merker(){
    try { return JSON.parse(localStorage.getItem(MERKER) || '{}'); }
    catch(e){ return {}; }
  }
  function merkerSetzen(o){
    try { localStorage.setItem(MERKER, JSON.stringify(o)); } catch(e){}
  }

  /* ---------- Googles Skript erst laden, wenn jemand verbinden will ----------
     Vorher geht kein einziger Aufruf an Google. Wer Drive nie benutzt,
     baut auch nie eine Verbindung dorthin auf. */
  function gisLaden(){
    return new Promise((erfuellt, abgelehnt) => {
      if (gisGeladen && global.google && global.google.accounts) return erfuellt();
      const s = document.createElement('script');
      s.src = 'https://accounts.google.com/gsi/client';
      s.async = true;
      s.onload = () => { gisGeladen = true; erfuellt(); };
      s.onerror = () => abgelehnt(new Error('Google-Skript konnte nicht geladen werden.'));
      document.head.appendChild(s);
    });
  }

  function eingerichtet(){ return DRIVE_CLIENT_ID.trim().length > 0; }

  async function verbinden(){
    if (!eingerichtet()) throw new Error('nicht-eingerichtet');
    await gisLaden();
    return new Promise((erfuellt, abgelehnt) => {
      tokenClient = global.google.accounts.oauth2.initTokenClient({
        client_id: DRIVE_CLIENT_ID.trim(),
        scope: BERECHTIGUNG,
        callback: (antwort) => {
          if (antwort && antwort.access_token){
            token = antwort.access_token;
            const m = merker();
            m.verbundenAm = new Date().toISOString();
            merkerSetzen(m);
            erfuellt(true);
          } else {
            abgelehnt(new Error('Keine Freigabe erhalten.'));
          }
        },
        error_callback: () => abgelehnt(new Error('Die Anmeldung wurde abgebrochen.'))
      });
      tokenClient.requestAccessToken({prompt: ''});
    });
  }

  function trennen(){
    if (token && global.google && global.google.accounts){
      try { global.google.accounts.oauth2.revoke(token); } catch(e){}
    }
    token = null;
    merkerSetzen({});
  }

  function verbunden(){ return token !== null; }

  /* ---------- Was überhaupt hochgeladen wird ----------
     Bewusst getrennt: Zahlen und Einstellungen sind unverfängliche
     eigene Kalkulationsdaten. Termine enthalten Patientennamen und
     gehen nur mit, wenn das ausdrücklich eingeschaltet ist. */
  function paket(){
    const d = global.Daten.alle();
    const e = global.Daten.einstellung();
    const raus = {
      version: d.version,
      gespeichertAm: d.gespeichertAm,
      hochgeladenAm: new Date().toISOString()
    };
    if (e.driveZahlen){
      raus.zahlen = d.zahlen;
      raus.finanzen = d.finanzen;
      raus.profil = d.profil;
      raus.einstellung = d.einstellung;
    }
    if (e.driveTermine){
      raus.termine = d.termine;
    }
    return raus;
  }

  async function dateiSuchen(){
    const u = 'https://www.googleapis.com/drive/v3/files'
            + '?q=' + encodeURIComponent("name='" + DATEINAME + "' and trashed=false")
            + '&spaces=drive&fields=files(id,name,modifiedTime)';
    const a = await fetch(u, {headers:{Authorization:'Bearer ' + token}});
    if (!a.ok) throw new Error('Drive antwortet nicht (' + a.status + ').');
    const j = await a.json();
    return (j.files && j.files[0]) || null;
  }

  async function hochladen(){
    if (!verbunden()) throw new Error('nicht-verbunden');
    const inhalt = JSON.stringify(paket(), null, 2);
    const vorhanden = await dateiSuchen();

    const grenze = 'physionebenbei' + Date.now();
    const metadaten = {name: DATEINAME, mimeType: 'application/json'};
    const koerper =
      '--' + grenze + '\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadaten) + '\r\n' +
      '--' + grenze + '\r\nContent-Type: application/json\r\n\r\n' +
      inhalt + '\r\n--' + grenze + '--';

    const u = vorhanden
      ? 'https://www.googleapis.com/upload/drive/v3/files/' + vorhanden.id + '?uploadType=multipart'
      : 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';

    const a = await fetch(u, {
      method: vorhanden ? 'PATCH' : 'POST',
      headers: {
        Authorization: 'Bearer ' + token,
        'Content-Type': 'multipart/related; boundary=' + grenze
      },
      body: koerper
    });
    if (!a.ok) throw new Error('Hochladen fehlgeschlagen (' + a.status + ').');

    const m = merker();
    m.zuletzt = new Date().toISOString();
    merkerSetzen(m);
    return true;
  }

  async function herunterladen(){
    if (!verbunden()) throw new Error('nicht-verbunden');
    const datei = await dateiSuchen();
    if (!datei) return {ok:false, grund:'In deinem Drive liegt noch keine Sicherung.'};

    const a = await fetch('https://www.googleapis.com/drive/v3/files/' + datei.id + '?alt=media',
                          {headers:{Authorization:'Bearer ' + token}});
    if (!a.ok) throw new Error('Herunterladen fehlgeschlagen (' + a.status + ').');
    const text = await a.text();
    const ergebnis = global.Daten.importieren(text);
    if (ergebnis.ok){
      const m = merker();
      m.zuletzt = new Date().toISOString();
      merkerSetzen(m);
    }
    return ergebnis;
  }

  global.DriveSync = {
    eingerichtet: eingerichtet,
    verbunden: verbunden,
    verbinden: verbinden,
    trennen: trennen,
    hochladen: hochladen,
    herunterladen: herunterladen,
    zuletzt(){ return merker().zuletzt || null; },
    dateiname: DATEINAME
  };

})(window);
