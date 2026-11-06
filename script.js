(function () {
  "use strict";

  var puzzles = window.PUZZLES || [];
  var EPOCH = Date.UTC(2026, 10, 4); // day #1 = 2026-11-04
  var STORE = "rosetta-progress-v1";

  function $(id) { return document.getElementById(id); }

  function load() {
    try { return JSON.parse(localStorage.getItem(STORE)) || {}; } catch (e) { return {}; }
  }
  function save(p) {
    try { localStorage.setItem(STORE, JSON.stringify(p)); } catch (e) { /* storage unavailable */ }
  }

  // Days since day #1 by the player's local calendar date, so a new puzzle unlocks at their midnight.
  function daysSinceEpoch() {
    var now = new Date();
    var utc = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
    return Math.floor((utc - EPOCH) / 86400000);
  }

  var today = daysSinceEpoch();
  // Newest puzzle the player may open. Later entries stay locked until their day arrives.
  var latest = Math.max(0, Math.min(today, puzzles.length - 1));
  var outOfPuzzles = today > puzzles.length - 1;
  var progress = load();
  var current = latest;

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function renderHistory() {
    var solved = 0;
    for (var i = 0; i <= latest; i++) {
      if (progress[i] && progress[i].solved) solved++;
    }
    var text = solved + " of " + (latest + 1) + " solved";
    if (outOfPuzzles) text += ". That's every puzzle so far, and new ones are on the way.";
    $("history").textContent = text;
  }

  // A solved puzzle is finished: the answer stays shown and the try count stays fixed for sharing.
  function lockQuiz() {
    var form = $("quiz");
    form.querySelector("fieldset").disabled = true;
    form.querySelector(".check").hidden = true;
  }

  function render() {
    var p = puzzles[current];
    var num = ("000000" + (current + 1)).slice(-6);
    $("day").textContent = "day #" + num + " · " + p.language + " · " + p.level;
    $("puzzle-title").textContent = p.title;
    $("prev").disabled = current === 0;
    $("next").disabled = current === latest;

    var left = $("study");
    left.textContent = "";
    left.appendChild(el("p", "intro", p.intro));

    if (p.type === "decipher") {
      var table = el("table", "rounded");
      table.id = "key";
      var head = el("tr");
      head.appendChild(el("th", null, "phrase"));
      head.appendChild(el("th", null, "translation"));
      table.appendChild(head);
      p.examples.forEach(function (row) {
        var tr = el("tr");
        tr.appendChild(el("td", null, row[0]));
        tr.appendChild(el("td", null, row[1]));
        table.appendChild(tr);
      });
      left.appendChild(table);
    } else {
      var convo = el("div", "convo");
      p.conversation.forEach(function (line, i) {
        convo.appendChild(el("p", "bubble " + (i % 2 ? "them" : "me"), line));
      });
      left.appendChild(convo);
    }

    var form = $("quiz");
    form.textContent = "";
    var fs = el("fieldset");
    fs.appendChild(el("legend", null, p.question));
    p.choices.forEach(function (c, i) {
      var label = el("label", "choice");
      var input = el("input");
      input.type = "radio";
      input.name = "answer";
      input.value = i;
      label.appendChild(input);
      label.appendChild(el("span", null, c.text));
      fs.appendChild(label);
    });
    form.appendChild(fs);
    var btn = el("button", "check", "check answer");
    btn.type = "submit";
    form.appendChild(btn);

    var fb = $("feedback");
    fb.textContent = "";
    fb.className = "";

    var done = progress[current];
    if (done) {
      // Older saves kept recording answers after a solve, so a solved puzzle shows its correct choice, not `last`.
      var shown = done.solved ? correctIndex(p) : done.last;
      showFeedback(p, shown, true);
      form.querySelector('input[value="' + shown + '"]').checked = true;
      if (done.solved) lockQuiz();
    }
    renderHistory();
  }

  function correctIndex(p) {
    for (var i = 0; i < p.choices.length; i++) {
      if (p.choices[i].correct) return i;
    }
    throw new Error("Puzzle \"" + p.title + "\" has no correct choice");
  }

  function showFeedback(p, idx, quiet) {
    var c = p.choices[idx];
    var fb = $("feedback");
    fb.textContent = "";
    fb.className = c.correct ? "good" : "bad";
    fb.setAttribute("role", "status");
    fb.appendChild(el("strong", null, c.correct ? "That's it. " : "Not quite. "));
    fb.appendChild(document.createTextNode(c.why));
    if (c.correct) fb.appendChild(el("p", "takeaway", p.takeaway));
    else if (!quiet) fb.appendChild(el("p", "takeaway", "Look at the examples again and try another."));
  }

  $("quiz").addEventListener("submit", function (e) {
    e.preventDefault();
    var record = progress[current] || { tries: 0, solved: false };
    if (record.solved) return;
    var sel = $("quiz").querySelector("input:checked");
    var fb = $("feedback");
    if (!sel) {
      fb.className = "bad";
      fb.textContent = "Pick an answer first.";
      return;
    }
    var idx = Number(sel.value);
    var p = puzzles[current];
    var correct = !!p.choices[idx].correct;
    progress[current] = { tries: record.tries + 1, solved: correct, last: idx };
    save(progress);
    showFeedback(p, idx, false);
    if (correct) lockQuiz();
    renderHistory();
  });

  $("prev").addEventListener("click", function () { if (current > 0) { current--; render(); } });
  $("next").addEventListener("click", function () { if (current < latest) { current++; render(); } });

  $("share").addEventListener("click", function () {
    var d = progress[current];
    var num = current + 1;
    var text = "Rosetta #" + num + (d && d.solved ? " ✅ solved in " + d.tries + (d.tries === 1 ? " try" : " tries") : " 🔍 still figuring it out");
    var note = $("share-note");
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { note.textContent = "Copied. No spoilers."; },
        function () { note.textContent = text; });
    } else {
      note.textContent = text;
    }
  });

  if (puzzles.length) render();
})();
