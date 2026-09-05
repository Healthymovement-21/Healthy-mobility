/* ============================================================
   PhysioNebenbei — Dateien wirklich herunterladen

   Das Problem: Safari auf iPhone und iPad ignoriert bei Office-
   Dateien das download-Attribut. Der Server liefert die .docx mit
   ihrem echten MIME-Typ aus, iOS erkennt sie als Word-Dokument und
   bietet statt eines Downloads "In App öffnen" an — dort landet
   dann irgendeine installierte App, die Office-Dateien beansprucht.

   Die Lösung: die Datei per fetch holen und als neutraler Blob
   (application/octet-stream) an einen Download-Link geben. Damit
   kann der Browser sie keiner App mehr zuordnen und speichert sie.

   Die Dateien selbst bleiben unverändert und weiterhin unter ihren
   bisherigen Pfaden erreichbar. Klappt der Weg nicht — kein Netz,
   fremde Herkunft, alter Browser —, geht der Klick ganz normal
   weiter wie vorher.
   ============================================================ */
(function () {
  'use strict';

  /* Nur Formate, bei denen iOS zum Öffnen neigt. PDFs bleiben außen
     vor: die zeigt Safari in der eigenen Vorschau, und von dort aus
     lässt sich sauber sichern. */
  const FORMATE = /\.(docx|xlsx|zip|pptx|doc|xls)$/i;

  function istEigeneDatei(a){
    try {
      const u = new URL(a.getAttribute('href'), location.href);
      return u.origin === location.origin;
    } catch(e){ return false; }
  }

  function beschriftungSetzen(a, text){
    if (!a.dataset.urText) a.dataset.urText = a.textContent;
    a.textContent = text;
  }

  async function holen(a, ereignis){
    const url  = a.getAttribute('href');
    const name = a.getAttribute('download') || url.split('/').pop();

    ereignis.preventDefault();
    beschriftungSetzen(a, 'Wird geladen …');

    try {
      const antwort = await fetch(url, {cache: 'no-store'});
      if (!antwort.ok) throw new Error(antwort.status);

      /* Der neutrale Typ ist der Kern: damit ordnet iOS die Datei
         keiner App mehr zu und legt sie in "Dateien" ab. */
      const roh  = await antwort.blob();
      const blob = new Blob([roh], {type: 'application/octet-stream'});
      const ziel = URL.createObjectURL(blob);

      const hilfslink = document.createElement('a');
      hilfslink.href = ziel;
      hilfslink.download = name;
      hilfslink.rel = 'noopener';
      document.body.appendChild(hilfslink);
      hilfslink.click();
      hilfslink.remove();

      /* Safari braucht den Objekt-URL noch einen Moment. */
      setTimeout(() => URL.revokeObjectURL(ziel), 60000);

      beschriftungSetzen(a, a.dataset.urText);
    } catch (fehler) {
      /* Notausgang: der gewohnte Weg, damit niemand ohne Datei
         dasteht, wenn hier etwas schiefgeht. */
      beschriftungSetzen(a, a.dataset.urText);
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

    holen(a, e);
  });
})();
