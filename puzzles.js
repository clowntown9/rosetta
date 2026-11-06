// Language tag for each puzzle `language`, so browsers and screen readers pronounce phrases
// correctly. Add a line here when a puzzle uses a new language.
window.LANGUAGES = {
  French: "fr",
  Spanish: "es",
  German: "de",
  Italian: "it",
  Portuguese: "pt-BR"
};

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
  },
  {
    title: "Two of Everything",
    language: "Italian",
    level: "Beginner",
    type: "decipher",
    intro: "Watch what happens to the end of a word when there's more than one.",
    examples: [
      ["Vorrei una birra.", "I would like a beer."],
      ["Vorrei due birre.", "I would like two beers."],
      ["Vorrei una pizza.", "I would like a pizza."]
    ],
    question: "How would you say \"I would like two pizzas\"?",
    choices: [
      { text: "Vorrei due pizza.", why: "\"birra\" became \"birre\" when there were two. \"pizza\" needs the same change." },
      { text: "Vorrei due pizze.", correct: true, why: "\"due\" means two, and the final -a switches to -e, just like \"birra\" to \"birre\"." },
      { text: "Vorrei una pizze.", why: "\"una\" means one. It can't go with the plural ending." }
    ],
    takeaway: "Words ending in -a usually switch to -e when there's more than one."
  },
  {
    title: "At the Market",
    language: "Spanish",
    level: "Beginner",
    type: "interpret",
    intro: "A quick exchange at a fruit stall. What does the customer decide?",
    conversation: [
      "Buenos días, ¿cuánto cuestan las manzanas?",
      "Dos euros el kilo.",
      "Pues, deme un kilo, por favor."
    ],
    question: "What does the customer do?",
    choices: [
      { text: "Buys a kilo of apples", correct: true, why: "\"Deme un kilo\" means \"give me a kilo\", and \"por favor\" makes it polite." },
      { text: "Asks for a lower price", why: "The price was given as \"dos euros el kilo\" and the customer doesn't argue with it." },
      { text: "Leaves without buying", why: "\"Deme\" means \"give me\". The customer is asking for something, not walking away." }
    ],
    takeaway: "\"Deme …, por favor\" is a polite way to ask for something in a shop."
  },
  {
    title: "Saying No",
    language: "French",
    level: "Beginner",
    type: "decipher",
    intro: "Find the two words that turn a sentence into its opposite.",
    examples: [
      ["Je comprends.", "I understand."],
      ["Je ne comprends pas.", "I don't understand."],
      ["Je parle français.", "I speak French."]
    ],
    question: "How would you say \"I don't speak French\"?",
    choices: [
      { text: "Je parle ne pas français.", why: "\"ne\" comes before the verb and \"pas\" comes after it. Here both are after." },
      { text: "Je pas parle français.", why: "You need both halves, \"ne\" and \"pas\", and \"pas\" goes after the verb." },
      { text: "Je ne parle pas français.", correct: true, why: "\"ne\" and \"pas\" wrap around the verb \"parle\", just like \"ne comprends pas\"." }
    ],
    takeaway: "\"ne … pas\" wraps around the verb to make it negative."
  },
  {
    title: "At the Bakery",
    language: "German",
    level: "Beginner",
    type: "interpret",
    intro: "A morning at the bakery counter. Follow the baker.",
    conversation: [
      "Guten Morgen! Was darf es sein?",
      "Zwei Brötchen, bitte.",
      "Gerne. Sonst noch etwas?"
    ],
    question: "What is the baker asking at the end?",
    choices: [
      { text: "How you would like to pay", why: "Paying would bring up \"zahlen\" or \"Karte\". Neither appears here." },
      { text: "Whether you want anything else", correct: true, why: "\"Sonst noch etwas?\" means \"anything else?\". \"Etwas\" is \"something\"." },
      { text: "Whether you want the rolls warmed up", why: "Nothing in the last line is about heat. \"Gerne\" just means \"gladly\"." }
    ],
    takeaway: "\"Sonst noch etwas?\" is the question you'll hear at every counter."
  },
  {
    title: "Pets",
    language: "Portuguese",
    level: "Beginner",
    type: "decipher",
    intro: "One, then more than one. Spot the change.",
    examples: [
      ["Eu tenho um gato.", "I have a cat."],
      ["Eu tenho dois gatos.", "I have two cats."],
      ["Eu tenho um cachorro.", "I have a dog."]
    ],
    question: "How would you say \"I have two dogs\"?",
    choices: [
      { text: "Eu tenho dois cachorros.", correct: true, why: "\"dois\" means two, and an -s makes the word plural, like \"gato\" to \"gatos\"." },
      { text: "Eu tenho dois cachorro.", why: "With two of them, the word needs the plural -s, like \"gatos\"." },
      { text: "Eu tenho um cachorros.", why: "\"um\" means one, so it can't go with the plural \"cachorros\"." }
    ],
    takeaway: "Add -s for more than one, and swap \"um\" for a number."
  },
  {
    title: "What Time Is It?",
    language: "Italian",
    level: "Beginner",
    type: "interpret",
    intro: "Someone asks a stranger a question. How do they react to the answer?",
    conversation: [
      "Scusa, che ore sono?",
      "Sono le tre.",
      "Già? Allora devo andare!"
    ],
    question: "What does the first person do after hearing the answer?",
    choices: [
      { text: "Asks what day it is", why: "\"Che ore sono?\" asks for the time, since \"ore\" means hours. Nobody mentions a day." },
      { text: "Agrees to meet at three", why: "Nothing is arranged. \"Sono le tre\" just says it's three o'clock." },
      { text: "Realizes it's late and has to leave", correct: true, why: "\"Già?\" means \"already?\" and \"devo andare\" means \"I have to go\"." }
    ],
    takeaway: "\"Che ore sono?\" asks the time, and \"Sono le …\" answers it."
  },
  {
    title: "Black and White",
    language: "Spanish",
    level: "Beginner",
    type: "decipher",
    intro: "Describing words change to match. Work out the rule.",
    examples: [
      ["el gato negro", "the black cat"],
      ["el perro blanco", "the white dog"],
      ["la casa blanca", "the white house"]
    ],
    question: "How would you say \"the black house\"?",
    choices: [
      { text: "la casa negra", correct: true, why: "\"casa\" takes \"la\", so the color ends in -a too, just like \"blanca\"." },
      { text: "la casa negro", why: "With \"la casa\", \"blanco\" became \"blanca\". \"negro\" has to change the same way." },
      { text: "el casa negra", why: "The examples pair \"casa\" with \"la\", not \"el\"." }
    ],
    takeaway: "With \"la\" words, the description ends in -a too."
  },
  {
    title: "Plans Fall Through",
    language: "French",
    level: "Beginner",
    type: "interpret",
    intro: "Use what you learned about saying no.",
    conversation: [
      "Tu viens ce soir?",
      "Désolé, je ne peux pas. Je travaille.",
      "Dommage! Une autre fois, alors."
    ],
    question: "Is the second person coming tonight?",
    choices: [
      { text: "Yes, after work", why: "\"ne … pas\" wraps around \"peux\". That makes it \"I can't\"." },
      { text: "No, they have to work", correct: true, why: "\"Je ne peux pas\" means \"I can't\", and \"je travaille\" means \"I'm working\"." },
      { text: "Maybe, they'll let you know later", why: "\"Désolé\" (sorry) plus \"ne peux pas\" is a clear no, and the friend answers \"another time\"." }
    ],
    takeaway: "\"Je ne peux pas\" is \"I can't\". Spot \"ne … pas\" and you know it's a no."
  },
  {
    title: "Me and You",
    language: "German",
    level: "Beginner",
    type: "decipher",
    intro: "The verb's ending depends on who is doing it.",
    examples: [
      ["Ich spiele Fußball.", "I play football."],
      ["Du spielst Fußball.", "You play football."],
      ["Ich trinke Wasser.", "I drink water."]
    ],
    question: "How would you say \"You drink water\"?",
    choices: [
      { text: "Du trinke Wasser.", why: "The -e ending goes with \"ich\". With \"du\", \"spiele\" became \"spielst\"." },
      { text: "Ich trinkst Wasser.", why: "\"Ich\" means \"I\". You need \"du\" for \"you\"." },
      { text: "Du trinkst Wasser.", correct: true, why: "\"du\" takes the -st ending, just like \"spielst\"." }
    ],
    takeaway: "\"ich\" verbs end in -e, \"du\" verbs end in -st."
  },
  {
    title: "Happy Birthday",
    language: "Spanish",
    level: "Beginner",
    type: "interpret",
    intro: "Ana gets a surprise. Who let the secret out?",
    conversation: [
      "¡Feliz cumpleaños, Ana!",
      "¡Gracias! ¿Cómo lo sabías?",
      "Me lo dijo tu hermano."
    ],
    question: "How did the friend know it was Ana's birthday?",
    choices: [
      { text: "Ana's brother told them", correct: true, why: "\"Me lo dijo\" means \"told me\", and \"tu hermano\" means \"your brother\"." },
      { text: "Ana told them herself", why: "\"tu\" means \"your\". Someone of Ana's told them, not Ana." },
      { text: "They saw it on a calendar", why: "No calendar is mentioned. The answer names a person: \"tu hermano\"." }
    ],
    takeaway: "\"¿Cómo lo sabías?\" means \"how did you know?\""
  },
  {
    title: "What's Your Name?",
    language: "Italian",
    level: "Beginner",
    type: "decipher",
    intro: "A statement and a question. Find the difference.",
    examples: [
      ["Mi chiamo Marco.", "My name is Marco."],
      ["Ti chiami Marco?", "Is your name Marco?"],
      ["Mi chiamo Giulia.", "My name is Giulia."]
    ],
    question: "How would you ask \"Is your name Giulia?\"",
    choices: [
      { text: "Mi chiami Giulia?", why: "\"mi\" is the \"my\" side of things. Asking someone else uses \"ti\"." },
      { text: "Ti chiami Giulia?", correct: true, why: "\"ti\" with \"chiami\" is how the examples ask about someone else's name." },
      { text: "Ti chiamo Giulia?", why: "\"chiamo\" is the ending that goes with \"mi\". With \"ti\" it becomes \"chiami\"." }
    ],
    takeaway: "\"Mi chiamo\" is \"my name is\". \"Ti chiami?\" asks theirs."
  },
  {
    title: "How Are You?",
    language: "Portuguese",
    level: "Beginner",
    type: "interpret",
    intro: "Two friends catch up. How is the last one doing?",
    conversation: [
      "Oi! Tudo bem?",
      "Tudo ótimo, e você?",
      "Mais ou menos. Estou cansado."
    ],
    question: "How is the last speaker feeling?",
    choices: [
      { text: "Great and ready to go out", why: "\"ótimo\" (great) was the other friend's answer." },
      { text: "Hungry", why: "Nothing mentions food. \"Cansado\" means tired." },
      { text: "So-so, because they're tired", correct: true, why: "\"Mais ou menos\" means \"more or less\", and \"estou cansado\" means \"I'm tired\"." }
    ],
    takeaway: "\"Mais ou menos\" is the honest answer to \"tudo bem?\""
  }
];
