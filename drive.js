/* ============================================================
   GOOGLE DRIVE — die einzige Stelle, die du ändern musst.

   Der ganze Kundenbereich hängt an dieser Datei. Trägst du unten
   etwas ein, zeigen ALLE Herunterladen-Buttons auf Google Drive.
   Trägst du nichts ein, laden sie weiter aus dem Ordner "dateien/",
   der neben dieser Seite liegt. Kaputt geht dabei nie etwas.


   ── Weg 1: nur der Ordner (ein einziger Link, schnell erledigt) ──

   In Google Drive einen Ordner anlegen und die zwölf Dateien aus
   v5frhmlitisu/dateien/ hochladen. Dann:

     Ordner → Freigeben → unter "Allgemeiner Zugriff" auf
     "Jeder, der über den Link verfügt" stellen, Rolle "Betrachter"
     → "Link kopieren"

   Diesen Link unten bei DRIVE_ORDNER einsetzen. Fertig. Jeder Button
   im Kundenbereich öffnet dann den Drive-Ordner, und dort sucht man
   sich die Datei aus. Die Buttons heißen dann auch so.


   ── Weg 2: jede Datei einzeln (mehr Arbeit, direkter Download) ──

   Wenn ein Button die passende Datei direkt laden soll, brauchst du
   je Datei die Datei-ID:

     Datei in Drive → Freigeben → "Jeder, der über den Link verfügt"
     → "Link kopieren". Der Link sieht so aus:

     https://drive.google.com/file/d/1AbCdEfGhIjKlMnOpQrStUv/view?usp=sharing
                                     ^^^^^^^^^^^^^^^^^^^^^^^
                                     das ist die ID

   Diese ID unten hinter den passenden Dateinamen schreiben. Du kannst
   das nach und nach machen: Dateien ohne ID benutzen den Ordner-Link
   aus Weg 1, und wenn auch der leer ist, den Ordner "dateien/".

   Die beiden Rechner (Rechnungsgenerator, Einnahmen und Ausgaben)
   haben oben auf der Seite zusaetzlich einen "Öffnen"-Button. Der
   bleibt immer lokal, weil Google Drive HTML-Dateien nicht ausfuehrt,
   sondern nur anzeigt oder herunterlaedt.

   WICHTIG: Alles, was du hier freigibst, ist über den Link öffentlich
   erreichbar — genauso wie der Kundenbereich selbst. Wer den Link
   weitergibt, gibt das Paket weiter. Das regelt § 5 der AGB.
   ============================================================ */

const DRIVE_ORDNER = '';

const DRIVE_DATEIEN = {
  'PhysioNebenbei-Paket.zip':                '',
  'PhysioNebenbei-Fahrplan.docx':            '',
  'PhysioNebenbei-Werkzeuge.xlsx':           '',
  'PhysioNebenbei-Rechnungsgenerator.html':  '',
  'PhysioNebenbei-Einnahmen-Ausgaben.html':  '',
  'Honorarvereinbarung.pdf':                 '',
  'Behandlungsvertrag.pdf':                  '',
  'Datenschutz-Patienten.pdf':               '',
  'Anamnesebogen.pdf':                       '',
  'Dokumentationsvorlage.pdf':               '',
  'Terminuebersicht.pdf':                    '',
  'Patientenliste.pdf':                      ''
};

/* ------------------------------------------------------------
   Ab hier nichts mehr ändern.
   ------------------------------------------------------------ */
(function () {
  'use strict';

  const ready = fn =>
    document.readyState === 'loading'
      ? document.addEventListener('DOMContentLoaded', fn)
      : fn();

  const text = v => (typeof v === 'string' ? v.trim() : '');

  /* Aus einer ID einen direkten Download-Link machen. Wer versehentlich
     den ganzen Freigabe-Link statt nur der ID einsetzt, soll trotzdem
     ein funktionierendes Ergebnis bekommen. */
  function datenId(wert){
    const w = text(wert);
    if (!w) return '';
    const treffer = w.match(/\/d\/([A-Za-z0-9_-]{10,})/) || w.match(/[?&]id=([A-Za-z0-9_-]{10,})/);
    if (treffer) return treffer[1];
    return /^[A-Za-z0-9_-]{10,}$/.test(w) ? w : '';
  }

  ready(function () {
    const ordner = text(DRIVE_ORDNER);
    const links  = Array.from(document.querySelectorAll('[data-drive-datei]'));
    const sammel = Array.from(document.querySelectorAll('[data-drive]'));
    const hinweis = document.getElementById('drive-hinweis');

    /* --- Sammel-Button "Alle Dateien bei Google Drive" --- */
    if (sammel.length) {
      if (ordner) {
        sammel.forEach(btn => {
          btn.href = ordner;
          btn.target = '_blank';
          btn.rel = 'noopener';
        });
        if (hinweis) hinweis.hidden = true;
      } else {
        sammel.forEach(btn => {
          btn.setAttribute('aria-disabled', 'true');
          btn.classList.add('is-disabled');
          btn.removeAttribute('href');
        });
        if (hinweis) {
          hinweis.textContent = 'Der Google-Drive-Ordner ist noch nicht eingerichtet. Bis dahin laden die Buttons unten die Dateien direkt von dieser Seite.';
          hinweis.hidden = false;
        }
      }
    }

    /* --- Die einzelnen Dateien --- */
    links.forEach(a => {
      const name = a.getAttribute('data-drive-datei');
      const id   = datenId(DRIVE_DATEIEN[name]);

      if (id) {
        /* Eigene Datei-ID: direkt laden, wie vom lokalen Ordner auch. */
        a.href = 'https://drive.google.com/uc?export=download&id=' + id;
        a.removeAttribute('download');
        a.target = '_blank';
        a.rel = 'noopener';
        return;
      }

      if (ordner) {
        /* Nur der Ordner ist eingerichtet. Der ZIP-Button wuerde jetzt
           dasselbe tun wie der Drive-Button daneben — den blenden wir
           aus, statt zweimal denselben Weg anzubieten. */
        if (a.dataset.driveBeschriftung === 'nein') { a.hidden = true; return; }

        /* Alle uebrigen: in den Ordner schicken und ehrlich beschriften,
           es laedt ja nichts direkt herunter. */
        a.href = ordner;
        a.removeAttribute('download');
        a.target = '_blank';
        a.rel = 'noopener';
        a.textContent = 'Bei Google Drive öffnen';
      }
      /* Sonst: der lokale Link im HTML bleibt unveraendert stehen. */
    });
  });
})();
