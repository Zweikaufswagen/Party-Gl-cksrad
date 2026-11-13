# Testbericht – Party-Glücksrad

Stand: 12. November 2026.

## Automatisierte Logiktests: 22 von 22 bestanden

`node --test tests/core.test.cjs`, Node.js 22.16.0.

Geprüft wurden Konfigurationsvalidierung, doppelte IDs, unzulässige Farben/Einstellungen,
Speicherung vor Ergebnisrückgabe, Wiederaufnahme vorhandener Ziehungen, Snapshot-Erhalt trotz
Konfigurationsänderung, Erledigt-Markierung, getrennte Party-IDs, beschädigte Spielstände,
blockierte Lese-/Schreibzugriffe, stille Schreibfehler, Speicherprobe, Zufallssampling,
Konfigurationsexport, Kontrastwahl und serialisierte konkurrierende Aufrufe.

Die Rad-Geometrie wurde für alle 23 erlaubten Segmentzahlen von 2 bis 24 mit jeweils 100
zufälligen Ziehungen geprüft: Der Zeiger landet im ausgewählten Segment.

## Browser-/DOM-Prüfungen: 25 von 25 bestanden

Chromium 144.0.7559.96 über Playwright. Sichtprüfung von Desktop-, Mobil- und Druckansicht.
Breiten geprüft: 320, 360, 390, 768, 1024 und 1440 Pixel, ohne horizontales Überlaufen.

Geprüft wurden unter anderem Mehrfachklick, gespeichertes Ergebnis vor Animationsbeginn,
Ergebnisanzeige, Wiederherstellung in einer neuen Seiteninstanz, Completion, geänderte
Konfiguration, Fehlerbehandlung, reduzierte Bewegung, 24-Segment-Rad, Ausgabe von HTML-artigem
Konfigurationstext als Text, Editor, Datei-Export, QR-URL-Prüfung und Druck-CSS.
Keine unbehandelten JavaScript-Ausnahmen in den regulären Gäste- und Editorabläufen.

Der generierte QR-Code wurde unabhängig mit OpenCV zurückgelesen. Die Testadresse wurde exakt
rekonstruiert. Diese Testadresse ist kein veröffentlichter App-Endpunkt.

## Grenzen dieser Tests

Die Testumgebung erlaubt keine reguläre Browser-Navigation zu HTTP-/HTTPS-Seiten. Daher wurden
HTML, CSS und JavaScript für DOM-Tests direkt in Chromium geladen und localStorage durch einen
In-Memory-Testadapter ersetzt. Eine neue Seiteninstanz erhielt denselben gespeicherten Datensatz,
um die Wiederherstellung zu prüfen. Dies ist kein Test eines echten Browser-Neustarts oder einer
echten Reload-Persistenz auf dem endgültigen Hosting.

Die Web-Locks-Serialisierung wurde mit einem serialisierten Testadapter geprüft, nicht mit
zwei produktiven HTTPS-Tabs. Echter localStorage, reale storage-Events zwischen Tabs und Web Locks
sollten deshalb auf der veröffentlichten Website geprüft werden. Für Safari/iOS, Firefox,
Chrome/Android sowie Druckerhardware liegt kein eigener Geräte-Test vor.

Es wurde keine Website auf einem öffentlichen Hosting-Konto veröffentlicht. Die Lieferdateien
sind vollständig statisch und bereit zum Hochladen. Die manuelle Abnahme ist in README.md beschrieben.
