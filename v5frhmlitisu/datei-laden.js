/* ============================================================
   PhysioNebenbei — Dateien wirklich herunterladen

   Das Problem: Safari auf iPhone und iPad ignoriert bei Office-
   Dateien das download-Attribut. Der Server liefert die .docx mit
   ihrem echten MIME-Typ aus, iOS erkennt sie als Word-Dokument und
   bietet statt eines Downloads "In App öffnen" an — dort landet
   dann irgendeine installierte App, die Office-Dateien beansprucht.

   Zwei Wege, in dieser Reihenfolge:

   1. Das Teilen-Blatt von iOS. Das ist auf dem iPhone der
      verlässliche Weg: der Nutzer wählt "In Dateien sichern" und
      landet genau dort, wo er die Datei wiederfindet. Derselbe Weg
      löst schon den Datenexport in daten.js.

   2. Ein neutraler Blob (application/octet-stream). Damit kann der
      Browser die Datei keiner App mehr zuordnen und speichert sie.
      Auf Mac, Windows und Android ist das der normale Weg.

   Klappt beides nicht — kein Netz, alter Browser, abgebrochen —,
   geht der Klick ganz normal weiter wie vorher. Die Dateien selbst
   bleiben unverändert und weiterhin unter ihren bisherigen Pfaden.
   ============================================================ */
(function () {
  'use strict';

  /* Nur Formate, bei denen iOS zum Öffnen neigt. PDFs bleiben außen
     vor: die zeigt Safari in der eigenen Vorschau, und von dort aus
     lässt sich sauber sichern. */
  const FORMATE = /\.(docx|xlsx|zip|pptx|doc|xls)$/i;

  const TYPEN = {
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    zip:  'application/zip'
  };

  function istEigeneDatei(a){
    try { return new URL(a.getAttribute('href'), location.href).origin === location.origin; }
    catch(e){ return false; }
  }

  /* Kann dieses Gerät Dateien über das Teilen-Blatt weitergeben?
     Muss vor dem Klick feststehen, damit die Entscheidung nicht erst
     nach dem Laden fällt. */
  let teilenMoeglich = false;
  try {
    if (navigator.canShare && window.File){
      teilenMoeglich = navigator.canShare({
        files: [new File(['x'], 'probe.docx', {type: TYPEN.docx})]
      });
    }
  } catch(e){ teilenMoeglich = false; }

  function beschriftung(a, text){
    if (a.dataset.urText === undefined) a.dataset.urText = a.textContent;
    a.textContent = text;
  }
  function zurueck(a){
    if (a.dataset.urText !== undefined) a.textContent = a.dataset.urText;
  }

  function blobLaden(blob, name){
    const ziel = URL.createObjectURL(blob);
    const hilfslink = document.createElement('a');
    hilfslink.href = ziel;
    hilfslink.download = name;
    hilfslink.rel = 'noopener';
    document.body.appendChild(hilfslink);
    hilfslink.click();
    hilfslink.remove();
    setTimeout(() => URL.revokeObjectURL(ziel), 60000);
  }

  async function holen(a){
    const url  = a.getAttribute('href');
    const name = a.getAttribute('download') || url.split('/').pop();
    const endung = (name.split('.').pop() || '').toLowerCase();

    beschriftung(a, 'Wird geladen …');
    try {
      const antwort = await fetch(url, {cache: 'no-store'});
      if (!antwort.ok) throw new Error(antwort.status);
      const roh = await antwort.blob();

      /* Weg 1: das Teilen-Blatt. Dort wählt der Nutzer selbst
         "In Dateien sichern". Die Datei behält ihren echten Typ,
         damit sie nachher als Word-Dokument erkannt wird. */
      if (teilenMoeglich){
        try {
          const datei = new File([roh], name, {type: TYPEN[endung] || roh.type});
          if (navigator.canShare({files: [datei]})){
            await navigator.share({files: [datei], title: name});
            zurueck(a);
            return;
          }
        } catch(fehler){
          /* Abgebrochen ist kein Fehler — dann ist der Nutzer fertig. */
          if (fehler && fehler.name === 'AbortError'){ zurueck(a); return; }
          /* Sonst weiter mit Weg 2. */
        }
      }

      /* Weg 2: neutraler Typ, damit keine App sich zuständig fühlt. */
      blobLaden(new Blob([roh], {type: 'application/octet-stream'}), name);
      zurueck(a);

    } catch (fehler) {
      /* Notausgang: der gewohnte Weg, damit niemand ohne Datei
         dasteht, wenn hier etwas schiefgeht. */
      zurueck(a);
      window.location.href = url;
    }
  }

  document.addEventListener('click', function (e) {
    const a = e.target.closest && e.target.closest('a[download]');
    if (!a) return;

    const url = a.getAttribute('href');
    if (!url || !FORMATE.test(url)) return;

    /* Zeigt der Link inzwischen auf Google Drive, gehört er nicht
       mehr uns — dann nicht eingreifen. */
    if (!istEigeneDatei(a)) return;

    /* Ohne diese Bausteine bleibt alles beim Alten. */
    if (!window.fetch || !window.URL || !URL.createObjectURL) return;

    e.preventDefault();
    holen(a);
  });
})();
