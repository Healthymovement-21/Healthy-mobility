/* ============================================================
   PhysioNebenbei — freiwillige Google-Drive-Synchronisation

   ╔══════════════════════════════════════════════════════════╗
   ║  HIER DEINE CLIENT-ID EINTRAGEN — das ist die einzige     ║
   ║  Stelle im ganzen Produkt, die du dafuer anfassen musst.  ║
   ╚══════════════════════════════════════════════════════════╝

   So kommst du an die Client-ID:

     1. console.cloud.google.com oeffnen, Projekt anlegen
     2. APIs & Dienste → Bibliothek → "Google Drive API" aktivieren
     3. APIs & Dienste → OAuth-Zustimmungsbildschirm ausfuellen
        · Nutzertyp "Extern"
        · unter "Testnutzer" deine eigene Google-Adresse eintragen,
          solange die App noch nicht veroeffentlicht ist
        · Bereich (Scope) hinzufuegen:
          https://www.googleapis.com/auth/drive.file
     4. Anmeldedaten → Anmeldedaten erstellen → OAuth-Client-ID,
        Anwendungstyp "Webanwendung"
     5. Unter "Autorisierte JavaScript-Quellen" genau diese Adresse
        eintragen — nur Schema und Host, ohne Pfad und ohne Schraegstrich:

          https://healthymovement-21.github.io

        Eine Weiterleitungs-URI wird NICHT gebraucht. Dieses Verfahren
        (Google Identity Services, Token-Modell) arbeitet ohne Redirect.
     6. Die erzeugte Client-ID unten zwischen die Anfuehrungszeichen
        setzen. Sie endet auf .apps.googleusercontent.com

   Solange das Feld leer ist, zeigt der Bereich einen verstaendlichen
   Hinweis statt eines toten Knopfes. Alles andere im Produkt
   funktioniert unveraendert weiter — Drive ist ein Zusatz, kein
   Fundament, und ohne Verbindung geht nichts an Google.
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
  function gisBereit(){
    return !!(global.google && global.google.accounts && global.google.accounts.oauth2);
  }

  function gisLaden(){
    return new Promise((erfuellt, abgelehnt) => {
      /* Schon da? Dann nichts nachladen. Das kann auch der Fall sein,
         wenn eine andere Seite des Bereichs das Skript bereits geholt
         hat — ein zweites Laden waere nur unnoetiger Verkehr. */
      if (gisBereit()){ gisGeladen = true; return erfuellt(); }

      /* Laeuft der Ladevorgang schon, nicht ein zweites Tag anhaengen. */
      const vorhanden = document.querySelector('script[data-gis]');
      if (vorhanden){
        vorhanden.addEventListener('load', () => { gisGeladen = true; erfuellt(); });
        vorhanden.addEventListener('error', () => abgelehnt(new Error('Google-Skript konnte nicht geladen werden.')));
        return;
      }

      const s = document.createElement('script');
      s.src = 'https://accounts.google.com/gsi/client';
      s.async = true;
      s.setAttribute('data-gis', '');
      s.onload = () => {
        gisGeladen = true;
        gisBereit() ? erfuellt()
                    : abgelehnt(new Error('Google-Skript wurde geladen, meldet sich aber nicht.'));
      };
      s.onerror = () => abgelehnt(new Error('Das Skript von Google konnte nicht geladen werden. Prüf deine Internetverbindung oder einen Inhaltsblocker.'));
      document.head.appendChild(s);
    });
  }

  function eingerichtet(){ return DRIVE_CLIENT_ID.trim().length > 0; }

  /* Google laesst OAuth nur von einer echten Web-Adresse zu. Aus einer
     lokal geoeffneten Datei (file://) heraus geht es grundsaetzlich
     nicht — das soll die Oberflaeche sagen koennen, statt den Nutzer
     in eine Fehlermeldung von Google laufen zu lassen. */
  function herkunftTaugt(){
    return location.protocol === 'https:' ||
           location.hostname === 'localhost' ||
           location.hostname === '127.0.0.1';
  }

  /* Die Adresse, die in der Google Cloud Console unter
     "Autorisierte JavaScript-Quellen" stehen muss. */
  function herkunft(){ return location.origin; }

  async function verbinden(){
    if (!eingerichtet()) throw new Error('nicht-eingerichtet');
    if (!herkunftTaugt()) throw new Error('herkunft');
    await gisLaden();

    /* Beim allerersten Mal die Zustimmung ausdruecklich einholen,
       danach reicht die stille Anfrage. */
    const schonMalVerbunden = !!merker().verbundenAm;

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
        /* Googles Fehlerobjekt in verstaendliche Saetze uebersetzen. */
        error_callback: (fehler) => {
          const art = fehler && fehler.type;
          if (art === 'popup_closed')
            return abgelehnt(new Error('Du hast das Anmeldefenster geschlossen.'));
          if (art === 'popup_failed_to_open')
            return abgelehnt(new Error('Das Anmeldefenster wurde blockiert. Erlaub Pop-ups für diese Seite und versuch es noch einmal.'));
          abgelehnt(new Error('Die Anmeldung kam nicht zustande.'));
        }
      });
      tokenClient.requestAccessToken({prompt: schonMalVerbunden ? '' : 'consent'});
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

  /* Ein Zugriffsrecht von Google gilt etwa eine Stunde. Laeuft es ab,
     antwortet Drive mit 401. Dann ist die Verbindung nicht kaputt,
     sondern nur abgelaufen — das muss die Meldung unterscheiden. */
  function abgelaufen(){
    token = null;
    return new Error('Die Anmeldung bei Google ist abgelaufen. Verbinde dich noch einmal.');
  }

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
    if (a.status === 401 || a.status === 403) throw abgelaufen();
    if (!a.ok) throw new Error('Drive antwortet nicht (' + a.status + ').');

    /* Kommt statt JSON etwas anderes zurueck — etwa die Anmeldeseite
       eines Netzwerks im Hotel oder in der Praxis —, soll das eine
       verstaendliche Meldung geben und kein Absturz sein. */
    let j;
    try { j = await a.json(); }
    catch(e){ throw new Error('Die Antwort von Drive war unerwartet. Prüf deine Internetverbindung und versuch es noch einmal.'); }
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
    if (a.status === 401 || a.status === 403) throw abgelaufen();
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
    if (a.status === 401 || a.status === 403) throw abgelaufen();
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
    herkunftTaugt: herkunftTaugt,
    herkunft: herkunft,
    dateiname: DATEINAME
  };

})(window);
