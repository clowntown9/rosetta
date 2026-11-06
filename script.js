(function () {
  "use strict";

  var puzzles = window.PUZZLES || [];
  var languages = window.LANGUAGES || {};
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

  function dateLabel(index) {
    return new Date(EPOCH + index * DAY_MS).toLocaleDateString(undefined, {
      weekday: "short", month: "short", day: "numeric", timeZone: "UTC"
    });
  }

  function triesLabel(n) { return n + (n === 1 ? " try" : " tries"); }

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
    var released = latest + 1;
    var run = solvedInARow();
    var text = "Solved " + solved + " of " + released + (run > 1 ? " · " + run + " in a row" : "");
    if (outOfPuzzles) text += ". You've played every puzzle so far, and new ones are on the way.";
    $("history").textContent = text;
    $("history-fill").style.width = (solved / released * 100) + "%";
  }

  function renderStudy(p) {
    var box = $("study");
    box.textContent = "";
    if (p.type === "decipher") {
      var list = el("ul", "phrases");
      p.examples.forEach(function (row) {
        var item = el("li");
        item.appendChild(inPuzzleLanguage(el("span", "phrase", row[0]), p));
        item.appendChild(el("span", "gloss", row[1]));
        list.appendChild(item);
      });
      box.appendChild(list);
    } else {
      var convo = el("div", "convo");
      p.conversation.forEach(function (line, i) {
        convo.appendChild(inPuzzleLanguage(el("p", "bubble " + (i % 2 ? "them" : "me"), line), p));
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
      var text = el("span", "text", c.text);
      // Decipher answers are phrases in the puzzle's language; interpret answers are English.
      label.appendChild(p.type === "decipher" ? inPuzzleLanguage(text, p) : text);
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
    clearInterval(countdownTimer);
    var fb = $("feedback");
    fb.textContent = "";
    if (!kind) return;
    var box = el("div", "feedback " + kind + (animate ? " enter" : ""));
    var badge = el("span", "fb-icon", icon);
    badge.setAttribute("aria-hidden", "true");
    box.appendChild(badge);
    var body = el("div");
    children.forEach(function (c) { body.appendChild(c); });
    box.appendChild(body);
    fb.appendChild(box);
  }

  function resultBlock(record) {
    var result = el("div", "result");
    var dots = el("span", "dots");
    dots.setAttribute("aria-hidden", "true");
    for (var i = 0; i < record.tries; i++) dots.appendChild(el("span", i === record.tries - 1 ? "dot hit" : "dot"));
    result.appendChild(dots);
    result.appendChild(el("span", null, "Solved in " + triesLabel(record.tries)));
    var share = el("button", "btn btn-ghost btn-small share", "Share");
    share.type = "button";
    share.addEventListener("click", shareResult);
    result.appendChild(share);
    return result;
  }

  // Counts down to the next unlock. Only shown under today's puzzle when a puzzle exists for tomorrow.
  function countdown() {
    var line = el("p", "next-puzzle");
    function tick() {
      var mins = Math.ceil((unlockAt - Date.now()) / 60000);
      if (mins > 0) {
        line.textContent = "Next puzzle in " + (mins >= 60 ? Math.floor(mins / 60) + "h " : "") + (mins % 60) + "m";
        return;
      }
      clearInterval(countdownTimer);
      line.textContent = "";
      var reload = el("button", "link-btn", "Tomorrow's puzzle is ready. Play it");
      reload.type = "button";
      reload.addEventListener("click", function () { location.reload(); });
      line.appendChild(reload);
    }
    tick();
    countdownTimer = setInterval(tick, 30000);
    return line;
  }

  function showFeedback(p, idx, record, fresh) {
    var c = p.choices[idx];
    var parts = [el("strong", null, c.correct ? "That's it." : "Not quite."), document.createTextNode(c.why)];
    if (c.correct) {
      parts.push(el("p", "takeaway", p.takeaway));
      parts.push(resultBlock(record));
    } else if (fresh) {
      parts.push(el("p", "takeaway", "Look at the examples again and try another."));
    }
    setFeedback(c.correct ? "good" : "bad", c.correct ? "✓" : "✕", parts, fresh);
    if (c.correct && current === today && today + 1 < puzzles.length) {
      $("feedback").querySelector(".feedback > div").appendChild(countdown());
    }
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
    $("to-latest").hidden = current === latest;
    $("language").textContent = p.language;
    $("level").textContent = p.level;
    $("puzzle-title").textContent = p.title;
    $("intro").textContent = p.intro;
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
    // The control that had focus is now disabled or hidden, so hand focus to the next useful one.
    if (correct) $("feedback").querySelector(".share").focus();
    else $("quiz").querySelector("input:not(:disabled)").focus({ preventScroll: true });
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

  $("prev").addEventListener("click", function () { if (current > 0) goTo(current - 1); });
  $("next").addEventListener("click", function () { if (current < latest) goTo(current + 1); });
  $("to-latest").addEventListener("click", function () { goTo(latest); });

  var toastTimer;
  function toast(message) {
    var t = $("toast");
    t.textContent = message;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove("show"); }, 2200);
  }

  function shareResult() {
    var p = puzzles[current];
    var record = progress[current];
    var squares = new Array(record.tries).join("🟥") + "🟩";
    var text = "Rosetta No. " + (current + 1) + " · " + p.language + "\n" +
      squares + " solved in " + triesLabel(record.tries) + "\n" + location.origin + location.pathname;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { toast("Result copied. No spoilers."); },
        function () { toast("Couldn't copy. Try again."); });
    } else {
      toast("Copying isn't supported in this browser.");
    }
  }

  if (puzzles.length) render();
})();
