# PhysioNebenbei

Verkaufsseite und Kundenbereich für ein digitales Starter-Paket für Physiotherapeut:innen
in Deutschland, die angestellt arbeiten und nebenbei Privatpatient:innen oder
Selbstzahler:innen behandeln möchten. Statische Seite ohne Build-Schritt und ohne
Abhängigkeiten, `index.html` ist der Einstiegspunkt. Die Verkaufsseite ist auf fünf
Seiten aufgeteilt: Start, Inhalt, Rechner, Kaufen, Fragen.

**Vor dem ersten echten Verkauf:** [`VERKAUFSSTART.md`](VERKAUFSSTART.md) durchgehen.
Dort steht die Einrichtung des Zahlungsanbieters und wo der Bestell-Link eingetragen wird.

## Aufbau

Öffentlich erreichbar ist nur die Verkaufsseite plus eine Leseprobe. Alles, was verkauft
wird, liegt unter einer nicht erratbaren Adresse, trägt `noindex` und ist nirgends
verlinkt.

```
ÖFFENTLICH
index.html                     Start
inhalt.html                    was im Paket steckt
rechner.html                   kostenloser Rechner
kaufen.html                    Preis und Kauf-Button
fragen.html                    häufige Fragen
landing.css                    Design nur für diese fünf Seiten
nav.js                         Kopfzeile und Menü, auf allen fünf Seiten gleich
rechner.js                     der kostenlose Rechner
checkout.js                    ← hier den Bestell-Link eintragen
community.js                   ← hier den WhatsApp-Einladungslink eintragen
drive.js                       ← hier Google Drive verknüpfen (Ordner und/oder Datei-IDs)
impressum, datenschutz,
agb, widerruf                  ausgefüllt
physio-nebenbei/
  base.css                     Design für alle Seiten
  zahlenfeld.js                Ziffernraster statt Handytastatur auf Touch-Geräten
  fahrplan.html                Leseprobe: Kapitelliste plus Kapitel 1
  vorlagen-generator.py        erzeugt die PDF-Vorlagen neu

NUR MIT LINK
v5frhmlitisu/
  index.html                   der Fahrplan: zehn Schritte mit Fortschritt, jeder mit
                               dem passenden Werkzeug verknüpft. Einstieg für Käufer:innen
  ziel-rechner.html            Wunschbetrag rein, Zahl der Termine raus — für mehrere
                               Preisstufen nebeneinander, plus Zeitaufwand und Stundenlohn
  werkzeuge.html               Preis-Kalkulation rückwärts, dazu Steuer-Rücklage, EÜR, Log
  monatsrechner.html           Umsatz, Ausgaben, Steuerrücklage, PDF-Export
  planungsrechner.html         Auslastung, Fahrtkosten, Rezeptlaufzeit, Geldeingang
  gehaltsrechner.html          Hauptjob plus Nebenverdienst, Krankenkassen-Ampel
  fahrplan.html                alle zehn Kapitel, Kapitel-Tracker plus persönliche To-do-Liste
  fehler.html                  die zehn Fehler, die am meisten kosten, je mit Gegenmittel
  mein-bereich.html            Zahlen, Ziel, Termine, Aufgaben, Speicherorte, Einstellungen
  termine.html                 kompakte Terminübersicht, sechs Felder je Termin
  terminbuchung.html           Kurzkapitel zur Online-Terminvergabe durch Patient:innen
  danke.html                   Ziel der Weiterleitung nach der Zahlung
  daten.js                     gemeinsame Datenschicht aller Rechner (localStorage)
  drive-sync.js                ← hier die Google-OAuth-Client-ID eintragen

### Wo welche Daten liegen

| Schlüssel im localStorage | Inhalt |
|---|---|
| `physionebenbei-daten` | Zahlen, Profil, Termine, Sync-Einstellungen (siehe `daten.js`) |
| `physionebenbei-schritte` | Fortschritt im zehnstufigen Fahrplan |
| `physionebenbei-todo-eigene` | die persönliche Checkliste |
| `physionebenbei-drive` | wann zuletzt zu Drive übertragen wurde (kein Token) |

Alles bleibt auf dem Gerät, es gibt kein Konto und keinen Server. Der
Rechnungsgenerator speichert seine Patientenliste bewusst in seinem eigenen
Speicher und wird von der Synchronisation nie erfasst.

### Google Drive

`drive-sync.js` enthält die Anleitung, wie du eine OAuth-Client-ID anlegst,
und ganz oben das Feld dafür. Ohne Client-ID zeigt der Bereich einen Hinweis,
alles andere funktioniert unverändert weiter.

Zwei Dinge sind Absicht: die Berechtigung ist `drive.file`, die Anwendung sieht
also nur die eine Datei, die sie selbst anlegt. Und Googles Skript wird erst
geladen, wenn jemand auf „Verbinden" tippt — wer Drive nie benutzt, baut auch
nie eine Verbindung dorthin auf. Termine sind standardmäßig von der
Synchronisation ausgenommen, weil sie Patientennamen enthalten.
  dateien/                     die elf Dateien plus ZIP
```

## Was im Paket steckt

Elf Dateien zum Herunterladen:

| Datei | Was es ist |
|---|---|
| `PhysioNebenbei-Fahrplan.docx` | zehn Kapitel, zum Anpassen |
| `PhysioNebenbei-Werkzeuge.xlsx` | Preis-Kalkulation, Steuer-Rücklage, EÜR, Dokumentation |
| `PhysioNebenbei-Rechnungsgenerator.html` | eigenständig, offline, erzeugt Rechnungen nach § 14 UStG |
| `PhysioNebenbei-Einnahmen-Ausgaben.html` | eigenständig, offline, EÜR nach § 4 Abs. 3 EStG |
| `Honorarvereinbarung.pdf` | Muster |
| `Behandlungsvertrag.pdf` | Muster |
| `Datenschutz-Patienten.pdf` | Information nach Art. 13 DSGVO zum Aushändigen |
| `Anamnesebogen.pdf` | Erstgespräch, inklusive Kontraindikationen |
| `Dokumentationsvorlage.pdf` | Anamnese, Befund, Verlaufstabelle |
| `Terminuebersicht.pdf` | Wochenplan zum Ausdrucken |
| `Patientenliste.pdf` | Kürzel und Klardaten getrennt, mit Löschfristen |

Dazu sieben Rechner, die im Kundenbereich im Browser laufen.

Die beiden HTML-Rechner sind bewusst eigenständige Dateien: speichern, doppelklicken,
läuft. Kein Internet, keine Installation, alle Eingaben bleiben im Browser des Geräts.

## Vorlagen ändern

```
python3 physio-nebenbei/vorlagen-generator.py v5frhmlitisu/dateien
```

Danach die ZIP neu packen. Der Stil ist aus der ursprünglichen Honorarvereinbarung
übernommen, damit alle Dokumente gleich aussehen.

## CAPRATE

Das vorherige Projekt in diesem Repo, eine geführte Immobilien-Investment-Analyse, ist
unverändert erhalten und liegt unter [`caprate/`](caprate/index.html).
