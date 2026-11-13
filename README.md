# AFTER HOURS · Party-Glücksrad

Eine vollständige statische Party-Web-App: QR-Code scannen, einmal drehen, Aufgabe erhalten.
HTML, CSS und JavaScript – kein Backend, keine Datenbank, keine Anmeldung, kein Build-Schritt.

## Enthalten

- Mobiloptimierte Gästeseite mit animiertem SVG-Glücksrad, optionalem Sound und Konfetti.
- Zwölf fertige Beispielaufgaben; zwei bis 24 Aufgaben sind konfigurierbar.
- Eine gespeicherte Ziehung pro Party und Browser auf derselben Website.
- Das Ergebnis wird **vor** der Animation gespeichert. Ein Neuladen zeigt dieselbe Aufgabe.
- Snapshot der Aufgabe und des Rads: spätere Aufgabenänderungen überschreiben keine alten Ergebnisse.
- Optionaler „Mission erledigt“-Status und Kopierfunktion.
- Abgleich offener Tabs; Web Locks zur Serialisierung gleichzeitiger Ziehungen, sofern verfügbar.
- Fehlermeldungen und gesperrtes Rad bei fehlendem, blockiertem oder beschädigtem Speicher.
- Editor für Aufgaben, Texte, Farben und Einstellungen mit Export einer `config.js`.
- Lokaler QR-Code-Generator, SVG-Download und A4-Druckansicht.
- Keine externen Schriften, CDN-Skripte, Analyse- oder QR-Dienste.

**Die App ist als Dateien fertig, aber noch nicht auf deiner öffentlichen Domain veröffentlicht.**

## 1. Lokal starten

ZIP entpacken. Im Ordner `party-gluecksrad`, in dem die `index.html` liegt, ein Terminal öffnen.
Mit installiertem Python 3 unter Windows:

```powershell
py -m http.server 8080 --bind 127.0.0.1
```

Unter Linux/macOS:

```bash
python3 -m http.server 8080 --bind 127.0.0.1
```

Im Browser aufrufen:

```text
Gästeseite: http://localhost:8080/
Editor:    http://localhost:8080/setup.html
```

Der Befehl liefert ausschließlich statische Dateien aus. Er ist kein Anwendungsbackend.
Zum Beenden im Terminal `Strg+C` drücken. Andere statische Entwicklungs-Webserver funktionieren ebenfalls.

`index.html` lässt sich für einen ersten Blick auch direkt öffnen. Verlasse dich bei
`file://` aber nicht auf die Speichersperre: Dieses Verhalten ist nicht einheitlich definiert [1].
Für reguläre Tests einen lokalen Webserver verwenden, für die Party eine feste HTTPS-Adresse.
Die localhost-Adresse ist nur auf dem jeweiligen Gerät erreichbar – nicht auf den Handys deiner Gäste.

## 2. Konfigurieren

### Ohne Code: setup.html

Im Editor Partyname, Party-ID, Texte und Aufgaben anpassen. Aufgaben lassen sich hinzufügen,
entfernen und umsortieren. Bei mehr als 16 Aufgaben zeigt das Rad aus Platzgründen Nummern;
die gezogene Aufgabenkarte enthält immer den vollständigen Text.

Anschließend `config.js herunterladen` anklicken. Die heruntergeladene Datei muss die bisherige
`config.js` im App-Ordner ersetzen. Danach neu laden bzw. die geänderte Datei erneut veröffentlichen.
Ein vom Browser ergänzter Name wie `config (1).js` muss wieder in `config.js` umbenannt werden.

**Der Editor speichert Änderungen nicht automatisch und verändert keine Dateien auf deinem Server.**
Er ist kein authentifizierter Adminbereich. Gäste könnten ihn öffnen und eigene Dateien exportieren,
aber damit nicht deine veröffentlichte Konfiguration ändern. Er ist auf der Gästeseite nicht verlinkt.

### Direkt: config.js

Die komplette Konfiguration steht in einer gut lesbaren Datei:

```javascript
window.PARTY_CONFIG = {
  partyId: "geburtstag-2026-11",
  name: "LUCAS PARTY",
  edition: "DIE GEBURTSTAGS-EDITION",
  headline: "Ein Dreh.\nDeine Mission.",
  intro: "Dreh das Rad und finde deine Aufgabe für heute Abend.",
  footerNote: "Alles freiwillig. Respektiere die Grenzen anderer.",
  accentColor: "#d4ff7f",
  spinDurationMs: 6200,
  confetti: true,
  allowCompletion: true,
  tasks: [
    {
      id: "dance",
      label: "Dance break",
      emoji: "🪩",
      category: "MOVE IT",
      title: "Zeig deinen Signature-Move.",
      description: "Bring einer anderen Person deinen besten Tanzmove bei.",
      color: "#c2afff"
    },
    {
      id: "compliment",
      label: "Good vibes",
      emoji: "✨",
      category: "GOOD VIBES",
      title: "Verteile drei Komplimente.",
      description: "Mach drei verschiedenen Gästen ein ehrliches Kompliment.",
      color: "#d4ff7f"
    }
  ]
};
```

Alle Aufgaben sind gleich wahrscheinlich. Gleiche Aufgaben können an mehrere Gäste gehen.
Eine globale Verteilung „jede Aufgabe nur einmal“ ist nicht Teil dieser lokalen App.
Aufgaben-IDs müssen eindeutig sein; Party-ID und Aufgaben-IDs erlauben Buchstaben, Zahlen, `-` und `_`.
Farben verwenden `#RRGGBB`. Die App validiert die Konfiguration vor dem Start.

### Party-ID und Testläufe

Die `partyId` kennzeichnet die Veranstaltung. Beispiel: `sommerparty-2027-07-10`.
Ändere sie **einmal nach deinen Testläufen und vor der echten Party**.
Danach nicht mehr ändern, bis die Veranstaltung vorbei ist.

Eine neue Party-ID beginnt für alle Browser eine neue Runde. Alte Spielstände bleiben unter
anderen Schlüsseln erhalten. Eine bloße Änderung von Aufgaben oder Texten bei gleicher Party-ID
schaltet dagegen niemanden erneut frei. Auch `?test=1`, andere QR-Code-Parameter oder ein anderer
Pfad auf derselben Origin heben die Sperre nicht auf.

## 3. Veröffentlichen

Die App benötigt nur statisches Hosting. Ein möglicher Weg ist GitHub Pages [4]:

1. Ein Repository anlegen und den **Inhalt** des App-Ordners hochladen. `index.html` muss im
   veröffentlichten Stammverzeichnis liegen. Die leere `.nojekyll`-Datei ebenfalls übernehmen.
2. In den Repository-Einstellungen `Settings → Pages` öffnen.
3. `Deploy from a branch` wählen, anschließend `main` und `/(root)` auswählen und speichern.
4. Die von GitHub angezeigte HTTPS-Adresse verwenden und im normalen Browser prüfen.

Es sind keine npm-Installation, keine API-Schlüssel und keine Build-Befehle nötig.
Ein vorhandener statischer Webspace funktioniert genauso. Alle Pfade in der App sind relativ;
auch eine Veröffentlichung in einem Unterordner ist vorgesehen.

Während der Party dieselbe Domain, dasselbe Protokoll und dieselbe Party-ID verwenden.
HTTP und HTTPS sowie andere Hosts oder Ports haben getrennte Speicherbereiche [1].
Verwende deshalb auf allen Aushängen dieselbe endgültige HTTPS-Adresse.

Dateien, die mindestens für die Gästeseite benötigt werden:

```text
index.html
config.js
core.js
app.js
styles.css
assets/favicon.svg
```

Für den Editor zusätzlich:

```text
setup.html
setup.css
setup.js
vendor/qr.js
```

Der Editor kann ausschließlich lokal bleiben. In diesem Fall seine Dateien nicht hochladen und
lokal die öffentliche Gäste-URL zur QR-Erstellung eintragen. Lizenzhinweise bei der Weitergabe
beibehalten; `tests/` und diese Dokumentation werden für den Betrieb nicht benötigt.

Die App enthält absichtlich keinen Service Worker, damit alte Offline-Konfigurationen nicht
unbemerkt eine frühere Party-ID weiterverwenden. Eine Offline-Verfügbarkeit nach Neuladen wird
nicht zugesichert. Falls der Hoster aggressive Caches nutzt, neue Versionen vor der Party mit
Hard-Reload prüfen; `config.js` sollte beim Hoster nach Möglichkeit revalidiert werden.

## 4. QR-Code und Aushang

`setup.html` öffnen und im Bereich „Der Weg zur Party“ die endgültige öffentliche Adresse der
**Gästeseite** eintragen. Nicht `setup.html`, `localhost` oder einen Dateipfad verwenden.

`QR-Code erstellen` erzeugt den QR-Code vollständig im Browser. Anschließend sind ein skalierbarer
SVG-Download und `Aushang drucken` verfügbar. Der Druckdialog nutzt eine A4-Hochformatvorlage.
Bei Bedarf die Kopf-/Fußzeilen des Browsers ausschalten. Alle Aushänge können denselben Code tragen.

Erst einen Probeausdruck mit dem Handy scannen, dann mehrfach ausdrucken. Die App erstellt keine
automatische öffentliche URL; du trägst die vom Hosting-Anbieter erhaltene URL ein.

## 5. Was die Einmal-Sperre leistet – und was nicht

Gespeichert wird im `localStorage` unter:

```text
party-wheel:v1:<partyId>
```

Der Datensatz enthält eine zufällige Ziehungs-ID, den Ziehungszeitpunkt, die vollständige Aufgabe,
die damaligen Radsegmente, die Endposition des Rads und optional den Erledigt-Zeitpunkt.
Das sind keine Kontodaten. Die App sendet den Spielstand nirgendwohin.

Der Ablauf lautet: bestehenden Spielstand lesen → unter einer Tab-Sperre gegebenenfalls ziehen →
Ergebnis schreiben und zurücklesen → erst dann animieren. Ein Doppelklick wird zusätzlich unmittelbar
im aktuellen Tab blockiert. Ändert sich der Speicher in einem anderen Tab, wird die Ansicht aktualisiert [2].

Wo verfügbar, verwendet die App `navigator.locks` für gleichzeitige Zugriffe [3]. Diese API erfordert
in regulären Webumgebungen einen sicheren Kontext; deshalb HTTPS verwenden. Auf älteren Browsern
oder unsicherem Netzwerk-HTTP gibt es einen Best-Effort-Abgleich. Da `localStorage` selbst keine
atomare Compare-and-set-Operation bietet, ist dort bei exakt gleichzeitigen Klicks aus mehreren Tabs
keine vollständige Konkurrenzsicherheit versprochen.

**Die Sperre ist eine Fairnessregel pro Browserprofil und Website, keine Identitätsprüfung pro Person.**
Wer Website-Daten löscht, einen anderen Browser/ein anderes Gerät verwendet oder in einer neuen
privaten Sitzung spielt, kann sie umgehen. Private Speicher werden beim Ende der privaten Sitzung
wieder gelöscht [1]. Ein bloßes Neuladen im selben normalen Browser setzt die Aufgabe nicht zurück.
Browser können gespeicherte Daten außerdem durch Nutzereinstellungen oder Speicherbereinigung entfernen.
Eine manipulationssichere Sperre ist ohne zusätzliche Identifikation nicht erreichbar.

Zwei Personen, die sich dasselbe Browserprofil auf einem Gerät teilen, teilen sich auch diese eine
Ziehung. Gäste sollten ihren normalen Browser verwenden und beim erneuten Öffnen dabei bleiben.
Eine eingebettete Ansicht in einer anderen App kann einen anderen Speicherbereich verwenden.

Es gibt bewusst keinen Reset-Button auf der Gästeseite und keinen öffentlich nutzbaren Reset-Parameter.
Für eigene Entwicklungstests lässt sich ausschließlich der eigene Testeintrag in den Browser-DevTools
unter „Application/Speicher → Local Storage“ entfernen. Das kann keinen fremden Browser zurücksetzen.

## 6. Fehlerfälle

**„Website-Daten können nicht gespeichert werden“:** Browser-Einstellungen prüfen, Website-Speicher
zulassen und neu laden. Die App gibt ohne erfolgreiche Speicherung keine neue Aufgabe frei.

**„Spielstand ist beschädigt“:** Die App überschreibt den vorhandenen Eintrag nicht automatisch und
bleibt gesperrt. In einem eigenen Testbrowser darf der Testeintrag gezielt entfernt werden.

**„Konfiguration ungültig“:** IDs, Anzahl der Aufgaben, Farben, Zeichenlängen und Datentypen prüfen.
Für JavaScript-Syntaxfehler in `config.js` auch die Browserkonsole ansehen.

**Alte Aufgabe nach Änderungen:** Das ist beabsichtigt. Schon gezogene Aufgaben werden als Snapshot
beibehalten. Für eine neue Veranstaltung eine neue Party-ID verwenden.

**Kein Sound:** Der Ton startet standardmäßig ausgeschaltet. Oben rechts einschalten. Die App
bleibt auch ohne Audio-Unterstützung benutzbar. Geräteeinstellungen können Audio stummschalten.

## 7. Tests und Abnahme vor der Party

Die beigefügten Logiktests laufen ohne zusätzliche Node-Pakete:

```bash
node --test tests/core.test.cjs
```

Zusätzliche Browser-DOM-Tests benötigen Python, Playwright und Chromium:

```bash
python -m pip install playwright
python tests/browser-smoke.py
```

Bei Bedarf `CHROMIUM_EXECUTABLE` auf die lokale Chromium-/Chrome-Datei setzen. Die Browser-Tests
verwenden ausdrücklich einen In-Memory-Speicheradapter. Sie ersetzen nicht die Prüfung echten
Browser-Speichers unter deiner endgültigen HTTPS-Adresse. Details: `TESTBERICHT.md`.

Vor der Veranstaltung mit einer Test-Party-ID auf dem veröffentlichten Hosting prüfen:

1. QR-Code mit einem Smartphone scannen, drehen und während der Animation neu laden.
   Danach muss die bereits gespeicherte Aufgabe erscheinen.
2. Seite schließen und im selben normalen Browser erneut öffnen. Kein zweiter Dreh.
3. Zwei Tabs öffnen und nahezu gleichzeitig drehen. Beide müssen dieselbe Aufgabe anzeigen.
4. „Mission erledigt“ drücken und neu laden. Die Markierung muss erhalten bleiben.
5. Zweites Gerät bzw. anderes Browserprofil testen: dort ist ein eigener Dreh möglich.
6. Nach den Tests die finale Party-ID einstellen, veröffentlichen und den QR-Link nochmals prüfen.

Safari/iOS, Chrome/Android und der konkrete Hosting-Endpunkt wurden hier nicht als reale Geräte
bzw. produktive Website getestet. Eine kurze Abnahme auf den tatsächlich verwendeten Geräten ist wichtig.

## 8. Datenschutz und Technik

Die App lädt nur ihre eigenen statischen Dateien und erzeugt keine Analyse-, Werbe- oder Trackinganfragen.
Die Aufgaben werden nicht an einen Server übertragen. Der Hosting-Anbieter verarbeitet beim Abruf
allerdings Verbindungsdaten, beispielsweise die IP-Adresse. Die App kann dessen Protokollierung nicht
kontrollieren. Der Datenschutzhinweis in der Gästeseite unterscheidet beides.

Technik: Vanilla JavaScript, SVG, Web Crypto für die Zufallsauswahl, localStorage und optional
Web Locks. Text aus der Konfiguration wird als Text ausgegeben, nicht als HTML ausgeführt.
Die Konfiguration und alle Aufgaben sind öffentlich lesbar; darin keine Passwörter oder Geheimnisse ablegen.
Der lokale QR-Generator und seine Lizenzhinweise liegen in `vendor/` bzw. `THIRD_PARTY_NOTICES.txt`.

## Referenzen

[1] MDN – Window.localStorage:
https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage

[2] MDN – Window: storage event:
https://developer.mozilla.org/en-US/docs/Web/API/Window/storage_event

[3] MDN – Web Locks API:
https://developer.mozilla.org/en-US/docs/Web/API/Web_Locks_API

[4] GitHub Docs – Publishing source for GitHub Pages:
https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

Dokumentation geprüft am 12. November 2026.
