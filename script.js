const keyElement = document.getElementById("key");
const questionElement = document.getElementById("question-list");
const puzzleIdElement = document.getElementById("puzzle-id");

puzzleIdElement.textContent = `${dateSymbol}#000001 - ${todaysPuzzle}`;

const key = [[
    "puzzle title",
    "&alpha;",
    "&alpha; &beta; &gamma; &delta;",
    [
    ["&alpha;", "First person pronoun."],
    ["&beta;", "To eat."],
    ["&gamma;", "Indefinite article."],
    ["&delta;", "An apple."],
    ["&epsilon;", "An orange."],
    ],
    [
    0,
    "Question title?",
    [
    "b",
    "default?",
    "answer c",
    ],
    ]
]]

let todayId = 0
let todaysPuzzle = key[todayId][0];
let dateSymbol;

if (todaysPuzzleId % 7 === 0) {
    dateSymbol = "m";
} else if(todaysPuzzleId % 7 === 1) {
    dateSymbol = "t";
} else if(todaysPuzzleId % 7 === 2) {
    dateSymbol = "w";
} else if(todaysPuzzleId % 7 === 3) {
    dateSymbol = "r";
} else if(todaysPuzzleId % 7 === 4) {
    dateSymbol = "f";
} else if(todaysPuzzleId % 7 === 5) {
    dateSymbol = "s";
} else if(todaysPuzzleId % 7 === 6) {
    dateSymbol = "u";
}

let todaysKey = key[todaysPuzzleId][3];
let todaysQuestion = key[todaysPuzzleId][4];

for (const [phrase, translation] of todaysKey) {
    const row = document.createElement("tr");

    const phraseCell = document.createElement("td");
    phraseCell.innerHTML = phrase;
    row.appendChild(phraseCell);

    const translationCell = document.createElement("td");
    translationCell.textContent = translation;
    row.appendChild(translationCell);

    keyElement.appendChild(row);
}

document.getElementById("puzzle-title").innerHTML = key[todaysPuzzleId][0];
document.getElementById("puzzle-passage").innerHTML = key[todaysPuzzleId][1];

for (const option of todaysQuestion[2]) {
    const listItem = document.createElement("li");

    const button = document.createElement("button");
    button.textContent = option;
    listItem.appendChild(button);

    questionElement.appendChild(listItem);
}

document.getElementById("question-title").textContent = todaysQuestion[1];