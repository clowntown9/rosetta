// Handcrafted puzzles. Add new entries to the end; day #1 is the first entry.
// type "decipher": study the examples, then pick the correct phrase.
// type "interpret": read a conversation, then pick the correct meaning.
window.PUZZLES = [
  {
    title: "At the Café",
    language: "French",
    level: "Beginner",
    type: "decipher",
    intro: "Observe the patterns, then work out how to say something new.",
    examples: [
      ["Je voudrais un café.", "I would like a coffee."],
      ["Je voudrais un croissant.", "I would like a croissant."],
      ["Je voudrais un thé.", "I would like a tea."]
    ],
    question: "How would you say \"I would like a coffee and a croissant\"?",
    choices: [
      { text: "Je suis un café et un croissant.", why: "\"Je suis\" means \"I am\". You would be announcing that you are a coffee." },
      { text: "Je voudrais un café et un croissant.", correct: true, why: "\"Je voudrais\" stays the same and \"et\" joins the two items." },
      { text: "Je voudrais un café avec croissant.", why: "\"avec\" means \"with\", and the article \"un\" is missing before croissant." }
    ],
    takeaway: "Observe, deduce, apply, understand."
  },
  {
    title: "Plans for Tonight",
    language: "Spanish",
    level: "Beginner",
    type: "interpret",
    intro: "Read the conversation and figure out what happens next.",
    conversation: [
      "¿Quieres venir conmigo?",
      "Claro, ¿a qué hora?",
      "A las ocho. ¿Te parece bien?"
    ],
    question: "What is the last person asking?",
    choices: [
      { text: "Whether eight o'clock works for you", correct: true, why: "\"¿Te parece bien?\" literally asks \"does it seem good to you?\" It is how you check a plan with someone." },
      { text: "Where you want to meet", why: "Place would be \"¿dónde?\". Nothing in the last line mentions a location." },
      { text: "Whether you want to bring someone else", why: "Nothing here refers to another person. \"A las ocho\" is the time being proposed." }
    ],
    takeaway: "\"A las ocho\" gives the time. \"¿Te parece bien?\" asks if it suits you."
  },
  {
    title: "Where Is It?",
    language: "German",
    level: "Beginner",
    type: "decipher",
    intro: "Same pattern, different words.",
    examples: [
      ["Wo ist der Bahnhof?", "Where is the train station?"],
      ["Wo ist die Toilette?", "Where is the toilet?"],
      ["Wo ist das Hotel?", "Where is the hotel?"]
    ],
    question: "How would you ask \"Where is the pharmacy?\" (die Apotheke)",
    choices: [
      { text: "Wo ist die Apotheke?", correct: true, why: "\"Wo ist …?\" opens the question, followed by the thing you are looking for." },
      { text: "Ist wo die Apotheke?", why: "The question word \"wo\" comes first, then the verb." },
      { text: "Die Apotheke wo ist?", why: "The question word comes first, then the verb, then the thing." }
    ],
    takeaway: "\"Wo ist …?\" is your key for finding anything."
  },
  {
    title: "A Text from Berlin",
    language: "German",
    level: "Beginner",
    type: "interpret",
    intro: "Informal messages shorten things. Work out what's being said.",
    conversation: [
      "Hast du Lust auf Kino heute?",
      "Ja, gerne! Wann denn?",
      "Um 19 Uhr? Passt das?"
    ],
    question: "What does the last message ask?",
    choices: [
      { text: "Whether 7 pm suits you", correct: true, why: "\"Um 19 Uhr\" is 7 pm on the 24-hour clock, and \"Passt das?\" asks if it fits." },
      { text: "Which film you want to watch", why: "No film is mentioned. \"Kino\" is the place, not a title." },
      { text: "Whether you are free tomorrow", why: "The first message said \"heute\", which means today." }
    ],
    takeaway: "\"Passt das?\" is the everyday way to check a plan."
  }
];
