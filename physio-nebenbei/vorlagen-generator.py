# -*- coding: utf-8 -*-
"""Erzeugt die zwei neuen Patientenvorlagen im Stil der bestehenden Muster.

Stilwerte wurden aus Honorarvereinbarung.pdf ausgelesen, damit alle vier
Dokumente im Paket gleich aussehen.
"""
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.colors import HexColor
from reportlab.lib.utils import simpleSplit

W, H = A4
L = 56.7                      # linker Rand
R = W - 56.7                  # rechter Rand
BREITE = R - L

INK      = HexColor('#1B1F1D')
GRAU     = HexColor('#5B655F')
GRUEN    = HexColor('#146B5E')
ROT      = HexColor('#A8391F')
BOX_BG   = HexColor('#FBEAE4')
LINIE    = HexColor('#C9CFCB')
WASSER   = HexColor('#246B5E')

FUSS = 'PhysioNebenbei — Muster-Vorlage, keine Rechtsberatung'


class Blatt:
    def __init__(self, pfad, titel, untertitel):
        self.c = canvas.Canvas(pfad, pagesize=A4)
        self.c.setTitle(titel)
        self.titel = titel
        self.untertitel = untertitel
        self.seite = 0
        self.neue_seite(erste=True)

    # ---------- Seitengeruest ----------
    def wasserzeichen(self):
        c = self.c
        c.saveState()
        c.setFillColor(WASSER)
        c.setFont('Helvetica-Bold', 90)
        try:
            c.setFillAlpha(0.06)
        except Exception:
            pass
        c.translate(W / 2, H / 2)
        c.rotate(58)
        c.drawCentredString(0, 0, 'MUSTER')
        c.restoreState()

    def fusszeile(self):
        c = self.c
        c.setFont('Helvetica', 7.5)
        c.setFillColor(GRAU)
        c.drawString(L, 34, FUSS)
        c.drawRightString(R, 34, f'Seite {self.seite}')

    def neue_seite(self, erste=False):
        if not erste:
            self.fusszeile()
            self.c.showPage()
        self.seite += 1
        self.wasserzeichen()
        self.y = H - 62
        if erste:
            self.kopf()

    def platz(self, noetig):
        """Sorgt dafuer, dass noetig Punkte Platz sind, sonst neue Seite."""
        if self.y - noetig < 70:
            self.neue_seite()

    # ---------- Bausteine ----------
    def kopf(self):
        c = self.c
        c.setFont('Helvetica-Bold', 20)
        c.setFillColor(INK)
        c.drawString(L, self.y, self.titel)
        self.y -= 20
        c.setFont('Helvetica', 11)
        c.setFillColor(GRAU)
        for zeile in simpleSplit(self.untertitel, 'Helvetica', 11, BREITE):
            c.drawString(L, self.y, zeile)
            self.y -= 14
        self.y -= 10

    def warnkasten(self, text):
        c = self.c
        innen = BREITE - 26
        zeilen = simpleSplit(text, 'Helvetica', 9.5, innen)
        hoehe = 20 + 13 + len(zeilen) * 12
        self.platz(hoehe + 10)
        oben = self.y
        unten = oben - hoehe
        c.setFillColor(BOX_BG)
        c.rect(L + 7, unten, BREITE - 7, hoehe, stroke=0, fill=1)
        c.setStrokeColor(ROT)
        c.setLineWidth(3)
        c.line(L + 7, unten, L + 7, oben)
        c.setFont('Helvetica-Bold', 9.5)
        c.setFillColor(ROT)
        c.drawString(L + 20, oben - 16, 'MUSTER-VORLAGE — KEINE RECHTSBERATUNG')
        c.setFont('Helvetica', 9.5)
        c.setFillColor(INK)
        y = oben - 31
        for zeile in zeilen:
            c.drawString(L + 20, y, zeile)
            y -= 12
        self.y = unten - 20

    def abschnitt(self, nummer, titel):
        self.platz(46)
        self.y -= 6
        self.c.setFont('Helvetica-Bold', 12.5)
        self.c.setFillColor(GRUEN)
        self.c.drawString(L, self.y, f'{nummer} · {titel}')
        self.y -= 17

    def absatz(self, text, groesse=10):
        zeilen = simpleSplit(text, 'Helvetica', groesse, BREITE)
        self.platz(len(zeilen) * (groesse + 3) + 6)
        self.c.setFont('Helvetica', groesse)
        self.c.setFillColor(INK)
        for zeile in zeilen:
            self.c.drawString(L, self.y, zeile)
            self.y -= groesse + 3
        self.y -= 5

    def punkte(self, eintraege, groesse=10):
        for e in eintraege:
            zeilen = simpleSplit(e, 'Helvetica', groesse, BREITE - 14)
            self.platz(len(zeilen) * (groesse + 3) + 4)
            self.c.setFont('Helvetica', groesse)
            self.c.setFillColor(INK)
            self.c.drawString(L + 2, self.y, '•')
            for i, zeile in enumerate(zeilen):
                self.c.drawString(L + 14, self.y, zeile)
                self.y -= groesse + 3
            self.y -= 2
        self.y -= 4

    def feld(self, label, linien=1, breite=None):
        """Beschriftetes Ausfuellfeld mit Linie."""
        self.platz(24 + linien * 22)
        self.c.setFont('Helvetica-Bold', 10)
        self.c.setFillColor(INK)
        self.c.drawString(L, self.y, label)
        self.y -= 18
        b = breite or BREITE
        for _ in range(linien):
            self.c.setStrokeColor(LINIE)
            self.c.setLineWidth(0.6)
            self.c.line(L, self.y, L + b, self.y)
            self.y -= 22
        self.y -= 4

    def leerlinien(self, anzahl, abstand=22):
        self.platz(anzahl * abstand)
        for _ in range(anzahl):
            self.c.setStrokeColor(LINIE)
            self.c.setLineWidth(0.6)
            self.c.line(L, self.y, R, self.y)
            self.y -= abstand
        self.y -= 4

    def tabelle(self, spalten, zeilen_anzahl, zeilenhoehe=30):
        """spalten: Liste von (Ueberschrift, Anteil)."""
        gesamt = sum(a for _, a in spalten)
        breiten = [BREITE * a / gesamt for _, a in spalten]
        self.platz(zeilenhoehe * (zeilen_anzahl + 1) + 10)

        c = self.c
        kopf_y = self.y
        c.setFont('Helvetica-Bold', 8.5)
        c.setFillColor(GRAU)
        x = L
        for (titel, _), b in zip(spalten, breiten):
            c.drawString(x + 4, kopf_y - 11, titel.upper())
            x += b
        c.setStrokeColor(HexColor('#8C948F'))
        c.setLineWidth(0.8)
        c.line(L, kopf_y - 17, R, kopf_y - 17)

        y = kopf_y - 17
        for _ in range(zeilen_anzahl):
            y -= zeilenhoehe
            c.setStrokeColor(LINIE)
            c.setLineWidth(0.5)
            c.line(L, y, R, y)
        # senkrechte Trenner
        x = L
        for b in breiten[:-1]:
            x += b
            c.line(x, kopf_y - 17, x, y)
        self.y = y - 16

    def unterschrift(self, links, rechts):
        self.platz(60)
        self.y -= 16
        b = (BREITE - 30) / 2
        c = self.c
        c.setStrokeColor(LINIE)
        c.setLineWidth(0.6)
        c.line(L, self.y, L + b, self.y)
        c.line(L + b + 30, self.y, R, self.y)
        c.setFont('Helvetica', 8.5)
        c.setFillColor(GRAU)
        c.drawString(L, self.y - 11, links)
        c.drawString(L + b + 30, self.y - 11, rechts)
        self.y -= 30

    def speichern(self):
        self.fusszeile()
        self.c.save()


# ============================================================
# 1 · Datenschutzerklaerung fuer Patient:innen
# ============================================================
def datenschutz(pfad):
    b = Blatt(pfad, 'Datenschutz-Information',
              'Information nach Art. 13 DSGVO für Patientinnen und Patienten — '
              'zum Aushändigen beim ersten Termin.')

    b.warnkasten(
        'Diese Vorlage ist eine unverbindliche Orientierung, kein geprüftes Rechtsdokument. '
        'Vor der ersten Verwendung von einer Rechtsanwältin/einem Rechtsanwalt oder dem '
        'Rechtsservice deines Berufsverbands prüfen und an deinen Einzelfall anpassen lassen.')

    b.abschnitt(1, 'Wer die Daten verarbeitet')
    b.absatz('Verantwortlich für die Verarbeitung Ihrer Daten im Sinne der DSGVO ist:')
    b.feld('Name, Anschrift, Telefon und E-Mail der Behandlerin / des Behandlers:', linien=3)

    b.abschnitt(2, 'Welche Daten ich verarbeite')
    b.punkte([
        'Stammdaten: Name, Geburtsdatum, Anschrift, Telefonnummer, E-Mail-Adresse.',
        'Gesundheitsdaten: Anamnese, Befunde, Behandlungsziele, Behandlungsverlauf, '
        'ärztliche Verordnungen und Arztberichte, soweit sie mir vorliegen.',
        'Abrechnungsdaten: erbrachte Leistungen, Termine, Rechnungs- und Zahlungsdaten.',
    ])

    b.abschnitt(3, 'Zweck und Rechtsgrundlage')
    b.absatz(
        'Ich verarbeite Ihre Daten, um Sie physiotherapeutisch zu behandeln, den Verlauf zu '
        'dokumentieren und meine Leistungen abzurechnen.')
    b.punkte([
        'Für die Behandlung und deren Dokumentation: Art. 9 Abs. 2 lit. h DSGVO in Verbindung '
        'mit § 22 Abs. 1 Nr. 1 lit. b BDSG (Gesundheitsvorsorge und Behandlung).',
        'Für den Behandlungsvertrag und die Abrechnung: Art. 6 Abs. 1 lit. b DSGVO '
        '(Erfüllung eines Vertrags).',
        'Für gesetzliche Aufbewahrungspflichten: Art. 6 Abs. 1 lit. c DSGVO.',
    ])

    b.abschnitt(4, 'Woher die Daten kommen')
    b.absatz(
        'In der Regel erhalte ich die Daten unmittelbar von Ihnen. Zusätzlich können Daten aus '
        'einer ärztlichen Verordnung oder aus Berichten stammen, die Sie mir übergeben oder die '
        'mir mit Ihrer Einwilligung übermittelt werden.')

    b.abschnitt(5, 'Wer die Daten erhält')
    b.absatz(
        'Ihre Daten bleiben grundsätzlich bei mir. Eine Weitergabe erfolgt nur, soweit Sie '
        'ausdrücklich eingewilligt haben oder eine gesetzliche Pflicht besteht, zum Beispiel an:')
    b.punkte([
        'behandelnde Ärztinnen und Ärzte, wenn Sie einem Austausch zustimmen,',
        'Ihre private Krankenversicherung oder Beihilfestelle, wenn Sie die Rechnung dort '
        'einreichen,',
        'mein Steuerbüro und das Finanzamt im Rahmen der steuerlichen Pflichten, beschränkt auf '
        'Rechnungsdaten.',
    ])
    b.absatz(
        'Als Physiotherapeutin oder Physiotherapeut unterliege ich zusätzlich der beruflichen '
        'Schweigepflicht. Diese gilt unabhängig von der DSGVO.')

    b.abschnitt(6, 'Wie lange die Daten gespeichert werden')
    b.absatz(
        'Die Behandlungsdokumentation bewahre ich mindestens zehn Jahre nach Abschluss der '
        'Behandlung auf (§ 630f Abs. 3 BGB). Bei minderjährigen Patientinnen und Patienten '
        'beginnt diese Frist entsprechend später. Für Rechnungsunterlagen gelten die steuer- '
        'und handelsrechtlichen Aufbewahrungsfristen von bis zu zehn Jahren (§ 147 AO).')

    b.abschnitt(7, 'Ihre Rechte')
    b.absatz('Sie haben jederzeit das Recht auf:')
    b.punkte([
        'Auskunft über die zu Ihnen gespeicherten Daten (Art. 15 DSGVO),',
        'Berichtigung unrichtiger Daten (Art. 16 DSGVO),',
        'Löschung, soweit keine Aufbewahrungspflicht entgegensteht (Art. 17 DSGVO),',
        'Einschränkung der Verarbeitung (Art. 18 DSGVO),',
        'Datenübertragbarkeit (Art. 20 DSGVO),',
        'Widerspruch gegen die Verarbeitung (Art. 21 DSGVO),',
        'Widerruf einer erteilten Einwilligung mit Wirkung für die Zukunft.',
    ])
    b.absatz(
        'Außerdem können Sie sich bei einer Datenschutz-Aufsichtsbehörde beschweren. Zuständig '
        'ist die Behörde des Bundeslandes, in dem ich meine Tätigkeit ausübe:')
    b.feld('Zuständige Aufsichtsbehörde (Land, Anschrift):', linien=2)

    b.abschnitt(8, 'Freiwilligkeit')
    b.absatz(
        'Die Angabe Ihrer Daten ist freiwillig. Ohne die für Anamnese, Behandlung und '
        'Dokumentation erforderlichen Angaben kann ich Sie allerdings nicht fachgerecht '
        'behandeln.')

    b.abschnitt(9, 'Kenntnisnahme')
    b.absatz(
        'Hiermit bestätige ich, dass ich diese Datenschutz-Information erhalten und zur '
        'Kenntnis genommen habe.')
    b.unterschrift('Ort, Datum', 'Unterschrift Patient:in bzw. gesetzliche Vertretung')

    b.speichern()
    return pfad


# ============================================================
# 2 · Dokumentationsvorlage zum Ausdrucken
# ============================================================
def dokumentation(pfad):
    b = Blatt(pfad, 'Behandlungsdokumentation',
              'Vorlage zum Ausdrucken und handschriftlichen Ausfüllen — ein Bogen je '
              'Patientin oder Patient.')

    b.warnkasten(
        'Diese Vorlage ist eine unverbindliche Orientierung. Die Dokumentationspflicht nach '
        '§ 630f BGB bleibt in jedem Fall bei dir. Prüfe vor dem Einsatz, ob die Felder für '
        'deine Behandlungen ausreichen, und ergänze sie bei Bedarf.')

    b.abschnitt(1, 'Patientendaten')
    b.feld('Name, Vorname:', linien=1)
    b.feld('Geburtsdatum:', linien=1, breite=BREITE * 0.45)
    b.feld('Anschrift:', linien=2)
    b.feld('Telefon / E-Mail:', linien=1)
    b.feld('Ärztliche Verordnung liegt vor (Datum, ausstellende Praxis):', linien=1)

    b.abschnitt(2, 'Anamnese und Befund')
    b.absatz('Beschwerden, Vorerkrankungen, Medikamente, Kontraindikationen, Erstbefund.',
             groesse=9)
    b.leerlinien(7)

    b.abschnitt(3, 'Behandlungsziel')
    b.leerlinien(3)

    b.neue_seite()
    b.abschnitt(4, 'Verlauf')
    b.absatz('Je Termin eine Zeile. Bei Bedarf weitere Blätter dieser Seite ausdrucken.',
             groesse=9)
    b.tabelle(
        [('Datum', 1.0), ('Behandlung', 2.4), ('Verlauf / Reaktion', 2.4),
         ('Nächste Schritte', 2.0), ('Kürzel', 0.7)],
        zeilen_anzahl=16, zeilenhoehe=34)

    b.absatz(
        'Aufbewahrung: mindestens zehn Jahre nach Abschluss der Behandlung (§ 630f Abs. 3 BGB). '
        'Verschlossen oder passwortgeschützt aufbewahren, Gesundheitsdaten gehören nach '
        'Art. 9 DSGVO zu den besonders geschützten Daten.', groesse=9)

    b.speichern()
    return pfad


if __name__ == '__main__':
    import sys
    ziel = sys.argv[1] if len(sys.argv) > 1 else '.'
    print(datenschutz(f'{ziel}/Datenschutz-Patienten.pdf'))
    print(dokumentation(f'{ziel}/Dokumentationsvorlage.pdf'))
