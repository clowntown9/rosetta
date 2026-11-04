const keyElement = document.getElementById("key");
const questionElement = document.getElementById("question-list");
const puzzleIdElement = document.getElementById("puzzle-id");

const puzzles = [{
    name: "intro",
    title: "&alpha;",
    passage: "&alpha; &beta; &gamma; &delta;",
    key: [
        ["&alpha;", "First person pronoun."],
        ["&beta;", "To eat."],
        ["&gamma;", "Indefinite article."],
        ["&delta;", "An apple."],
        ["&epsilon;", "An orange."],
        ],
    qTitle: "Question title?",
    options: [
    "b",
    "default?",
    "answer c",
    ],
    answer: 0,
}]

let todayId = 0
let todaysPuzzle = puzzles[todayId].name;
let dateSymbol;

if (todayId % 7 === 0) {
    dateSymbol = "m";
} else if(todayId % 7 === 1) {
    dateSymbol = "t";
} else if(todayId % 7 === 2) {
    dateSymbol = "w";
} else if(todayId % 7 === 3) {
    dateSymbol = "r";
} else if(todayId % 7 === 4) {
    dateSymbol = "f";
} else if(todayId % 7 === 5) {
    dateSymbol = "s";
} else if(todayId % 7 === 6) {
    dateSymbol = "u";
}

for (const [phrase, translation] of puzzles[todayId].key) {
    const row = document.createElement("tr");

    const phraseCell = document.createElement("td");
    phraseCell.innerHTML = phrase;
    row.appendChild(phraseCell);

    const translationCell = document.createElement("td");
    translationCell.textContent = translation;
    row.appendChild(translationCell);

    keyElement.appendChild(row);
}
for (const option of puzzles[todayId].options) {
    const listItem = document.createElement("li");

    const button = document.createElement("button");
    button.textContent = option;
    listItem.appendChild(button);

    questionElement.appendChild(listItem);
}

document.getElementById("puzzle-title").innerHTML = puzzles[todayId].name;
document.getElementById("puzzle-passage").innerHTML = puzzles[todayId].passage;
document.getElementById("question-title").textContent = puzzles[todayId].qTitle;
puzzleIdElement.textContent = `${dateSymbol}#${todayId} - ${todaysPuzzle}`;