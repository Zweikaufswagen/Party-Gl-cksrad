/*
 * PARTY-GLÜCKSRAD · Konfiguration
 * Alternativ setup.html im Browser öffnen und eine neue config.js exportieren.
 * partyId vor der echten Party ändern; danach für diese Party unverändert lassen.
 * Gleiche partyId + gleiche Website = gleicher Spielstand in diesem Browser.
 */
window.PARTY_CONFIG = {
  partyId: "after-hours-2026-01",
  name: "AFTER HOURS",
  edition: "DIE PARTY-EDITION",
  headline: "Ein Dreh.\nDeine Mission.",
  intro: "Ein bisschen Zufall. Eine gute Geschichte. Dreh das Rad und finde heraus, was der Abend mit dir vorhat.",
  footerNote: "Alles kann. Nichts muss. Respektiere Grenzen und frag bei Fotos vorher nach.",
  accentColor: "#d4ff7f",
  spinDurationMs: 6200,
  confetti: true,
  allowCompletion: true,
  tasks: [
    {
      id: "dance", label: "Dance break", emoji: "🪩", category: "MOVE IT",
      title: "Zeig deinen Signature-Move.",
      description: "Erfinde einen Tanzmove und bring ihn einer anderen Person bei. Zehn Sekunden reichen – Hauptsache, ihr habt Spaß.",
      color: "#c2afff"
    },
    {
      id: "compliment", label: "Good vibes", emoji: "✨", category: "GOOD VIBES",
      title: "Drei ehrliche Komplimente.",
      description: "Mach drei verschiedenen Gästen jeweils ein ehrliches Kompliment. Zum Beispiel zu ihrem Humor, ihrer Energie oder ihrem Outfit.",
      color: "#d4ff7f"
    },
    {
      id: "photo", label: "Album cover", emoji: "📸", category: "CREATIVE CLUB",
      title: "Gründet eine Band. Für ein Foto.",
      description: "Finde zwei oder drei Leute und stellt ein möglichst dramatisches Albumcover nach. Nur mit Einverständnis fotografieren und teilen.",
      color: "#ffb48a"
    },
    {
      id: "emoji-quiz", label: "Emoji cinema", emoji: "🎬", category: "TEAM CHALLENGE",
      title: "Ein Film. Fünf Emojis. Wer checkt's?",
      description: "Stelle einen bekannten Film oder eine Serie mit höchstens fünf Emojis auf deinem Handy dar. Zwei Gäste raten um die Wette. Danach tauscht ihr die Rollen – wer knackt die meisten Titel?",
      color: "#c2afff"
    },
    {
      id: "connection", label: "Small world", emoji: "🤝", category: "CONNECT",
      title: "Finde eure Gemeinsamkeit.",
      description: "Sprich mit jemandem, den du noch kaum kennst. Findet eine überraschende Gemeinsamkeit",
      color: "#d4ff7f"
    },
    {
      id: "pantomime", label: "Silent movie", emoji: "🎭", category: "SHOWTIME",
      title: "Großes Kino. Ohne Worte.",
      description: "Stelle einen bekannten Film nur mit Gesten dar. Such dir ein kleines Publikum und lass es den Titel erraten.",
      color: "#ffb48a"
    },
    {
      id: "birthday-handshake", label: "Level 18", emoji: "🤜", category: "BIRTHDAY SPECIAL",
      title: "18 Sekunden für euren geheimen Handshake.",
      description: "Such dir einen Gast und stellt einen Timer auf 18 Sekunden. Erfindet in dieser Zeit einen Handshake mit drei Moves und einer Siegerpose. Führt ihn danach synchron einer dritten Person vor.",
      color: "#c2afff"
    },
    {
      id: "song", label: "Song quiz", emoji: "🎵", category: "MUSIC CLUB",
      title: "Summ den Soundtrack.",
      description: "Summe einen bekannten Song, ohne den Text zu singen. Jemand anderes muss ihn erkennen. Drei Versuche sind erlaubt.",
      color: "#d4ff7f"
    },
    {
      id: "pitch", label: "Shark tank", emoji: "💡", category: "CREATIVE CLUB",
      title: "Verkauf die absurdeste Idee.",
      description: "Erfinde ein völlig unnötiges Produkt und pitche es jemandem in 30 Sekunden. Bonus für einen überzeugenden Werbeslogan.",
      color: "#ffb48a"
    },
    {
      id: "team", label: "Team spirit", emoji: "🚀", category: "CONNECT",
      title: "Dein neues Dreamteam.",
      description: "Finde zwei Mitspieler und denkt euch einen Teamnamen sowie einen kurzen, möglichst albernen Teamgruß aus.",
      color: "#c2afff"
    },
    {
      id: "prediction", label: "Future you", emoji: "🔮", category: "STORY TIME",
      title: "Eine Nachricht an die Zukunft.",
      description: "Überlegt zu zweit eine lustige Vorhersage für die nächste gemeinsame Party. Schreibt sie auf, damit ihr sie später vergleichen könnt.",
      color: "#d4ff7f"
    },
    {
      id: "host", label: "Secret hero", emoji: "🦸", category: "GOOD VIBES",
      title: "Sei der heimliche Party-Held.",
      description: "Tu etwas Kleines, das den Abend für andere besser macht: bring jemandem Wasser, hilf beim Aufräumen oder frag die Gastgeber, was sie brauchen.",
      color: "#ffb48a"
    },
    {
      id: "birthday-countdown", label: "18er-Countdown", emoji: "🎂", category: "BIRTHDAY SPECIAL",
      title: "Zählt gemeinsam bis 18. Ohne Absprache.",
      description: "Bildet eine Gruppe aus mindestens vier Gästen. Zählt laut von 1 bis 18, ohne eine Reihenfolge festzulegen. Sprechen zwei gleichzeitig, geht es wieder bei 1 los. Ihr habt drei Versuche!",
      color: "#c2afff"
    },
    {
      id: "birthday-abc", label: "Birthday ABC", emoji: "🔤", category: "BIRTHDAY SPECIAL",
      title: "Das Geburtstagskind von A bis Z.",
      description: "Spielt zu dritt: Nennt reihum ein nettes Wort, ein Hobby oder eine gemeinsame Erinnerung zum Geburtstagskind – erst mit A, dann B, dann C. Wie weit kommt ihr in 60 Sekunden? Bei einem schwierigen Buchstaben dürft ihr einmal passen.",
      color: "#d4ff7f"
    },
    {
      id: "rock-paper-battle", label: "Mini-Turnier", emoji: "✂️", category: "BATTLE MODE",
      title: "Vier Gäste. Ein Schere-Stein-Papier-Champion.",
      description: "Hol drei Gäste dazu und spielt zwei Halbfinals und ein Finale in Schere, Stein, Papier. Pro Duell gewinnt, wer zuerst zweimal siegt. Zum Abschluss erfindet ihr gemeinsam einen absurden Titel für den Champion.",
      color: "#ffb48a"
    },
    {
      id: "mirror-moves", label: "Spiegelduell", emoji: "🪞", category: "MOVE IT",
      title: "Sei für 20 Sekunden ein menschlicher Spiegel.",
      description: "Stellt euch zu zweit gegenüber. Eine Person macht langsame, möglichst lustige Bewegungen, die andere spiegelt sie. Nach 20 Sekunden wechselt ihr. Schafft ihr beide Runden, ohne aus dem Takt zu kommen?",
      color: "#c2afff"
    },
    {
      id: "freeze-frame", label: "Freeze frame", emoji: "🧊", category: "SHOWTIME",
      title: "Baut das Standbild eines völlig wilden Moments.",
      description: "Such dir zwei Gäste. Eine vierte Person gibt euch eine Szene, zum Beispiel Alien-Landung auf der Party oder verschlafener Schulbus. Ihr habt zehn Sekunden, um sie als gemeinsames Standbild darzustellen. Haltet die Pose fünf Sekunden!",
      color: "#d4ff7f"
    },
    {
      id: "forbidden-words", label: "Nicht Ja, nicht Nein", emoji: "🚫", category: "BATTLE MODE",
      title: "Überlebe das Interview ohne Ja und Nein.",
      description: "Lass dir von einem Gast 30 Sekunden lang schnelle Fragen stellen. Du darfst weder Ja noch Nein sagen und musst auf jede Frage antworten. Danach wechselt ihr. Wer hält länger durch?",
      color: "#ffb48a"
    },
    {
      id: "one-word-story", label: "Wort für Wort", emoji: "💬", category: "CREATIVE CLUB",
      title: "Eine Party-Story, die niemand kontrolliert.",
      description: "Bildet eine Dreiergruppe und erzählt reihum eine Geschichte – jede Person darf immer nur ein Wort sagen. Los geht's mit: An meinem 18. Geburtstag … Versucht, nach einer Minute ein gemeinsames Ende zu finden.",
      color: "#c2afff"
    },
    {
      id: "silent-lineup", label: "Silent order", emoji: "🤫", category: "TEAM CHALLENGE",
      title: "Sortiert euch. Aber ohne ein Wort.",
      description: "Hol vier Gäste dazu. Stellt euch nach eurem Geburtstagsmonat von Januar bis Dezember auf – ohne zu sprechen oder zu tippen. Gesten sind erlaubt. Danach verratet ihr eure Monate und prüft die Reihenfolge.",
      color: "#d4ff7f"
    },
    {
      id: "five-second-duel", label: "5-Sekunden-Duell", emoji: "⏱️", category: "BATTLE MODE",
      title: "Drei Antworten. Fünf Sekunden.",
      description: "Fordere einen Gast heraus. Eine dritte Person nennt euch abwechselnd Kategorien wie Eissorten, Games oder Dinge auf dieser Party. Nennt jeweils drei passende Antworten in fünf Sekunden. Spielt drei Runden pro Person.",
      color: "#ffb48a"
    },
    {
      id: "air-band", label: "Air band", emoji: "🎸", category: "MUSIC CLUB",
      title: "Spielt den nächsten Refrain als Luftband.",
      description: "Gründe mit zwei Gästen eine Luftband: Gitarre, Schlagzeug und Keyboard. Spielt beim nächsten Refrain zehn Sekunden lang zusammen, als wärt ihr der Headliner. Einigt euch vorher auf eine gemeinsame Schlusspose.",
      color: "#c2afff"
    },
    {
      id: "beat-chain", label: "Beat-Kette", emoji: "🥁", category: "MUSIC CLUB",
      title: "Baut einen Beat, der immer länger wird.",
      description: "Spielt zu dritt. Du startest mit einem Klatschen. Die nächste Person wiederholt den Beat und ergänzt ein Klatschen, Schnipsen oder Klopfen auf die eigenen Beine. Wie viele Runden schafft ihr, bevor jemand die Reihenfolge vergisst?",
      color: "#d4ff7f"
    },
    {
      id: "drawing-relay", label: "Kritzel-Staffel", emoji: "✏️", category: "CREATIVE CLUB",
      title: "Ein Kunstwerk. Drei Leute. Kein Plan.",
      description: "Öffne eine Zeichen-App oder nimm Papier und Stift. Ihr zeichnet zu dritt nacheinander je zehn Sekunden am selben Bild weiter, ohne euch abzusprechen. Lasst danach einen vierten Gast dem fertigen Kunstwerk einen Titel geben.",
      color: "#ffb48a"
    },
    {
      id: "object-ad", label: "Werbepause", emoji: "📺", category: "SHOWTIME",
      title: "Macht einen Party-Gegenstand zum Luxusprodukt.",
      description: "Wählt zu zweit einen gewöhnlichen Gegenstand in Sichtweite. Spielt einem Gast einen 20-Sekunden-Werbespot vor: Eine Person moderiert, die andere liefert Soundeffekte. Euer Publikum vergibt einen Fantasiepreis für das Produkt.",
      color: "#c2afff"
    },
    {
      id: "same-brain", label: "Same brain", emoji: "🧠", category: "CONNECT",
      title: "Denkt ihr gerade dasselbe?",
      description: "Spielt zu dritt: Eine Person nennt eine Kategorie, etwa Fast Food, Superhelden oder Urlaubsorte. Die anderen sagen auf drei gleichzeitig einen passenden Begriff. Schafft ihr in fünf Runden mindestens einen Treffer? Wechselt danach durch.",
      color: "#d4ff7f"
    },
    {
      id: "laugh-duel", label: "Pokerface", emoji: "😐", category: "BATTLE MODE",
      title: "Wer lacht zuerst?",
      description: "Fordere einen Gast zum Pokerface-Duell heraus. Schaut euch 20 Sekunden an und versucht, euch mit Grimassen zum Lachen zu bringen. Berühren ist tabu. Eine dritte Person stoppt die Zeit und kürt das stabilste Pokerface.",
      color: "#ffb48a"
    },
    {
      id: "birthday-time-capsule", label: "Level 21", emoji: "🚀", category: "BIRTHDAY SPECIAL",
      title: "Eine Mini-Zeitkapsel für den 21. Geburtstag.",
      description: "Überlegt euch zu zweit einen lustigen, netten Wunsch und eine gemeinsame Unternehmung für das Geburtstagskind bis zum 21. Geburtstag. Schreibt beides in eine Handy-Notiz oder auf Papier und zeigt es dem Geburtstagskind, sobald es Zeit hat.",
      color: "#c2afff"
    },
    {
      id: "human-machine", label: "Party-Maschine", emoji: "⚙️", category: "TEAM CHALLENGE",
      title: "Werdet zur absurdesten Maschine der Party.",
      description: "Hol zwei oder drei Gäste dazu. Du startest mit einer wiederholten Bewegung und einem Geräusch. Nacheinander steigt jede Person mit einem eigenen Move und Sound ein. Lasst eure Maschine zehn Sekunden laufen und gebt ihr einen Namen.",
      color: "#d4ff7f"
    },
    {
      id: "category-rally", label: "Wort-Rallye", emoji: "🏁", category: "BATTLE MODE",
      title: "Wer hat das letzte Wort?",
      description: "Wählt zu zweit eine Kategorie wie Serien, Snacks oder Musik-Acts. Nennt abwechselnd einen passenden Begriff, ohne Wiederholungen. Wer länger als fünf Sekunden überlegt, verliert die Runde. Spielt drei Runden mit neuen Kategorien.",
      color: "#ffb48a"
    }
  ]
};

