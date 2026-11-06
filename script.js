(function () {
  "use strict";

  var puzzles = window.PUZZLES || [];
  var languages = window.LANGUAGES || {};
  var EPOCH = Date.UTC(2026, 10, 4); // day #1 = 2026-11-04
  var DAY_MS = 86400000;
  var STORE = "rosetta-progress-v1";
  var ORDINALS = ["first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth", "ninth", "tenth"];

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

  // The player's next local midnight, when tomorrow's puzzle unlocks.
  function nextMidnight() {
    var now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime();
  }

  var today = daysSinceEpoch();
  var unlockAt = nextMidnight();
  // Newest puzzle the player may open. Later entries stay locked until their day arrives.
  var latest = Math.max(0, Math.min(today, puzzles.length - 1));
  var outOfPuzzles = today > puzzles.length - 1;
  var progress = load();
  var current = latest;
  var countdownTimer;

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  // Marks text as the puzzle's language so screen readers and hyphenation treat it correctly.
  function inPuzzleLanguage(node, p) {
    if (languages[p.language]) node.lang = languages[p.language];
    return node;
  }

  // Puzzle text is authored with straight quotes; set them as typographic quotes and apostrophes.
  function typeset(text) {
    return text.replace(/"([^"]*)"/g, "“$1”").replace(/'/g, "’");
  }

  function dateLabel(index) {
    return new Date(EPOCH + index * DAY_MS).toLocaleDateString(undefined, {
      weekday: "long", month: "long", day: "numeric", year: "numeric", timeZone: "UTC"
    });
  }

  function solvedSentence(tries) {
    return ORDINALS[tries - 1] ? "Solved on the " + ORDINALS[tries - 1] + " try." : "Solved in " + tries + " tries.";
  }

  function plural(n, word) { return n + " " + word + (n === 1 ? "" : "s"); }

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

  // Solved puzzles in a row, counting back from the newest. An unsolved newest puzzle
  // doesn't break the run yet, since the player may still be working on it.
  function solvedInARow() {
    var i = progress[latest] && progress[latest].solved ? latest : latest - 1;
    var run = 0;
    for (; i >= 0 && progress[i] && progress[i].solved; i--) run++;
    return run;
  }

  function renderHistory() {
    var solved = 0;
    for (var i = 0; i <= latest; i++) {
      if (progress[i] && progress[i].solved) solved++;
    }
    var run = solvedInARow();
    var text = "Solved " + solved + " of " + (latest + 1) + (run > 1 ? " · " + run + " in a row" : "");
    if (outOfPuzzles) text += ". You’ve played every puzzle so far, and new ones are on the way.";
    $("history").textContent = text;
  }

  function renderStudy(p) {
    var box = $("study");
    box.textContent = "";
    if (p.type === "decipher") {
      $("study-heading").textContent = "Examples";
      var examples = el("ol", "examples");
      p.examples.forEach(function (row) {
        var item = el("li");
        item.appendChild(inPuzzleLanguage(el("span", "phrase", row[0]), p));
        item.appendChild(el("span", "gloss", typeset(row[1])));
        examples.appendChild(item);
      });
      box.appendChild(examples);
    } else {
      $("study-heading").textContent = "Conversation";
      var dialogue = el("ol", "dialogue");
      p.conversation.forEach(function (line, i) {
        var item = el("li");
        item.appendChild(el("span", "speaker sc", i % 2 ? "B" : "A"));
        item.appendChild(inPuzzleLanguage(el("span", "line", line), p));
        dialogue.appendChild(item);
      });
      box.appendChild(dialogue);
    }
  }

  function renderQuiz(p) {
    var form = $("quiz");
    form.textContent = "";
    var fs = el("fieldset");
    fs.appendChild(el("legend", null, typeset(p.question)));
    var list = el("div", "choices");
    p.choices.forEach(function (c, i) {
      var label = el("label", "choice");
      var input = el("input", "sr-only");
      input.type = "radio";
      input.name = "answer";
      input.value = i;
      label.appendChild(input);
      label.appendChild(el("span", "key", String.fromCharCode(97 + i)));
      var text = el("span", "text", p.type === "decipher" ? c.text : typeset(c.text));
      // Decipher answers are phrases in the puzzle's language; interpret answers are English.
      label.appendChild(p.type === "decipher" ? inPuzzleLanguage(text, p) : text);
      var mark = el("span", "mark");
      mark.setAttribute("aria-hidden", "true");
      label.appendChild(mark);
      list.appendChild(label);
    });
    fs.appendChild(list);
    form.appendChild(fs);
    var btn = el("button", "check sc", "Check answer");
    btn.type = "submit";
    form.appendChild(btn);
  }

  function setFeedback(kind, parts, animate) {
    clearInterval(countdownTimer);
    var fb = $("feedback");
    fb.textContent = "";
    if (!kind) return;
    var box = el("div", "feedback " + kind + (animate ? " enter" : ""));
    parts.forEach(function (part) { box.appendChild(part); });
    fb.appendChild(box);
  }

  // Counts down to the next unlock. Only shown under today's puzzle when a puzzle exists for tomorrow.
  function countdown() {
    var line = el("p", "next-puzzle");
    function tick() {
      var mins = Math.ceil((unlockAt - Date.now()) / 60000);
      if (mins > 0) {
        var hours = Math.floor(mins / 60);
        line.textContent = "Next puzzle in " + (hours ? plural(hours, "hour") + ", " : "") + plural(mins % 60, "minute") + ".";
        return;
      }
      clearInterval(countdownTimer);
      line.textContent = "";
      var reload = el("button", "link-btn", "Tomorrow’s puzzle is ready.");
      reload.type = "button";
      reload.addEventListener("click", function () { location.reload(); });
      line.appendChild(reload);
    }
    tick();
    countdownTimer = setInterval(tick, 30000);
    return line;
  }

  function resultBlock(record) {
    var result = el("div", "result");
    result.appendChild(el("span", null, solvedSentence(record.tries)));
    var share = el("button", "link-btn share sc", "Copy result");
    share.type = "button";
    share.addEventListener("click", shareResult);
    result.appendChild(share);
    if (current === today && today + 1 < puzzles.length) result.appendChild(countdown());
    return result;
  }

  function showFeedback(p, idx, record, fresh) {
    var c = p.choices[idx];
    var parts = [el("p", "verdict", c.correct ? "Correct." : "Not quite."), el("p", null, typeset(c.why))];
    if (c.correct) {
      var note = el("p", "note");
      note.appendChild(el("span", "sc", "Remember"));
      note.appendChild(el("em", null, typeset(p.takeaway)));
      parts.push(note);
      parts.push(resultBlock(record));
    } else if (fresh) {
      parts.push(el("p", null, (p.type === "decipher" ? "Look at the examples" : "Read the conversation") + " again and try another."));
    }
    setFeedback(c.correct ? "good" : "bad", parts, fresh);
  }

  // Marks tried choices and, once solved, locks the puzzle with its answer shown.
  // `fresh` is true right after a guess, which animates the note and adds a nudge to retry.
  function applyRecord(p, record, fresh) {
    var labels = $("quiz").querySelectorAll(".choice");
    wrongGuesses(record).forEach(function (i) {
      var label = labels[i];
      if (label.classList.contains("is-wrong")) return; // marked by an earlier guess
      label.classList.add("is-wrong");
      label.querySelector("input").disabled = true;
      label.appendChild(el("span", "sr-only", " (wrong)"));
    });
    var checked = $("quiz").querySelector("input:checked");
    if (checked && checked.disabled) checked.checked = false;

    if (record.solved) {
      var right = labels[correctIndex(p)];
      right.classList.add("is-correct");
      right.querySelector("input").checked = true;
      right.querySelector(".mark").textContent = "✓";
      right.appendChild(el("span", "sr-only", " (correct)"));
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
    $("date").textContent = dateLabel(current);
    $("language").textContent = p.language + ", " + p.level.toLowerCase();
    $("to-latest").hidden = current === latest;
    $("puzzle-title").textContent = typeset(p.title);
    $("intro").textContent = typeset(p.intro);
    $("prev").disabled = current === 0;
    $("next").disabled = current === latest;

    renderStudy(p);
    renderQuiz(p);
    setFeedback(null);
    if (progress[current]) applyRecord(p, progress[current], false);
    renderHistory();
  }

  function goTo(index) {
    current = index;
    render();
  }

  $("quiz").addEventListener("submit", function (e) {
    e.preventDefault();
    var record = progress[current] || { tries: 0, solved: false, wrong: [] };
    if (record.solved) return;
    var sel = $("quiz").querySelector("input:checked");
    if (!sel) {
      setFeedback("hint", [el("p", "verdict", "Pick an answer first.")], true);
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
    // The control that had focus is now disabled or hidden, so hand focus to the next useful one.
    if (correct) $("feedback").querySelector(".share").focus();
    else $("quiz").querySelector("input:not(:disabled)").focus({ preventScroll: true });
  });

  // Letter keys pick the matching choice, so the whole puzzle can be played from the keyboard.
  document.addEventListener("keydown", function (e) {
    if (e.ctrlKey || e.metaKey || e.altKey || e.key.length !== 1) return;
    var i = e.key.toLowerCase().charCodeAt(0) - 97;
    var inputs = $("quiz").querySelectorAll("input[name=answer]");
    // :disabled also covers the locked fieldset of a solved puzzle, which the property alone misses.
    if (i < 0 || i >= inputs.length || inputs[i].matches(":disabled")) return;
    inputs[i].checked = true;
    inputs[i].focus();
  });

  $("prev").addEventListener("click", function () { if (current > 0) goTo(current - 1); });
  $("next").addEventListener("click", function () { if (current < latest) goTo(current + 1); });
  $("to-latest").addEventListener("click", function () { goTo(latest); });

  function shareResult(e) {
    var button = e.currentTarget;
    var p = puzzles[current];
    var record = progress[current];
    var marks = new Array(record.tries).join("✗ ") + "✓";
    var text = "Rosetta No. " + (current + 1) + " (" + p.language + ")\n" +
      solvedSentence(record.tries) + " " + marks + "\n" + location.origin + location.pathname;
    function report(label, status) {
      button.textContent = label;
      $("status").textContent = status;
      setTimeout(function () { button.textContent = "Copy result"; }, 2000);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { report("Copied", "Result copied to the clipboard."); },
        function () { report("Couldn’t copy", "Couldn’t copy the result."); });
    } else {
      report("Couldn’t copy", "This browser can’t copy to the clipboard.");
    }
  }

  if (puzzles.length) render();
})();
