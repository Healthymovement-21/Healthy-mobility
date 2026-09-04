# Verkaufsstart — Schritt für Schritt

Die Website ist fertig. Was hier steht, kann niemand außer dir machen: Konto anlegen,
eigene Daten eintragen, Link einsetzen. Danach nimmt die Seite Geld ein.

Reihenfolge einhalten — Schritt 3 setzt Schritt 2 voraus.

---

## Schritt 1 — Rechtliches (erledigt)

Impressum, Datenschutz, Widerruf und AGB sind vollständig ausgefüllt:
Nick Grausam, Dornierstraße 5, 69181 Leimen, Telefon und E-Mail,
Kleinunternehmer nach § 19 UStG, Aufsichtsbehörde LSJV Rheinland-Pfalz.
Es sind keine Platzhalter mehr offen.

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
   `https://healthymovement-21.github.io/Healthy-mobility/v5frhmlitisu/danke.html`
   (siehe Schritt 2f).
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
- [ ] nach der Zahlung landest du auf der Danke-Seite im Kundenbereich
- [ ] von dort kommst du in deinen Bereich und alle Dateien öffnen sich

Wenn alles passt: Konto vollständig verifizieren, in den **Live-Modus**
wechseln und dort denselben Zahlungslink neu erstellen. Testmodus-Links
funktionieren live nicht.

### 2f — Auslieferung: der Kundenbereich

Die Dateien liegen **nicht mehr öffentlich** auf der Website. Alles, was
verkauft wird, ist in einen Ordner mit einer nicht erratbaren Adresse
umgezogen:

```
/v5frhmlitisu/
```

Darin: die Startseite für Käufer:innen, alle Rechner, der komplette
Fahrplan, die Danke-Seite und alle elf Dateien zum Herunterladen.
Jede Seite dort trägt `noindex`, keine öffentliche Seite verlinkt darauf,
und der Pfad steht in keiner robots.txt. Über Google ist da nichts zu
finden.

**Öffentlich bleibt nur die Leseprobe:**

| Seite | Was sichtbar ist |
|---|---|
| `physio-nebenbei/fahrplan.html` | Kapitelübersicht plus Kapitel 1 komplett |
| Startseite, Abschnitt „Rechner" | eine Behandlungsart, Umsatz und Stundensatz |

**Was du beim Zahlungsanbieter eintragen musst:** als Weiterleitung nach
erfolgreicher Zahlung diese Adresse:

```
https://healthymovement-21.github.io/Healthy-mobility/v5frhmlitisu/danke.html
```

Die Danke-Seite zeigt der Käuferin ihren persönlichen Link, bietet einen
Kopieren-Knopf und erklärt, wie man sich den Bereich als App aufs Handy
legt. Trag denselben Link zusätzlich in die Bestätigungsmail des
Anbieters ein, damit er nicht verloren geht.

**Was das leistet und was nicht.** Ohne Kauf kommt niemand an die Inhalte,
weil niemand die Adresse kennt. Wer den Link aber weitergibt, gibt den
Zugang weiter. Genau dasselbe gilt für Download-Links von Digistore24
oder Gumroad. Rechtlich deckt das § 5 der AGB ab, der die Weitergabe
verbietet. Willst du zusätzlich ein Wasserzeichen mit Name und E-Mail der
Käuferin auf jeder PDF-Seite, geht das nur über einen Anbieter, der die
Dateien selbst ausliefert, also Digistore24 statt Stripe.

**Wenn ein Link doch einmal kursiert:** Ordner umbenennen, neuen Link in
die Weiterleitung eintragen, fertig. Die alte Adresse läuft dann ins
Leere.

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

## Schritt 4 — WhatsApp-Community einrichten (optional)

Sobald deine WhatsApp-Gruppe oder dein Community-Kanal steht, den Einladungslink
in `community.js` eintragen — auch das ist die **einzige** Stelle:

```js
const WHATSAPP_URL = 'https://chat.whatsapp.com/xxxxxxxxxxxxxxxxxxxxxx';
```

Solange das Feld leer bleibt, zeigt der Beitreten-Button auf der Verkaufsseite
einen Hinweis statt eines toten Links. Die Community ist bewusst für alle offen,
auch ohne Kauf des Pakets — das steht so auf der Seite und im FAQ.

---

## Schritt 5 — Kundenbereich mit Google Drive verknüpfen (optional)

Der komplette Download-Bereich hängt an einer Datei: `drive.js`. Trägst du dort
etwas ein, zeigen **alle** Herunterladen-Buttons auf Google Drive. Trägst du
nichts ein, laden sie weiter aus `v5frhmlitisu/dateien/`. Kaputt geht dabei nie
etwas.

### Weg 1 — nur der Ordner (ein Link, fünf Minuten)

1. In Google Drive einen Ordner anlegen und die zwölf Dateien aus
   `v5frhmlitisu/dateien/` hochladen (die elf Dateien plus das ZIP).
2. Ordner → **Freigeben** → unter „Allgemeiner Zugriff" auf
   **Jeder, der über den Link verfügt** stellen, Rolle **Betrachter**.
3. **Link kopieren** und in `drive.js` eintragen:

```js
const DRIVE_ORDNER = 'https://drive.google.com/drive/folders/xxxxxxxxxxxx';
```

Danach führt jeder Button in den Drive-Ordner und heißt auch so:
„Bei Google Drive öffnen". Der ZIP-Button daneben blendet sich aus, weil er
dasselbe täte.

### Weg 2 — jede Datei einzeln (direkter Download)

Wenn ein Button die passende Datei direkt herunterladen soll, brauchst du je
Datei die Datei-ID: Datei in Drive → **Freigeben** → „Jeder, der über den Link
verfügt" → **Link kopieren**. Aus

```
https://drive.google.com/file/d/1AbCdEfGhIjKlMnOpQrStUv/view?usp=sharing
```

ist `1AbCdEfGhIjKlMnOpQrStUv` die ID. Die trägst du in `drive.js` hinter den
passenden Dateinamen in `DRIVE_DATEIEN` ein. Wenn du versehentlich den ganzen
Link einsetzt, wird die ID trotzdem erkannt.

Du kannst das nach und nach machen: Dateien mit ID laden direkt, Dateien ohne ID
gehen in den Ordner aus Weg 1, und ohne beides bleibt der lokale Link stehen.

### Was dabei zu beachten ist

- Alles, was du freigibst, ist über den Link öffentlich erreichbar — genau wie
  der Kundenbereich selbst. Wer den Link weitergibt, gibt das Paket weiter. Das
  regelt § 5 der AGB, technisch verhindern lässt es sich bei einem 29-€-Produkt
  nicht sinnvoll.
- Die beiden Rechner (Rechnungsgenerator, Einnahmen und Ausgaben) haben oben im
  Kundenbereich zusätzlich einen **Öffnen**-Button. Der bleibt immer lokal, weil
  Google Drive HTML-Dateien nicht ausführt, sondern nur anzeigt.
- Die Dateien in `v5frhmlitisu/dateien/` bleiben liegen. Sie sind die Rückfall-
  ebene, wenn mit Drive etwas nicht stimmt.

---

## Schritt 6 — Reichweitenmessung aktivieren (optional)

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

## Schritt 7 — Danach

- Eigene Domain verbinden statt der GitHub-Adresse (wirkt bei einem Vertrauens­produkt
  mehr als jede Textänderung).
- Repository auf **Private** stellen (GitHub Pro nötig für Pages aus einem privaten
  Repo), sonst sind die Dateien im Ordner `v5frhmlitisu/` trotz Geheim-Link direkt
  über die GitHub-Dateiliste erreichbar.
- Die Vertragsvorlagen anwaltlich oder vom Rechtsservice deines Berufsverbands
  prüfen lassen, bevor echte Patient:innen sie unterschreiben.

---

## Struktur der Seite

```
ÖFFENTLICH
index.html                      Verkaufsseite
checkout.js                     ← hier den Bestell-Link eintragen
community.js                    ← hier den WhatsApp-Einladungslink eintragen
drive.js                        ← hier den Google-Drive-Ordner eintragen
impressum.html                  ausgefüllt
datenschutz.html                ausgefüllt
agb.html                        inkl. Weitergabeverbot (§ 5)
widerruf.html                   ausgefüllt, inkl. Muster-Formular
landing.css                     Design nur für die Verkaufsseite
manifest.webmanifest, sw.js     App-Funktion und Offline-Betrieb

physio-nebenbei/
  base.css                      Design für die ganze Seite
  zahlenfeld.js                 Ziffernraster statt Handytastatur
  fahrplan.html                 LESEPROBE: Kapitelliste plus Kapitel 1
  img/, logo.svg, icon-*.png    Bilder und Symbole
  vorlagen-generator.py         erzeugt die PDF-Vorlagen neu

NUR MIT LINK (der verkaufte Teil)
v5frhmlitisu/
  index.html                    Startseite für Käufer:innen, als App speicherbar
  danke.html                    Ziel der Weiterleitung nach der Zahlung
  fahrplan.html                 alle zehn Kapitel, Kapitel-Tracker plus persoenliche To-do-Liste
  terminbuchung.html            Zusatzkapitel zur Online-Terminvergabe
  monatsrechner.html            voller Rechner mit PDF-Export
  gehaltsrechner.html           Gehalt, Szenarien, Krankenkassen-Ampel
  planungsrechner.html          Auslastung, Fahrtkosten, Rezeptlaufzeit
  werkzeuge.html                Preis-Kalkulation
  app.webmanifest               damit der Bereich als App startet
  dateien/                      die elf Dateien plus ZIP
```

### Wenn du Inhalte änderst

Die Leseprobe zieht Kapitel 1 aus dem vollen Fahrplan. Änderst du dort etwas,
muss es auch in `physio-nebenbei/fahrplan.html` nachgezogen werden, sonst laufen
die beiden Fassungen auseinander.

Die PDF-Vorlagen lassen sich mit `python3 physio-nebenbei/vorlagen-generator.py
v5frhmlitisu/dateien` neu erzeugen. Danach die ZIP neu packen.
