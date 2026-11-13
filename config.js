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
      id: "story", label: "Plot twist", emoji: "🎬", category: "STORY TIME",
      title: "Erzähl die unwahrscheinlichste Story.",
      description: "Erzähle jemandem zwei kurze Geschichten über dich: eine wahre und eine erfundene. Lass die Person raten, welche stimmt.",
      color: "#c2afff"
    },
    {
      id: "connection", label: "Small world", emoji: "🤝", category: "CONNECT",
      title: "Finde eure Gemeinsamkeit.",
      description: "Sprich mit jemandem, den du noch kaum kennst. Findet eine überraschende Gemeinsamkeit – die heutige Party zählt nicht.",
      color: "#d4ff7f"
    },
    {
      id: "pantomime", label: "Silent movie", emoji: "🎭", category: "SHOWTIME",
      title: "Großes Kino. Ohne Worte.",
      description: "Stelle einen bekannten Film nur mit Gesten dar. Such dir ein kleines Publikum und lass es den Titel erraten.",
      color: "#ffb48a"
    },
    {
      id: "hype", label: "Hype person", emoji: "📣", category: "GOOD VIBES",
      title: "Heute bist du der Fanclub.",
      description: "Frag eine Person nach etwas, auf das sie gerade stolz ist. Feiere ihren Erfolg mit einer kurzen, herrlich übertriebenen Laudatio.",
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
    }
  ]
};
