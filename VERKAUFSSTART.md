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

## Schritt 2 — Stripe einrichten

Stripe ist reiner Zahlungsdienstleister, kein Reseller: Der Kaufvertrag läuft
zwischen dir und der Kund:in, nicht über Stripe. Dafür ist die Gebühr deutlich
niedriger als bei Digistore24 (ca. 1,5 % + 0,25 € pro Zahlung mit EU-Karte statt
ca. 8 %), aber Umsatzsteuer, Rechnung und Dateiauslieferung sind jetzt deine
Aufgabe, nicht die eines Resellers. Die Widerrufs-Checkbox auf der Verkaufsseite
hast du schon, die läuft unabhängig vom Zahlungsanbieter mit.

Du brauchst vorab: Personalausweis (Identitätsprüfung), IBAN, Steuernummer.

### 2a — Konto

1. `stripe.com` → Konto erstellen → Rechtsform **Einzelunternehmen** (das bist du
   als Freiberufler:in).
2. Unternehmensdaten eintragen: Anschrift, Steuernummer, Branche z. B. „Bildung /
   digitale Produkte", Bankverbindung für Auszahlungen.
3. Identitätsprüfung durchlaufen (Perso hochladen). Geht oft sehr schnell, manchmal
   sofort, sonst 1–2 Werktage.

### 2b — Umsatzsteuer entscheiden, bevor du das Produkt anlegst

Wichtig: Diese Entscheidung nimmt dir bei Stripe niemand ab, im Gegensatz zu
Digistore24. Sie betrifft nur den Fahrplan als Info-Produkt, nicht deine
Physio-Behandlungen selbst, die bleiben nach § 4 Nr. 14 UStG steuerfrei.

- **Bist du Kleinunternehmer:in nach § 19 UStG** (die Entscheidung aus Schritt 1,
  Impressum): Dann berechnest du keine Umsatzsteuer, der Preis bleibt einfach
  29 €. Auf der Stripe-Rechnung/Quittung vermerkst du „Gemäß § 19 Abs. 1 UStG wird
  keine Umsatzsteuer berechnet." Für die meisten nebenberuflichen Starts trifft
  das zu, und dann ist dieser ganze Punkt erledigt.
- **Wenn nicht:** Du weist 19 % USt aus. Für Verkäufe innerhalb der EU darfst du
  den deutschen Satz anwenden, solange dein Gesamtumsatz aus digitalen
  B2C-Verkäufen ins EU-Ausland unter 10.000 €/Jahr bleibt (Ursprungslandprinzip).
  Erst darüber wird eine OSS-Registrierung nötig. Bei einem 29-€-Nebenprodukt ist
  das eine Schwelle, die du realistisch nicht in den ersten Jahren reißt.

### 2c — Produkt & Zahlungslink anlegen

**Dashboard → Produkte → Produkt hinzufügen**

| Feld | Wert |
|---|---|
| Name | PhysioNebenbei Starter-Paket |
| Preis | 29 € |
| Abrechnung | Einmalig (**keine** wiederkehrende Zahlung) |
| Währung | EUR |

Danach am Produkt auf **Zahlungslink erstellen** klicken.

1. Unter „Nach der Zahlung" → „Kund:innen auf deine Website weiterleiten" die URL
   deiner Danke-Seite eintragen, z. B.
   `https://healthymovement-21.github.io/Healthy-mobility/danke.html`.
2. Rechnungsadresse abfragen aktivieren, das brauchst du für deine eigene
   Buchhaltung.
3. Als Zahlungsart reicht Kreditkarte (Apple Pay/Google Pay laufen automatisch
   mit). SEPA-Lastschrift lieber weglassen: Bei einem Sofort-Download willst du
   nicht tagelang auf die Bestätigung warten oder ein Rückbuchungsrisiko tragen.

### 2d — Rechnung bzw. Zahlungsbeleg

Stripe schickt nach jeder Zahlung automatisch eine Quittung per Mail, das reicht
bei einem B2C-Verkauf rechtlich meist aus (anders als bei B2B-Rechnungen gibt es
hier keine strikte Rechnungspflicht). Aktivieren unter **Einstellungen → E-Mails
an Kund:innen → „Erfolgreiche Zahlungen"**.

Willst du stattdessen echte Rechnungen mit allen Pflichtangaben verschicken,
gibt es unter **Einstellungen → Rechnungsstellung** eine Vorlage mit deinem Namen
und deiner Steuernummer, die du hinterlegen kannst. Wirkt etwas professioneller,
ist aber kein Muss.

### 2e — Testkauf

Stripe startet im **Testmodus** (Schalter oben rechts im Dashboard). Zahlungslink
im Testmodus öffnen, mit der Test-Kreditkarte `4242 4242 4242 4242`, beliebigem
künftigem Datum und beliebiger Prüfziffer bezahlen. Prüfen:

- [ ] Checkout lädt, Preis 29 €
- [ ] Widerrufs-Bestätigung auf der Verkaufsseite ist Pflicht, bevor der
      Kauf-Button überhaupt anklickbar wird
- [ ] nach der Zahlung landest du auf `danke.html`
- [ ] alle vier Dateien öffnen sich von dort

Wenn alles passt: Konto vollständig verifizieren, in den **Live-Modus**
wechseln und dort denselben Zahlungslink neu erstellen. Testmodus-Links
funktionieren live nicht.

### 2f — Der wichtige Unterschied zu Digistore24: Dateiauslieferung

Stripe liefert selbst keine Dateien aus, das kann nur ein Reseller wie
Digistore24. Nach der Zahlung landet die Kund:in auf `danke.html`, und diese Seite
verlinkt die vier Dateien direkt aus dem Repository. Das bedeutet konkret:

- Die Dateien bleiben dauerhaft über ihre URL erreichbar, auch ohne Kauf. Anders
  als beim Digistore24-Weg gibt es hier keinen späteren Schritt, sie „aus dem Repo
  zu nehmen", weil niemand sonst sie ausliefert.
- Kein automatisches Wasserzeichen pro Käufer:in mehr, das war eine
  Digistore24-Funktion.
- Für ein 29-€-Info-Produkt ist das ein vertretbares Risiko: `danke.html` ist
  `noindex` und nirgends öffentlich verlinkt. Wer ohne Kauf drankommen will,
  braucht die exakte URL, die nur nach der Zahlung erscheint.

Wenn dir das zu wenig Kontrolle ist, bleibt Digistore24 die Alternative mit
echter Zugriffssperre, siehe unten.

---

## Schritt 3 — Bestell-Link einsetzen

Im Stripe-Dashboard beim Zahlungslink auf **Kopieren** klicken. Sieht aus wie
`https://buy.stripe.com/xxxxxxxxxxxx`.

Diesen Link in `checkout.js` in Zeile 15 eintragen — das ist die **einzige** Stelle:

```js
const CHECKOUT_URL = 'https://buy.stripe.com/xxxxxxxxxxxx';
```

Dann committen und pushen. Solange das Feld leer ist, sind die Kauf-Buttons sichtbar
deaktiviert und zeigen „Der Checkout wird gerade eingerichtet" — die Seite ist also
nie kaputt, nur noch nicht verkaufsbereit.

Nach dem Push einmal selbst prüfen: Button oben springt zum Preis-Abschnitt,
Häkchen setzen, „Jetzt kaufen" öffnet den Stripe-Checkout.

---

## Alternative: Digistore24 statt Stripe

Falls dir Stripes Gebühr trotzdem lieber gegen mehr Bequemlichkeit eingetauscht
werden soll: Digistore24 tritt als **Reseller** auf, der Kaufvertrag läuft dann
zwischen Kund:in und Digistore24, nicht zwischen Kund:in und dir. Dafür übernimmt
Digistore24 automatisch Umsatzsteuer inklusive EU-OSS-Meldung, echte
Rechnungsstellung, Dateiauslieferung mit Zugriffssperre und sogar ein
Wasserzeichen pro Käufer:in. Kostet dafür ca. 8 % statt ca. 1,5–2 % pro Verkauf.

Kurzfassung, falls du wechseln willst:

1. `digistore24.com` → Verkäufer-Konto, Profil inkl. Kleinunternehmer-Status
   ausfüllen, Identitätsprüfung.
2. Produkt anlegen: digitales Produkt, 29 €, Einmalzahlung, B2C.
3. Unter „Auslieferung" die vier Dateien hochladen (oder die fertige
   `physio-nebenbei/PhysioNebenbei-Paket.zip`), Auslieferungsart „Dateien zum
   Download" wählen, nicht „externe URL" — sonst landest du wieder bei den
   öffentlich erreichbaren Dateien wie beim Stripe-Weg. Wasserzeichen aktivieren,
   falls angeboten.
4. Unter „Rechtliches" die Pflicht-Bestätigung für digitale Inhalte aktivieren
   (§ 356 Abs. 5 BGB, „Kund:in stimmt sofortigem Beginn zu und verliert damit das
   Widerrufsrecht").
5. Testkauf-Modus durchlaufen, dann den Bestelllink aus „Vermarktung" in
   `checkout.js` eintragen, genau wie beim Stripe-Link.

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
kennt. Wer die URL kennt, kommt ohne Kauf ran. Bei Stripe (Schritt 2) bleibt das
so, siehe „2f — Der wichtige Unterschied zu Digistore24" oben, das ist der
Kompromiss für die niedrigere Gebühr.

Nutzt du stattdessen Digistore24 (Alternative weiter oben) und lässt die
Auslieferung dort laufen, kannst du die vier Dateien plus die ZIP aus
`physio-nebenbei/` löschen und `danke.html` auf eine reine Danke-Seite ohne
Download-Buttons zurückbauen, dann gibt es keine öffentlich erreichbaren Dateien
mehr.
