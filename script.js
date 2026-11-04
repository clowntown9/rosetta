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

  function todayIndex() {
    var now = new Date();
    var utc = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
    var days = Math.floor((utc - EPOCH) / 86400000);
    return Math.max(0, Math.min(days, puzzles.length - 1));
  }

  var progress = load();
  var current = todayIndex();

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function render() {
    var p = puzzles[current];
    var num = ("000000" + (current + 1)).slice(-6);
    $("day").textContent = "day #" + num + " · " + p.language + " · " + p.level;
    $("puzzle-title").textContent = p.title;
    $("prev").disabled = current === 0;
    $("next").disabled = current === puzzles.length - 1;

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
      showFeedback(p, done.last, true);
      var radio = form.querySelector('input[value="' + done.last + '"]');
      if (radio) radio.checked = true;
    }
    $("history").textContent = Object.keys(progress).filter(function (k) {
      return progress[k].solved;
    }).length + " of " + puzzles.length + " solved";
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
    var sel = $("quiz").querySelector("input:checked");
    var fb = $("feedback");
    if (!sel) {
      fb.className = "bad";
      fb.textContent = "Pick an answer first.";
      return;
    }
    var idx = Number(sel.value);
    var p = puzzles[current];
    var prev = progress[current] || { tries: 0, solved: false };
    progress[current] = {
      tries: prev.tries + 1,
      solved: prev.solved || !!p.choices[idx].correct,
      last: idx
    };
    save(progress);
    showFeedback(p, idx, false);
    $("history").textContent = Object.keys(progress).filter(function (k) {
      return progress[k].solved;
    }).length + " of " + puzzles.length + " solved";
  });

  $("prev").addEventListener("click", function () { if (current > 0) { current--; render(); } });
  $("next").addEventListener("click", function () { if (current < puzzles.length - 1) { current++; render(); } });

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
