# Verkaufsstart-Checkliste

Was noch zu tun ist, bevor die Seite echtes Geld einnehmen kann. Die Website selbst ist fertig — es fehlen nur Dinge, die niemand außer dir eintragen kann.

## 1. Rechtliches ausfüllen (Pflicht, zuerst)

In diesen vier Dateien stehen Platzhalter in der Form `[…]`. Jeder davon muss ersetzt werden:

| Datei | Was fehlt |
|---|---|
| `impressum.html` | Name, Anschrift, Telefon, E-Mail, USt-IdNr. oder Kleinunternehmer-Hinweis, zuständige Aufsichtsbehörde |
| `datenschutz.html` | Name, Anschrift, E-Mail, Hosting-Anbieter, Zahlungsanbieter + dessen Datenschutz-Link |
| `widerruf.html` | Name, Anschrift, E-Mail (zweimal: Abschnitt 1 und Muster-Formular) |
| `agb.html` | Name, Anschrift, Datum „Stand" |

Ohne vollständiges Impressum und Datenschutzerklärung ist der Verkauf an Verbraucher in
Deutschland abmahnfähig. Das ist der einzige Punkt auf dieser Liste, bei dem Sparen teuer wird.

## 2. Zahlungsanbieter einrichten

Empfehlung für den deutschen Markt: **Digistore24**. Alternativen: Lemon Squeezy, Payhip.
Alle drei übernehmen Zahlung, Rechnung und Umsatzsteuer-Abwicklung automatisch.

Vorgehen:

1. Konto anlegen, Produkt „PhysioNebenbei Starter-Paket" für 29 € einrichten.
2. **Die vier Dateien beim Anbieter hochladen**, nicht auf der eigenen Website liegen lassen.
   Der Anbieter liefert sie dann nur an zahlende Kund:innen aus. Danach die Dateien aus
   `physio-nebenbei/` löschen und `download.html` entfernen — solange sie im Repo liegen,
   sind sie über die direkte URL erreichbar, auch ohne Kauf.
3. Im Checkout die Pflicht-Bestätigung für digitale Inhalte aktivieren: Kund:in muss dem
   Sofort-Download ausdrücklich zustimmen **und** bestätigen, dass damit das Widerrufsrecht
   erlischt (§ 356 Abs. 5 BGB). Alle drei Anbieter haben dafür eine Option.
4. Wasserzeichen einschalten, falls der Anbieter es anbietet: Name und E-Mail der Käufer:in
   werden auf jede PDF-Seite gestempelt. Das ist der realistische Kopierschutz — echte
   DRM-Sperren sind bei einem 29-€-PDF nicht durchsetzbar und nerven nur ehrliche Käufer:innen.

## 3. Kauf-Link einsetzen

In `index.html` gibt es genau eine Stelle, markiert mit `data-checkout-placeholder`:

```html
<a class="btn" href="#" data-checkout-placeholder>Jetzt kaufen und sofort herunterladen</a>
```

Dort das `href="#"` durch den echten Bestell-Link des Anbieters ersetzen.

## 4. Optional, aber sinnvoll

- Eigene Domain verbinden statt der GitHub-Adresse.
- Ein echtes Foto von dir in den Abschnitt „Wer dahintersteckt" — erhöht die Conversion bei
  einem Vertrauensprodukt deutlich mehr als jede Textänderung.
- Die zwei Vertragsvorlagen von einer Anwältin, einem Anwalt oder dem Rechtsservice deines
  Berufsverbands prüfen lassen, bevor echte Patient:innen sie unterschreiben.

## Struktur der Seite

```
index.html            Verkaufsseite (Preis, Kauf-CTA, FAQ)
download.html         Danke-/Download-Seite nach dem Kauf (noindex)
impressum.html        Pflicht
datenschutz.html      Pflicht
agb.html              inkl. Weitergabeverbot für die Dateien (§ 5)
widerruf.html         Pflicht, inkl. Muster-Widerrufsformular

physio-nebenbei/
  fahrplan.html       kostenlos lesbar, mit To-do-Liste — der Verkaufsmotor
  werkzeuge.html      kostenlos nutzbare Rechner — der Verkaufsmotor
  base.css            gemeinsames Design, Systemschriften (keine Google Fonts)
  *.docx *.xlsx *.pdf das verkaufte Paket (siehe Schritt 2: besser zum Anbieter umziehen)
```
