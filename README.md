# PhysioNebenbei

Verkaufsseite und Kundenbereich für ein digitales Starter-Paket für Physiotherapeut:innen
in Deutschland, die angestellt arbeiten und nebenbei Privatpatient:innen oder
Selbstzahler:innen behandeln möchten. Statische Seite ohne Build-Schritt und ohne
Abhängigkeiten, `index.html` ist der Einstiegspunkt.

**Vor dem ersten echten Verkauf:** [`VERKAUFSSTART.md`](VERKAUFSSTART.md) durchgehen.
Dort steht die Einrichtung des Zahlungsanbieters und wo der Bestell-Link eingetragen wird.

## Aufbau

Öffentlich erreichbar ist nur die Verkaufsseite plus eine Leseprobe. Alles, was verkauft
wird, liegt unter einer nicht erratbaren Adresse, trägt `noindex` und ist nirgends
verlinkt.

```
ÖFFENTLICH
index.html                     Verkaufsseite
landing.css                    Design nur für die Verkaufsseite
checkout.js                    ← hier den Bestell-Link eintragen
community.js                   ← hier den WhatsApp-Einladungslink eintragen
impressum, datenschutz,
agb, widerruf                  ausgefüllt
physio-nebenbei/
  base.css                     Design für alle Seiten
  zahlenfeld.js                Ziffernraster statt Handytastatur auf Touch-Geräten
  fahrplan.html                Leseprobe: Kapitelliste plus Kapitel 1
  vorlagen-generator.py        erzeugt die PDF-Vorlagen neu

NUR MIT LINK
v5frhmlitisu/
  index.html                   Startseite für Käufer:innen, als App speicherbar
  danke.html                   Ziel der Weiterleitung nach der Zahlung
  fahrplan.html                alle zehn Kapitel, Kapitel-Tracker plus persoenliche To-do-Liste
  monatsrechner.html           Umsatz, Ausgaben, Steuerrücklage, PDF-Export
  gehaltsrechner.html          Hauptjob plus Nebenverdienst, Krankenkassen-Ampel
  planungsrechner.html         Auslastung, Fahrtkosten, Rezeptlaufzeit, Geldeingang
  werkzeuge.html               Preis-Kalkulation
  terminbuchung.html           Zusatzkapitel zur Online-Terminvergabe
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

Dazu vier Rechner, die im Kundenbereich im Browser laufen.

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
