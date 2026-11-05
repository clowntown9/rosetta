const keyElement = document.getElementById("key");
const questionElement = document.getElementById("question-list");

let dateSymbol;
let todayId = 0;

const puzzles = [{
    name: "aaa",
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
}, {}]

let todaysPuzzle = puzzles[todayId].name;

document.getElementById("leftArrow").addEventListener("click", leftArrow())
document.getElementById("rightArrow").addEventListener("click", rightArrow())

function leftArrow() {
    if (todayId >= 0) {
        todayId--;
        update();
    }; 
}
function rightArrow() {
    if (todayId < puzzles.length) {
        todayId++;
        update();
    };
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

function update() {
    if (todayId % 7 === 0) {dateSymbol = "m";}
    else if(todayId % 7 === 1) {dateSymbol = "t";}
    else if(todayId % 7 === 2) {dateSymbol = "w";}
    else if(todayId % 7 === 3) {dateSymbol = "r";}
    else if(todayId % 7 === 4) {dateSymbol = "f";}
    else if(todayId % 7 === 5) {dateSymbol = "s";}
    else if(todayId % 7 === 6) {dateSymbol = "u";}

    document.getElementById("puzzle-title").innerHTML = puzzles[todayId].title;
    document.getElementById("puzzle-passage").innerHTML = puzzles[todayId].passage;
    document.getElementById("question-title").textContent = puzzles[todayId].qTitle;
    document.getElementById("puzzle-id").innerHTML = `${dateSymbol}#${todayId.toString().padStart(6, "0")} - ${todaysPuzzle}`;
}

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("g").innerHTML = "g"
});