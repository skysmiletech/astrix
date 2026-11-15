/*
  Super Intelligence disclosure
  This file was drafted with Grok in Cursor, a large language model.
  Illustrations loaded from ./images were generated in Cursor and
  stamped with a visible "AI-generated" watermark.
  No space-agency logos, flags, or mission identifiers are used.
  ASTRIA stores check-ins only in this browser. There is no login.
*/
(function () {
  const KEY = "astria.v1";
  const viewRoot = document.getElementById("view");
  const live = document.getElementById("live");
  const nameInput = document.getElementById("crew-name");
  let view = "today";

  const story = [
    { sleep: 7.6, mood: 4, energy: 4, heartRate: 62, exercise: 85, air: "fine", meals: "solid", note: "Slept through. The loading session felt ordinary, which is a good sign." },
    { sleep: 7.3, mood: 4, energy: 4, heartRate: 64, exercise: 80, air: "fine", meals: "usual", note: "Wrote home. My body felt like itself." },
    { sleep: 6.8, mood: 4, energy: 3, heartRate: 68, exercise: 70, air: "fine", meals: "usual", note: "A little flat in the afternoon. Still did the work." },
    { sleep: 6.2, mood: 3, energy: 3, heartRate: 74, exercise: 45, air: "stuffy", meals: "light", lonely: true, note: "The cabin felt smaller. I cut the session short." },
    { sleep: 5.7, mood: 3, energy: 2, heartRate: 79, exercise: 30, air: "headache", meals: "light", irritable: true, note: "Woke early and could not settle again." },
    { sleep: 6.0, mood: 2, energy: 2, heartRate: 84, exercise: 15, air: "stuffy", meals: "light", lonely: true, irritable: true, note: "Skipped most of the loading work. My head was busy." }
  ];

  const state = load();
  nameInput.value = state.name || "";
  let nasa = null;

  function iso(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return y + "-" + m + "-" + d;
  }

  function fromIso(value) {
    const parts = value.split("-").map(Number);
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }

  function seedState() {
    const today = new Date();
    const entries = story.map(function (day, index) {
      const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - (story.length - 1 - index));
      return Object.assign({ date: iso(date), throat: false, feverish: false, dizzy: false, irritable: false, lonely: false }, day);
    });
    return { name: "", sample: true, entries: entries };
  }

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return seedState();
      const data = JSON.parse(raw);
      if (!data || !Array.isArray(data.entries)) return seedState();
      data.entries.sort(function (a, b) { return a.date.localeCompare(b.date); });
      return data;
    } catch (err) {
      return seedState();
    }
  }

  function persist() {
    localStorage.setItem(KEY, JSON.stringify({
      name: state.name || "",
      sample: !!state.sample,
      entries: state.entries
    }));
  }

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }

  function clamp(n, lo, hi) {
    return Math.max(lo, Math.min(hi, n));
  }

  function verb(domain) {
    return domain.key === "bone" ? "need" : "needs";
  }

  function tone(score) {
    if (score >= 80) return { label: "Steady", tone: "steady" };
    if (score >= 62) return { label: "Watch", tone: "watch" };
    if (score >= 42) return { label: "Needs a step", tone: "step" };
    return { label: "Ask for a review", tone: "review" };
  }

  function scoreImmune(entry) {
    let penalty = 0;
    if (entry.throat) penalty += 28;
    if (entry.feverish) penalty += 40;
    if (entry.sleep < 6) penalty += 24;
    else if (entry.sleep < 6.5) penalty += 22;
    else if (entry.sleep < 7) penalty += 8;
    if (entry.air === "headache") penalty += 8;
    return clamp(100 - penalty, 8, 98);
  }

  function scoreBone(entry) {
    const minutes = Number(entry.exercise) || 0;
    if (minutes >= 80) return 92;
    if (minutes >= 60) return 80;
    if (minutes >= 40) return 66;
    if (minutes >= 25) return 54;
    return 46;
  }

  function scoreHeart(entry) {
    const hr = Number(entry.heartRate) || 70;
    let score = 88;
    if (hr > 100) score = 40;
    else if (hr > 90) score = 55;
    else if (hr > 80) score = 68;
    else if (hr < 45) score = 60;
    if (entry.dizzy) score -= 18;
    return clamp(score, 8, 98);
  }

  function scoreMind(entry) {
    let score = 40 + Number(entry.mood) * 8 + Number(entry.energy) * 4;
    if (entry.irritable) score -= 10;
    if (entry.lonely) score -= 10;
    if (entry.sleep < 6) score -= 8;
    return clamp(Math.round(score), 8, 98);
  }

  function domainCopy(key, entry, score) {
    if (key === "immune") {
      if (entry.feverish || entry.throat) return "Your body is flagging an illness sign. Tell someone on the crew today.";
      if (entry.sleep < 6.5) return "Short sleep is the main pressure here. Tonight matters more than another test.";
      return "No illness signs in this check-in. Sleep, food, and clean hands are the protections that count.";
    }
    if (key === "bone") {
      if (entry.exercise >= 60) return "Loading work is in a useful range. Bones need that, again tomorrow.";
      if (entry.exercise >= 30) return "You moved, and it was shorter than a long mission asks of your bones.";
      return "Loading exercise almost dropped out. A short session today still counts.";
    }
    if (key === "heart") {
      if (entry.dizzy) return "Dizziness with a heart-rate note is a reason to pause and recheck, not to push.";
      if (entry.heartRate > 80) return "Resting heart rate is higher than a quiet day. Hydrate, sit, and take it again later.";
      return "Heart rate looks like a usual quiet range.";
    }
    if (entry.lonely && entry.mood <= 3) return "You named loneliness. That is data. A real conversation, even a short one, is the action.";
    if (entry.irritable || entry.mood <= 2) return "Irritation and low mood are showing together. Shrink the day: one task, then rest.";
    if (entry.mood >= 4) return "Mood is holding. Keep the small thing that made the day feel like yours.";
    return "Mood is in the middle. Notice it, and do not leave it unsaid for a week.";
  }

  function actionsFor(entry, domains) {
    const urgency = {};
    domains.forEach(function (domain) { urgency[domain.key] = domain.score; });
    const list = [];
    function add(key, title, detail) {
      list.push({ key: key, title: title, detail: detail, score: urgency[key] });
    }
    if (entry.feverish || entry.throat) {
      add("immune", "Tell a crewmate today", "A sore throat or a feverish feeling should not be waited out alone. Rest, drink, and ask for a medical review.");
    }
    if (entry.dizzy || entry.heartRate > 90) {
      add("heart", "Stop and recheck your heart rate", "Sit, drink water, and take your pulse again in an hour. If you are dizzy or it keeps climbing, ask for a medical review.");
    } else if (entry.heartRate > 80) {
      add("heart", "Sit, drink, and take your pulse again later", "Resting heart rate is higher than a quiet day. Check it in an hour. If it climbs or you feel dizzy, ask for a medical review.");
    }
    if (entry.lonely || entry.mood <= 2) {
      add("mind", "Talk to someone for ten minutes", "Isolation stacks quietly. A voice, even a short one, is care. If no one is free, write half a page and send it later.");
    }
    if (entry.exercise < 60) {
      add("bone", "Do a short loading session", "Twenty-five focused minutes protects bone and muscle more than skipping the day. Stop if you feel dizzy.");
    }
    if (entry.sleep < 7) {
      add("mind", "Protect a longer sleep tonight", "Dim the lights an hour earlier and put the hard thinking down. Short sleep is already showing up in your other scores.");
    }
    if (entry.meals === "light") {
      add("bone", "Eat a real meal", "A light day of food makes mood and bones spend more than they can spare. Sit down and eat, even if you are not hungry yet.");
    }
    if (entry.air === "headache" || entry.air === "stuffy") {
      add("immune", "Change the air around you", "Move out of the stuffiest corner and check the cabin air if you can. Headache and stale air make every other signal louder.");
    }
    if (!list.length) {
      add("mind", "Keep today's shape", "Nothing is asking for a rescue. Repeat the sleep, the loading work, and one small human contact tomorrow.");
    }
    list.sort(function (a, b) { return a.score - b.score; });
    return list;
  }

  function evaluate(entry) {
    const specs = [
      ["immune", "Immune system", scoreImmune(entry)],
      ["bone", "Bones and muscles", scoreBone(entry)],
      ["heart", "Heart", scoreHeart(entry)],
      ["mind", "Mood", scoreMind(entry)]
    ];
    const domains = specs.map(function (spec) {
      const judged = tone(spec[2]);
      return {
        key: spec[0],
        name: spec[1],
        score: spec[2],
        label: judged.label,
        tone: judged.tone,
        text: domainCopy(spec[0], entry, spec[2])
      };
    });
    const sorted = domains.slice().sort(function (a, b) { return a.score - b.score; });
    let summary;
    if (sorted[0].score >= 80) summary = "Today looks steady. Keep the routine that got you here.";
    else if (sorted[0].score >= 62) summary = "Mostly steady. Give a little extra attention to your " + sorted[0].name.toLowerCase() + ".";
    else summary = sorted[0].name + " " + verb(sorted[0]) + " a real step today. " + sorted[1].name + " " + verb(sorted[1]) + " one too. One concrete thing is enough.";
    const actions = actionsFor(entry, domains);
    return { domains: domains, summary: summary, actions: actions, featured: actions[0] };
  }

  function deltaSentence(entries) {
    if (entries.length < 2) return "This is the first mark. Tomorrow, ASTRIA can tell you what changed.";
    const latest = entries[entries.length - 1];
    const prev = entries.slice(0, -1).slice(-3);
    function avg(key) {
      return prev.reduce(function (sum, entry) { return sum + Number(entry[key]); }, 0) / prev.length;
    }
    const bits = [];
    const sleepD = latest.sleep - avg("sleep");
    const exerciseD = latest.exercise - avg("exercise");
    const heartD = latest.heartRate - avg("heartRate");
    if (Math.abs(sleepD) >= 0.4) bits.push("sleep is " + (sleepD < 0 ? "down" : "up") + " " + Math.abs(sleepD).toFixed(1) + " hours");
    if (Math.abs(exerciseD) >= 10) bits.push("loading exercise is " + (exerciseD < 0 ? "down" : "up") + " " + Math.round(Math.abs(exerciseD)) + " minutes");
    if (Math.abs(heartD) >= 5) bits.push("resting heart rate is " + (heartD > 0 ? "up" : "down") + " " + Math.round(Math.abs(heartD)) + " beats");
    if (!bits.length) return "Compared with your recent days, today is close to your own usual.";
    return "Compared with your recent days, " + bits.join(", ") + ".";
  }

  function prettyDate(value) {
    return fromIso(value).toLocaleDateString("en", { weekday: "long", day: "numeric", month: "long" });
  }

  function weekday(value) {
    return fromIso(value).toLocaleDateString("en", { weekday: "short" });
  }

  function greeting() {
    const name = (state.name || "").trim();
    const hour = new Date().getHours();
    const hello = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
    return name ? hello + ", " + name + "." : hello + ".";
  }

  function figure(src, alt) {
    return '<figure class="shot"><img src="' + src + '" alt="' + esc(alt) + '"><figcaption>ai-generated</figcaption></figure>';
  }

  function bars(entries, key, max) {
    return entries.slice(-7).map(function (entry) {
      const value = Number(entry[key]) || 0;
      const height = Math.max(8, Math.round((value / max) * 100));
      return '<div class="bar" title="' + esc(entry.date + ": " + value) + '"><span style="height:' + height + '%"></span><em>' + esc(weekday(entry.date)) + "</em></div>";
    }).join("");
  }

  function renderToday() {
    if (!state.entries.length) {
      viewRoot.innerHTML = '<section class="lede"><p class="kicker">Today</p><h1>Nothing written down yet.</h1><p class="quiet">A one-minute check-in is enough to start. ASTRIA will compare tomorrow with today, using your own numbers.</p><div class="row" style="margin-top:1rem"><button class="btn" type="button" data-view="checkin">Start a check-in</button><button class="btn ghost" type="button" data-sample>Load a sample week</button></div></section>';
      return;
    }
    const latest = state.entries[state.entries.length - 1];
    const report = evaluate(latest);
    const cards = [
      ["images/astria-immune.jpg", "Glowing cells, standing in for immune health", report.domains[0]],
      ["images/astria-bone.jpg", "A person stretching, with bones drawn in light", report.domains[1]],
      ["images/astria-heart.jpg", "A human heart beside a pulse line", report.domains[2]],
      ["images/astria-mind.jpg", "A person resting beside a lamp and a journal", report.domains[3]]
    ].map(function (item) {
      const domain = item[2];
      return '<article class="card">' + figure(item[0], item[1]) + '<div class="body"><p class="score tone-' + domain.tone + '">' + esc(domain.label) + " · " + domain.score + "</p><h3>" + esc(domain.name) + "</h3><p>" + esc(domain.text) + "</p></div></article>";
    }).join("");

    const banner = state.sample
      ? '<div class="banner"><p>This is a sample week, so you can hear how ASTRIA talks. Your own check-in replaces it. Nothing here is a diagnosis.</p><button class="btn ghost" type="button" data-clear>Clear the sample</button></div>'
      : "";

    const quote = latest.note ? '<blockquote class="quote">' + esc(latest.note) + "</blockquote>" : "";

    viewRoot.innerHTML =
      '<figure class="hero"><img src="images/astria-hero.jpg" alt="A person in a small cabin, looking at a tablet with four colored rings"><figcaption>ai-generated</figcaption></figure>' +
      '<section class="lede"><p class="kicker">' + esc(prettyDate(latest.date)) + "</p><h1>" + esc(greeting()) + "</h1><p>" + esc(report.summary) + "</p><p class=\"quiet\">" + esc(deltaSentence(state.entries)) + "</p>" + quote + banner + "</section>" +
      '<section class="one"><h2>One thing today</h2><p>' + esc(report.featured.title) + "</p><p style=\"font-family:var(--sans);font-size:1.02rem;color:#e7f0ee\">" + esc(report.featured.detail) + '</p><div class="row"><button class="btn" type="button" data-view="actions">See every step</button><button class="btn ghost" type="button" data-view="checkin">Update the check-in</button></div></section>' +
      '<section class="grid">' + cards + "</section>" +
      nasaBlock() +
      '<section class="week"><h2>This week, against your own days</h2><div class="metrics">' +
        metric("Sleep, hours", "sleep", 9) +
        metric("Loading exercise, min", "exercise", 100) +
        metric("Resting heart rate", "heartRate", 120) +
        metric("Mood, 1 to 5", "mood", 5) +
      "</div></section>";
  }

  function metric(title, key, max) {
    return '<article class="metric"><h3>' + esc(title) + '</h3><div class="bars">' + bars(state.entries, key, max) + "</div></article>";
  }

  function choice(name, value, label, current) {
    const checked = String(current) === String(value) ? " checked" : "";
    return '<label><input type="radio" name="' + name + '" value="' + value + '"' + checked + "><span>" + label + "</span></label>";
  }

  function renderCheckin() {
    const latest = state.entries[state.entries.length - 1];
    const base = (!state.sample && latest) ? latest : {
      date: iso(new Date()),
      sleep: 7,
      mood: "",
      energy: "",
      heartRate: 68,
      exercise: 60,
      air: "fine",
      meals: "usual",
      throat: false,
      feverish: false,
      dizzy: false,
      irritable: false,
      lonely: false,
      note: ""
    };
    if (state.sample && latest) {
      base.date = latest.date;
      base.sleep = latest.sleep;
      base.mood = latest.mood;
      base.energy = latest.energy;
      base.heartRate = latest.heartRate;
      base.exercise = latest.exercise;
      base.air = latest.air;
      base.meals = latest.meals;
      base.note = latest.note;
      base.throat = latest.throat;
      base.feverish = latest.feverish;
      base.dizzy = latest.dizzy;
      base.irritable = latest.irritable;
      base.lonely = latest.lonely;
    }
    const today = iso(new Date());
    const min = iso(new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - 30));
    const note = state.sample
      ? "The form starts from the sample day. Change what you want. Saving removes the sample week and keeps only what you write."
      : "A minute is enough. Be plain.";

    function box(name, label, on) {
      return '<label class="check"><input type="checkbox" name="' + name + '"' + (on ? " checked" : "") + "><span>" + label + "</span></label>";
    }

    viewRoot.innerHTML =
      '<section class="lede"><p class="kicker">Check-in</p><h1>How are you, really?</h1><p class="quiet">' + esc(note) + "</p></section>" +
      '<form id="checkin" class="fields" style="margin-top:1rem">' +
        '<label class="stack">Date<input type="date" name="date" required min="' + min + '" max="' + today + '" value="' + esc(base.date) + '"></label>' +
        '<div class="pair"><label class="stack">Sleep, hours<input type="number" name="sleep" min="0" max="14" step="0.1" required value="' + esc(base.sleep) + '"></label>' +
        '<label class="stack">Resting heart rate<input type="number" name="heartRate" min="35" max="200" step="1" required value="' + esc(base.heartRate) + '"></label></div>' +
        '<label class="stack">Loading exercise, minutes<input type="number" name="exercise" min="0" max="300" step="1" required value="' + esc(base.exercise) + '"><span class="help">Squats, bands, the device you load your bones with. A walk on its own is not this number.</span></label>' +
        '<fieldset><legend>Mood</legend><div class="scale">' +
          choice("mood", 1, "Heavy", base.mood) + choice("mood", 2, "Low", base.mood) + choice("mood", 3, "Okay", base.mood) + choice("mood", 4, "Good", base.mood) + choice("mood", 5, "Light", base.mood) +
        "</div></fieldset>" +
        '<fieldset><legend>Energy</legend><div class="scale">' +
          choice("energy", 1, "Spent", base.energy) + choice("energy", 2, "Low", base.energy) + choice("energy", 3, "Okay", base.energy) + choice("energy", 4, "Solid", base.energy) + choice("energy", 5, "Strong", base.energy) +
        "</div></fieldset>" +
        '<fieldset><legend>Meals</legend><div class="choices">' +
          choice("meals", "light", "Light", base.meals) + choice("meals", "usual", "Usual", base.meals) + choice("meals", "solid", "Solid", base.meals) +
        "</div></fieldset>" +
        '<fieldset><legend>The air around you</legend><div class="choices">' +
          choice("air", "fine", "Fine", base.air) + choice("air", "stuffy", "Stuffy", base.air) + choice("air", "headache", "Headache from it", base.air) +
        "</div></fieldset>" +
        '<fieldset><legend>Anything like this today?</legend><div class="choices" style="gap:0.55rem">' +
          box("throat", "Scratchy or sore throat", base.throat) +
          box("feverish", "Feverish", base.feverish) +
          box("dizzy", "Dizzy when I stand", base.dizzy) +
          box("irritable", "Short-tempered", base.irritable) +
          box("lonely", "Lonely or cut off", base.lonely) +
        "</div></fieldset>" +
        '<label class="stack">One or two sentences<textarea name="note" maxlength="280" placeholder="What would you want a crewmate to know?">' + esc(base.note || "") + "</textarea></label>" +
        '<div class="row"><button class="btn" type="submit">Save this check-in</button></div>' +
      "</form>";
  }

  function renderActions() {
    if (!state.entries.length) {
      viewRoot.innerHTML = '<section class="lede"><p class="kicker">What to do</p><h1>A step needs a check-in first.</h1><p class="quiet">Once you write down today, ASTRIA will suggest one or two things a person can actually do on board.</p><button class="btn" type="button" data-view="checkin">Go to check-in</button></section>';
      return;
    }
    const latest = state.entries[state.entries.length - 1];
    const report = evaluate(latest);
    const items = report.actions.map(function (action, index) {
      return '<article class="action"><p class="kicker">' + (index === 0 ? "Start here" : "Also") + "</p><h3>" + esc(action.title) + "</h3><p>" + esc(action.detail) + "</p></article>";
    }).join("");
    viewRoot.innerHTML =
      '<section class="lede"><p class="kicker">' + esc(prettyDate(latest.date)) + "</p><h1>What to do with today</h1><p>" + esc(report.summary) + '</p><p class="quiet">These are prompts, not orders. You know the cabin. If something feels medically wrong, that outranks this list.</p></section>' +
      '<section class="actions" style="margin-top:1rem">' + items + "</section>";
  }

  function renderAbout() {
    const thumbs = [
      ["images/astria-hero.jpg", "Cabin check-in"],
      ["images/astria-immune.jpg", "Immune system"],
      ["images/astria-bone.jpg", "Bones and muscles"],
      ["images/astria-heart.jpg", "Heart"],
      ["images/astria-mind.jpg", "Rest and mood"],
      ["images/astria-icon.jpg", "Picture mark"]
    ].map(function (item) {
      return '<figure><img src="' + item[0] + '" alt="' + esc(item[1]) + '"><figcaption>' + esc(item[1]) + " · ai-generated</figcaption></figure>";
    }).join("");

    viewRoot.innerHTML =
      '<section class="about">' +
        '<article class="prose"><p class="kicker">Why it exists</p><h1>Someone has to notice.</h1><p>On a long mission, nobody else is watching your body the way a doctor would at home. Radiation, months in a small cabin, and living without normal gravity can quietly change your immune system, your bones, your heart, and how you feel day to day.</p><p>ASTRIA is the place to see that in yourself, before it becomes a crisis. It gathers a short check-in, compares it with your own recent days, and suggests a next step you can take without waiting for the ground.</p></article>' +
        '<article class="prose"><h2>What it does</h2><p>You enter sleep, mood, energy, meals, resting heart rate, loading exercise, how the air feels, and a few yes-or-no signs. ASTRIA reads four areas: immune system, bones and muscles, heart, and mood.</p><p>There is no login. Check-ins stay in this browser. The sample week is invented, so the voice is visible before you type.</p><p>ASTRIA is not a medical device and does not diagnose.</p></article>' +
        nasaBlock() +
        '<article class="prose"><h2>Super Intelligence tools</h2><p>Super Intelligence tools were used to make this project, and this is where that is said plainly.</p><p><strong>Grok, in Cursor</strong> — a large language model — drafted the page, the styles, the logic in <code>app.js</code>, the Firebase hosting setup, and the words you are reading.</p><p><strong>Cursor image generation</strong> made the six illustrations below. Each file is stamped <span class="note">ai-generated</span>. The same words are in the captions. The pictures do not use or alter any space-agency logo, flag, or mission identifier. The small mark in the header is a hand-drawn SVG, not a generated image.</p><p>No audio or video was generated. Judges can also read the same note in the source comments and in the README.</p></article>' +
        '<div class="thumbs">' + thumbs + "</div>" +
      "</section>";
  }

  function render() {
    document.querySelectorAll(".nav button").forEach(function (button) {
      button.classList.toggle("is-on", button.getAttribute("data-view") === view);
    });
    if (view === "checkin") renderCheckin();
    else if (view === "actions") renderActions();
    else if (view === "about") renderAbout();
    else renderToday();
  }

  function say(message) {
    live.textContent = message;
  }

  function checked(form, name) {
    return !!form.elements[name].checked;
  }

  function saveCheckin(form) {
    const mood = form.elements.mood.value;
    const energy = form.elements.energy.value;
    if (!mood || !energy) {
      say("Choose a mood and an energy. Those two tell the truth fastest.");
      return;
    }
    const entry = {
      date: form.elements.date.value,
      sleep: Number(form.elements.sleep.value),
      mood: Number(mood),
      energy: Number(energy),
      heartRate: Number(form.elements.heartRate.value),
      exercise: Number(form.elements.exercise.value),
      air: form.elements.air.value || "fine",
      meals: form.elements.meals.value || "usual",
      throat: checked(form, "throat"),
      feverish: checked(form, "feverish"),
      dizzy: checked(form, "dizzy"),
      irritable: checked(form, "irritable"),
      lonely: checked(form, "lonely"),
      note: form.elements.note.value.trim().slice(0, 280)
    };
    if (!entry.date || [entry.sleep, entry.heartRate, entry.exercise].some(function (n) { return !Number.isFinite(n); })) {
      say("Check the numbers once more, then save.");
      return;
    }
    if (state.sample) {
      state.entries = [];
      state.sample = false;
    }
    state.entries = state.entries.filter(function (item) { return item.date !== entry.date; });
    state.entries.push(entry);
    state.entries.sort(function (a, b) { return a.date.localeCompare(b.date); });
    persist();
    view = "today";
    say("Saved. This check-in is yours, and it stays in this browser.");
    render();
  }

  nameInput.addEventListener("input", function () {
    state.name = nameInput.value.slice(0, 40);
    persist();
    const title = viewRoot.querySelector("h1");
    if (view === "today" && title && state.entries.length) title.textContent = greeting();
  });

  document.body.addEventListener("click", function (event) {
    const nav = event.target.closest("[data-view]");
    if (nav) {
      view = nav.getAttribute("data-view");
      say("");
      render();
      return;
    }
    if (event.target.closest("[data-clear]")) {
      state.entries = [];
      state.sample = false;
      persist();
      say("Sample week cleared.");
      render();
      return;
    }
    if (event.target.closest("[data-sample]")) {
      const fresh = seedState();
      state.entries = fresh.entries;
      state.sample = true;
      persist();
      view = "today";
      say("Sample week loaded. It is invented, so you can look around.");
      render();
    }
  });

  document.body.addEventListener("submit", function (event) {
    if (event.target.id !== "checkin") return;
    event.preventDefault();
    saveCheckin(event.target);
  });

  function nasaBlock() {
    if (!nasa) return "";
    const events = nasa.donki.events.map(function (ev) {
      const when = ev.time.replace("T", " ").replace("Z", " UTC");
      return '<li><a href="' + esc(ev.url) + '" target="_blank" rel="noopener noreferrer">' + esc(when) + "</a> · " + esc(ev.instrument) + "</li>";
    }).join("");
    const studies = nasa.studies.map(function (study) {
      return '<li><a href="' + esc(study.url) + '" target="_blank" rel="noopener noreferrer">' + esc(study.id) + "</a> — " + esc(study.title) + ". " + esc(study.summary) + "</li>";
    }).join("");
    return '<section class="prose"><h2>NASA records this app uses</h2><p>' + esc(nasa.donki.note) + '</p><ul>' + events + '</ul><p>The check-in is yours. It is not these lab results. The sample week is invented.</p><ul>' + studies + '</ul><p><a href="' + esc(nasa.hrp.url) + '" target="_blank" rel="noopener noreferrer">' + esc(nasa.hrp.name) + "</a>. " + esc(nasa.hrp.note) + "</p></section>";
  }

  fetch("data/nasa.json")
    .then(function (response) { return response.json(); })
    .then(function (data) {
      nasa = data;
      if (view === "today" || view === "about") render();
    })
    .catch(function () { /* opened without a server; the NASA file still ships in public/data */ });

  render();
})();
