(function () {
  "use strict";

  var puzzles = window.PUZZLES || [];
  var EPOCH = Date.UTC(2026, 10, 4); // day #1 = 2026-11-04
  var DAY_MS = 86400000;
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
    return Math.floor((utc - EPOCH) / DAY_MS);
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

  function dateLabel(index) {
    return new Date(EPOCH + index * DAY_MS).toLocaleDateString(undefined, {
      weekday: "short", month: "short", day: "numeric", timeZone: "UTC"
    });
  }

  function correctIndex(p) {
    for (var i = 0; i < p.choices.length; i++) {
      if (p.choices[i].correct) return i;
    }
    throw new Error("Puzzle \"" + p.title + "\" has no correct choice");
  }

  // Progress record per puzzle: { tries, solved, last, wrong }. Saves from before `wrong`
  // existed only kept the last guess, which is wrong by definition while unsolved.
  function wrongGuesses(record) {
    if (record.wrong) return record.wrong;
    return record.solved ? [] : [record.last];
  }

  // One square per try: red for each miss, green for the solve.
  function trySquares(record) {
    var misses = record.solved ? record.tries - 1 : record.tries;
    return new Array(misses + 1).join("🟥") + (record.solved ? "🟩" : "");
  }

  function renderHistory() {
    var solved = 0;
    for (var i = 0; i <= latest; i++) {
      if (progress[i] && progress[i].solved) solved++;
    }
    var released = latest + 1;
    var text = "Solved " + solved + " of " + released;
    if (outOfPuzzles) text += ". You've played every puzzle so far, and new ones are on the way.";
    $("history").textContent = text;
    $("history-fill").style.width = (solved / released * 100) + "%";
  }

  function renderStudy(p) {
    var box = $("study");
    box.textContent = "";
    if (p.type === "decipher") {
      var table = el("table", "phrases");
      var head = el("tr");
      head.appendChild(el("th", null, "Phrase"));
      head.appendChild(el("th", null, "Translation"));
      table.appendChild(head);
      p.examples.forEach(function (row) {
        var tr = el("tr");
        tr.appendChild(el("td", null, row[0]));
        tr.appendChild(el("td", null, row[1]));
        table.appendChild(tr);
      });
      box.appendChild(table);
    } else {
      var convo = el("div", "convo");
      p.conversation.forEach(function (line, i) {
        convo.appendChild(el("p", "bubble " + (i % 2 ? "them" : "me"), line));
      });
      box.appendChild(convo);
    }
  }

  function renderQuiz(p) {
    var form = $("quiz");
    form.textContent = "";
    var fs = el("fieldset");
    fs.appendChild(el("legend", null, p.question));
    var list = el("div", "choices");
    p.choices.forEach(function (c, i) {
      var label = el("label", "choice");
      var input = el("input", "sr-only");
      input.type = "radio";
      input.name = "answer";
      input.value = i;
      label.appendChild(input);
      label.appendChild(el("span", "key", String.fromCharCode(65 + i)));
      label.appendChild(el("span", "text", c.text));
      var mark = el("span", "mark");
      mark.setAttribute("aria-hidden", "true");
      label.appendChild(mark);
      list.appendChild(label);
    });
    fs.appendChild(list);
    form.appendChild(fs);
    var btn = el("button", "btn btn-primary check", "Check answer");
    btn.type = "submit";
    form.appendChild(btn);
  }

  function setFeedback(kind, icon, children, animate) {
    var fb = $("feedback");
    fb.textContent = "";
    var box = el("div", "feedback " + kind + (animate ? " enter" : ""));
    var badge = el("span", "fb-icon", icon);
    badge.setAttribute("aria-hidden", "true");
    box.appendChild(badge);
    var body = el("div");
    children.forEach(function (c) { body.appendChild(c); });
    box.appendChild(body);
    fb.appendChild(box);
  }

  function showFeedback(p, idx, record, fresh) {
    var c = p.choices[idx];
    var parts = [el("strong", null, c.correct ? "That's it." : "Not quite."), document.createTextNode(c.why)];
    if (c.correct) {
      parts.push(el("p", "takeaway", p.takeaway));
      var result = el("div", "result");
      var dots = el("span", "dots");
      dots.setAttribute("aria-hidden", "true");
      for (var i = 0; i < record.tries; i++) dots.appendChild(el("span", i === record.tries - 1 ? "dot hit" : "dot"));
      result.appendChild(dots);
      result.appendChild(el("span", null, "Solved in " + record.tries + (record.tries === 1 ? " try" : " tries")));
      parts.push(result);
    } else if (fresh) {
      parts.push(el("p", "takeaway", "Look at the examples again and try another."));
    }
    setFeedback(c.correct ? "good" : "bad", c.correct ? "✓" : "✕", parts, fresh);
  }

  // Marks tried choices and, once solved, locks the puzzle with its answer shown.
  // `fresh` is true right after a guess, which animates the change and adds a nudge to retry.
  function applyRecord(p, record, fresh) {
    var labels = $("quiz").querySelectorAll(".choice");
    wrongGuesses(record).forEach(function (i) {
      var label = labels[i];
      if (label.classList.contains("is-wrong")) return; // marked by an earlier guess
      label.classList.add("is-wrong");
      label.querySelector("input").disabled = true;
      label.querySelector(".mark").textContent = "✕";
      label.appendChild(el("span", "sr-only", " (wrong)"));
      if (fresh && i === record.last) label.classList.add("just-wrong");
    });
    var checked = $("quiz").querySelector("input:checked");
    if (checked && checked.disabled) checked.checked = false;

    if (record.solved) {
      var right = labels[correctIndex(p)];
      right.classList.add("is-correct");
      right.querySelector("input").checked = true;
      right.querySelector(".mark").textContent = "✓";
      right.appendChild(el("span", "sr-only", " (correct)"));
      if (fresh) right.classList.add("just-correct");
      $("quiz").querySelector("fieldset").disabled = true;
      $("quiz").querySelector(".check").hidden = true;
      showFeedback(p, correctIndex(p), record, fresh);
    } else {
      showFeedback(p, record.last, record, fresh);
    }
  }

  function render() {
    var p = puzzles[current];
    $("day").textContent = "No. " + (current + 1);
    $("date").textContent = current === today ? "Today · " + dateLabel(current) : dateLabel(current);
    $("language").textContent = p.language;
    $("level").textContent = p.level;
    $("puzzle-title").textContent = p.title;
    $("intro").textContent = p.intro;
    $("prev").disabled = current === 0;
    $("next").disabled = current === latest;

    renderStudy(p);
    renderQuiz(p);
    $("feedback").textContent = "";
    if (progress[current]) applyRecord(p, progress[current], false);
    renderHistory();
  }

  $("quiz").addEventListener("submit", function (e) {
    e.preventDefault();
    var record = progress[current] || { tries: 0, solved: false, wrong: [] };
    if (record.solved) return;
    var sel = $("quiz").querySelector("input:checked");
    if (!sel) {
      setFeedback("hint", "?", [document.createTextNode("Pick an answer first.")], true);
      return;
    }
    var idx = Number(sel.value);
    var p = puzzles[current];
    var correct = !!p.choices[idx].correct;
    var wrong = wrongGuesses(record).slice();
    if (!correct) wrong.push(idx);
    progress[current] = { tries: record.tries + 1, solved: correct, last: idx, wrong: wrong };
    save(progress);
    applyRecord(p, progress[current], true);
    renderHistory();
  });

  // Letter keys pick the matching choice, so the whole puzzle can be played from the keyboard.
  document.addEventListener("keydown", function (e) {
    if (e.ctrlKey || e.metaKey || e.altKey || e.key.length !== 1) return;
    var i = e.key.toUpperCase().charCodeAt(0) - 65;
    var inputs = $("quiz").querySelectorAll("input[name=answer]");
    // :disabled also covers the locked fieldset of a solved puzzle, which the property alone misses.
    if (i < 0 || i >= inputs.length || inputs[i].matches(":disabled")) return;
    inputs[i].checked = true;
    inputs[i].focus();
  });

  $("prev").addEventListener("click", function () { if (current > 0) { current--; render(); } });
  $("next").addEventListener("click", function () { if (current < latest) { current++; render(); } });

  var toastTimer;
  function toast(message) {
    var t = $("toast");
    t.textContent = message;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove("show"); }, 2200);
  }

  $("share").addEventListener("click", function () {
    var p = puzzles[current];
    var record = progress[current];
    var line = !record ? "🔍 not started yet"
      : record.solved ? trySquares(record) + " solved in " + record.tries + (record.tries === 1 ? " try" : " tries")
      : trySquares(record) + " still figuring it out";
    var text = "Rosetta No. " + (current + 1) + " · " + p.language + "\n" + line + "\n" + location.origin + location.pathname;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { toast("Result copied. No spoilers."); },
        function () { toast("Couldn't copy. Try again."); });
    } else {
      toast("Copying isn't supported in this browser.");
    }
  });

  if (puzzles.length) render();
})();
