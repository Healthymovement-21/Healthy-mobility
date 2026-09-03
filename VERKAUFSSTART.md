# Verkaufsstart — Schritt für Schritt

Die Website ist fertig. Was hier steht, kann niemand außer dir machen: Konto anlegen,
eigene Daten eintragen, Link einsetzen. Danach nimmt die Seite Geld ein.

Reihenfolge einhalten — Schritt 3 setzt Schritt 2 voraus.

---

## Schritt 1 — Rechtliches ausfüllen (Pflicht, zuerst)

In diesen vier Dateien stehen Platzhalter in der Form `[…]`. Jeder muss ersetzt werden:

| Datei | Was fehlt |
|---|---|
| `impressum.html` | Name, Anschrift, Telefon, E-Mail, USt-IdNr. **oder** Kleinunternehmer-Hinweis, zuständige Aufsichtsbehörde |
| `datenschutz.html` | Name, Anschrift, E-Mail, Hosting-Anbieter (bei GitHub Pages: „GitHub Inc."), Hinweis zum Auftragsverarbeitungsvertrag |
| `widerruf.html` | Name, Anschrift, E-Mail — **zweimal**: Abschnitt 1 und Muster-Formular |
| `agb.html` | Name, Anschrift, Datum „Stand" |

Außerdem in `index.html`: `[VORNAME NACHNAME]`, `[JAHRESZAHL]` und `[ORT ODER REGION]`
im Abschnitt „Ich hab denselben Weg gerade hinter mir".

Suchen kannst du alle Stellen auf einmal:

```
grep -rn "\[" *.html | grep -v "href"
```

Ohne vollständiges Impressum und Datenschutzerklärung ist der Verkauf an Verbraucher in
Deutschland abmahnfähig. Das ist der einzige Punkt auf der Liste, bei dem Sparen teuer wird.

---

## Schritt 2 — Digistore24 einrichten

Digistore24 tritt als **Reseller** auf: Der Kaufvertrag läuft zwischen Kund:in und
Digistore24, nicht zwischen Kund:in und dir. Damit übernimmt Digistore24 die
Umsatzsteuer inklusive EU-OSS-Meldung, Rechnungsstellung und Auslieferung. Genau
deshalb ist es für ein 29-€-Produkt der geringste Aufwand.

Du brauchst vorab: Personalausweis (Identitätsprüfung), IBAN, Steuernummer.

### 2a — Konto

1. `digistore24.com` → Registrieren → **Verkäufer-Konto**.
2. Profil vollständig ausfüllen: Anschrift, Steuernummer, Bankverbindung,
   Kleinunternehmer nach § 19 UStG **ja/nein** (das steuert, ob auf der Rechnung
   Umsatzsteuer ausgewiesen wird — muss zu deinem Impressum passen).
3. Identitätsprüfung durchlaufen. Freischaltung dauert in der Regel 1–2 Werktage.

### 2b — Produkt anlegen

**Produkte → Neues Produkt → Digitales Produkt**

| Feld | Wert |
|---|---|
| Produktname | PhysioNebenbei Starter-Paket |
| Preis | 29 € |
| Zahlungsart | Einmalzahlung (**kein** Abo) |
| Währung | EUR |
| Produktart | Digitaler Download |
| Zielgruppe | Verbraucher (B2C) |

Beschreibung kurz halten — die Verkaufsseite macht die Arbeit, der Checkout muss nur
bestätigen, was man kauft.

### 2c — Die vier Dateien hochladen

**Produkte → dein Produkt → Auslieferung → Dateien**

Lade diese vier Dateien hoch:

```
physio-nebenbei/PhysioNebenbei-Fahrplan.docx
physio-nebenbei/PhysioNebenbei-Werkzeuge.xlsx
physio-nebenbei/Honorarvereinbarung.pdf
physio-nebenbei/Behandlungsvertrag.pdf
```

Alternativ die fertige `physio-nebenbei/PhysioNebenbei-Paket.zip` — dann ist es
ein Download statt vier. Empfehlung: **beides** hochladen, ZIP zuerst.

Als Auslieferungsart „Dateien zum Download" wählen, nicht „externe URL". Sonst
liefert Digistore24 auf `danke.html` aus, und diese Seite liegt öffentlich im Repo.

**Wasserzeichen aktivieren**, falls angeboten: Name und E-Mail der Käufer:in werden
auf jede PDF-Seite gestempelt. Das ist der realistische Kopierschutz — echte
DRM-Sperren sind bei einem 29-€-PDF nicht durchsetzbar und nerven nur ehrliche
Käufer:innen.

### 2d — Widerrufs-Zustimmung im Checkout aktivieren

**Produkte → dein Produkt → Rechtliches / Checkout-Einstellungen**

Häkchen setzen bei der Option für digitale Inhalte („Kunde muss dem sofortigen
Beginn der Vertragsausführung zustimmen und bestätigen, dass dadurch das
Widerrufsrecht erlischt"). Rechtsgrundlage: **§ 356 Abs. 5 BGB**.

Ohne diese Bestätigung im Checkout hast du 14 Tage Widerrufsrecht auf eine Datei,
die die Kund:in längst heruntergeladen hat. Die Checkbox auf der Verkaufsseite ist
die Vorbereitung — rechtlich zählt die im Checkout.

Ebenfalls hier eintragen: Link auf deine `agb.html` und `widerruf.html`.

### 2e — Bestätigungs-E-Mail

**Produkte → dein Produkt → E-Mails**

Standardvorlage reicht. Prüfe nur, dass drin steht: Download-Link, Rechnung als
Anhang oder Link, deine Support-Adresse. Digistore24 hält den Download im
Kundenkonto dauerhaft bereit — deshalb sind die Links in `checkout.js` bewusst
ohne Ablaufdatum konfiguriert.

### 2f — Testkauf

Digistore24 hat einen **Testkauf-Modus** (Produkt → Vermarktung → Testkauf). Damit
einmal durchlaufen und prüfen:

- [ ] Checkout lädt, Preis 29 €
- [ ] Widerrufs-Bestätigung erscheint und ist Pflicht
- [ ] nach der Zahlung kommen alle vier Dateien an
- [ ] Bestätigungs-E-Mail kommt an, mit Rechnung
- [ ] jede Datei öffnet sich (Word, Excel, zwei PDFs)

---

## Schritt 3 — Bestell-Link einsetzen

Im Digistore24-Backend: **Produkte → dein Produkt → Vermarktung → Bestelllink**.
Sieht aus wie `https://www.digistore24.com/product/612345`.

Diesen Link in `checkout.js` in Zeile 15 eintragen — das ist die **einzige** Stelle:

```js
const CHECKOUT_URL = 'https://www.digistore24.com/product/612345';
```

Dann committen und pushen. Solange das Feld leer ist, sind die Kauf-Buttons sichtbar
deaktiviert und zeigen „Der Checkout wird gerade eingerichtet" — die Seite ist also
nie kaputt, nur noch nicht verkaufsbereit.

Nach dem Push einmal selbst prüfen: Button oben springt zum Preis-Abschnitt,
Häkchen setzen, „Jetzt kaufen" öffnet den Digistore24-Checkout.

---

## Schritt 4 — Reichweitenmessung aktivieren (optional)

In `index.html` steht im `<head>` ein auskommentierter Block:

```html
<!-- Analytics: cookiefrei, kein Banner nötig. …
<script defer data-domain="DEINE-DOMAIN.de" src="https://plausible.io/js/script.outbound-links.js"></script>
-->
```

Konto bei `plausible.io` anlegen, Domain eintragen, Kommentarzeichen entfernen.
Plausible setzt keine Cookies, deshalb ist kein Cookie-Banner nötig — das ist in
`datenschutz.html` Abschnitt 7 schon beschrieben. **Wenn du Plausible nicht
aktivierst, streiche Abschnitt 7 aus der Datenschutzerklärung.**

---

## Schritt 5 — Danach

- Eigene Domain verbinden statt der GitHub-Adresse (wirkt bei einem Vertrauens­produkt
  mehr als jede Textänderung).
- Ein echtes Foto von dir in „Ich hab denselben Weg gerade hinter mir".
- Die Platzhalter-Stimmen in `index.html` (markiert mit `<!-- TODO: echtes Testimonial
  einsetzen -->`) durch echte Rückmeldungen ersetzen, sobald die ersten Käufer:innen
  berichtet haben. Bis dahin steht dort offen, dass es noch keine gibt — das ist
  besser als erfundene Zitate.
- Die zwei Vertragsvorlagen anwaltlich oder vom Rechtsservice deines Berufsverbands
  prüfen lassen, bevor echte Patient:innen sie unterschreiben.

---

## Struktur der Seite

```
index.html            Verkaufsseite (Hero, Inhalt, Preis, FAQ)
checkout.js           ← hier den Bestell-Link eintragen
danke.html            Danke-/Download-Seite nach dem Kauf (noindex)
impressum.html        Pflicht
datenschutz.html      Pflicht
agb.html              inkl. Weitergabeverbot für die Dateien (§ 5)
widerruf.html         Pflicht, inkl. Muster-Widerrufsformular
manifest.webmanifest  macht die Rechner als App installierbar
sw.js                 Service Worker, damit die Rechner offline laufen

physio-nebenbei/
  fahrplan.html       kostenlos lesbar, mit To-do-Liste — der Verkaufsmotor
  werkzeuge.html      Übersicht der Rechner
  monatsrechner.html  Behandlungen → Monatsumsatz, mit Beispielzahlen beim Öffnen
  gehaltsrechner.html Gehalt + Nebeneinkommen, inkl. Krankenkassen-Ampel
  base.css            gemeinsames Design, Systemschriften (keine Google Fonts)
  img/                Vorschaubilder für die Verkaufsseite + OG-Bild
  *.docx *.xlsx *.pdf das verkaufte Paket
  PhysioNebenbei-Paket.zip  alle vier Dateien gebündelt
```

### Warum die Produktdateien öffentlich im Repo liegen

Weil `danke.html` sie direkt verlinkt und GitHub Pages keine Zugangsbeschränkung
kennt. Wer die URL kennt, kommt ohne Kauf ran. Sobald Schritt 2c erledigt ist und
Digistore24 die Auslieferung übernimmt, kannst du die vier Dateien plus die ZIP aus
`physio-nebenbei/` löschen und `danke.html` auf eine reine Danke-Seite ohne
Download-Buttons zurückbauen. Bis dahin ist es ein bewusster Kompromiss: die Seite
funktioniert, bevor das Zahlungskonto steht.
