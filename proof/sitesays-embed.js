/* sitesays-embed.js — SiteSays third-party embed widget.
 *
 * A buyer pastes ONE script tag on their own site:
 *
 *   <script src="https://faqagent.northbeambuilds.com/proof/sitesays-embed.js"
 *           data-sitesays-endpoint="https://faqagent.northbeambuilds.com"
 *           data-sitesays-site="hill-country-gutter" async></script>
 *
 * Isolation, by construction:
 *  - everything renders inside a Shadow DOM tree, so host page CSS cannot
 *    reach the widget's elements and widget CSS cannot leak out;
 *  - the script is one IIFE: it reads no host globals and writes exactly
 *    one (window.SiteSays, its own namespace);
 *  - all styling is in the shadow stylesheet with explicit font/color on
 *    every element (font and color would otherwise inherit from the host);
 *  - the widget makes network calls only to data-sitesays-endpoint.
 *
 * Behaviour mirrors the tested reference client: ask -> grounded answer;
 * no answer -> the business's honest fallback plus a lead form; a "leave
 * your number" path is always one tap away. The header names the assistant
 * as automated — that line is an honesty marker, not decoration.
 */
(function () {
  "use strict";

  var script = document.currentScript;
  if (!script) return;
  var endpoint = (script.getAttribute("data-sitesays-endpoint") || "").replace(/\/+$/, "");
  var site = script.getAttribute("data-sitesays-site") || "";
  var fallbackName = script.getAttribute("data-sitesays-name") || "the business";
  var fallbackPhone = script.getAttribute("data-sitesays-phone") || "";
  var accent = script.getAttribute("data-sitesays-accent") || "#9a3412";
  if (!endpoint || !site) return;
  if (document.getElementById("sitesays-embed-host")) return; // never twice

  var CSS = [
    ":host { all: initial; }",
    ".ss-root { font-family: -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1c1917; font-size: 15px; line-height: 1.45; }",
    ".ss-root * { box-sizing: border-box; font-family: inherit; color: inherit; }",
    ".ss-launcher { position: fixed; right: 18px; bottom: 18px; z-index: 2147483000; border: 0; border-radius: 999px; padding: 13px 20px; background: " + accent + "; color: #fff; font-size: 15px; font-weight: 600; cursor: pointer; box-shadow: 0 6px 24px rgba(0,0,0,.28); }",
    ".ss-launcher:hover { filter: brightness(1.08); }",
    ".ss-panel { position: fixed; right: 18px; bottom: 78px; z-index: 2147483000; width: 380px; max-width: calc(100vw - 24px); height: 560px; max-height: calc(100dvh - 110px); background: #fff; border: 1px solid #d6d3d1; border-radius: 14px; box-shadow: 0 18px 50px rgba(0,0,0,.30); display: none; flex-direction: column; overflow: hidden; }",
    ".ss-panel.ss-open { display: flex; }",
    ".ss-head { background: " + accent + "; color: #fff; padding: 13px 16px; }",
    ".ss-head .ss-name { font-size: 16px; font-weight: 700; color: #fff; }",
    ".ss-head .ss-sub { font-size: 12.5px; color: #fff; opacity: .92; margin-top: 2px; }",
    ".ss-msgs { flex: 1; overflow-y: auto; padding: 14px; background: #fafaf9; }",
    ".ss-msg { max-width: 88%; padding: 9px 12px; border-radius: 12px; margin: 0 0 10px; white-space: pre-wrap; word-wrap: break-word; font-size: 14.5px; }",
    ".ss-bot { background: #fff; border: 1px solid #e7e5e4; border-bottom-left-radius: 4px; }",
    ".ss-user { background: " + accent + "; color: #fff; margin-left: auto; border-bottom-right-radius: 4px; }",
    ".ss-note { font-size: 12px; color: #57534e; margin: -4px 0 10px 2px; }",
    ".ss-row { display: flex; gap: 8px; padding: 10px; border-top: 1px solid #e7e5e4; background: #fff; }",
    ".ss-input { flex: 1; border: 1px solid #a8a29e; border-radius: 9px; padding: 10px 11px; font-size: 15px; background: #fff; color: #1c1917; min-width: 0; }",
    ".ss-send { border: 0; border-radius: 9px; padding: 10px 15px; background: " + accent + "; color: #fff; font-weight: 600; font-size: 15px; cursor: pointer; }",
    ".ss-leave { display: block; width: 100%; border: 0; background: none; color: " + accent + "; font-size: 13.5px; font-weight: 600; padding: 8px; cursor: pointer; text-align: center; }",
    ".ss-form { padding: 12px 14px; border-top: 1px solid #e7e5e4; background: #fff; display: none; }",
    ".ss-form.ss-show { display: block; }",
    ".ss-form label { display: block; font-size: 13px; font-weight: 600; margin: 8px 0 4px; color: #1c1917; }",
    ".ss-form input, .ss-form textarea { width: 100%; border: 1px solid #a8a29e; border-radius: 8px; padding: 9px 10px; font-size: 15px; background: #fff; color: #1c1917; }",
    ".ss-form .ss-send { width: 100%; margin-top: 11px; }",
    ".ss-form .ss-ok { font-size: 14.5px; color: #166534; font-weight: 600; padding: 6px 0; }",
    ".ss-form .ss-err { font-size: 14px; color: #b91c1c; padding: 6px 0; }",
    "@media (max-width: 640px) {",
    "  .ss-panel { right: 0; left: 0; bottom: 0; width: 100%; max-width: 100%; height: 88dvh; max-height: 88dvh; border-radius: 14px 14px 0 0; }",
    "  .ss-launcher { right: 14px; bottom: 14px; }",
    "}"
  ].join("\n");

  var host = document.createElement("div");
  host.id = "sitesays-embed-host";
  var root = host.attachShadow({ mode: "open" });
  var style = document.createElement("style");
  style.textContent = CSS;
  root.appendChild(style);

  var wrap = document.createElement("div");
  wrap.className = "ss-root";
  wrap.innerHTML =
    '<button type="button" class="ss-launcher" aria-label="Open chat">Questions? Ask here</button>' +
    '<section class="ss-panel" aria-label="Website question chat">' +
      '<div class="ss-head"><div class="ss-name"></div><div class="ss-sub">Automated assistant — answers only from this business\u2019s own info.</div></div>' +
      '<div class="ss-msgs" aria-live="polite"></div>' +
      '<form class="ss-form">' +
        '<label>Your name<input name="name" autocomplete="name" required maxlength="120"></label>' +
        '<label>Phone or email<input name="contact" autocomplete="tel" required maxlength="160"></label>' +
        '<label>What do you need?<textarea name="message" rows="2" maxlength="1000"></textarea></label>' +
        '<div class="ss-form-msg"></div>' +
        '<button type="submit" class="ss-send">Send it</button>' +
      '</form>' +
      '<button type="button" class="ss-leave">Rather leave your number? Tap here</button>' +
      '<form class="ss-askrow ss-row"><input class="ss-input" type="text" maxlength="500" placeholder="Type your question\u2026" aria-label="Type your question"><button type="submit" class="ss-send">Ask</button></form>' +
    '</section>';
  root.appendChild(wrap);
  document.body.appendChild(host);

  var launcher = root.querySelector(".ss-launcher");
  var panel = root.querySelector(".ss-panel");
  var msgs = root.querySelector(".ss-msgs");
  var nameEl = root.querySelector(".ss-name");
  var askForm = root.querySelector(".ss-askrow");
  var input = root.querySelector(".ss-input");
  var leaveBtn = root.querySelector(".ss-leave");
  var leadForm = root.querySelector(".ss-form");
  var leadMsg = root.querySelector(".ss-form-msg");

  var business = { name: fallbackName, phone: fallbackPhone };
  var lastQuestion = "";
  var kbLoaded = false;

  function addMsg(text, who) {
    var d = document.createElement("div");
    d.className = "ss-msg " + (who === "user" ? "ss-user" : "ss-bot");
    d.textContent = text;
    msgs.appendChild(d);
    msgs.scrollTop = msgs.scrollHeight;
    return d;
  }
  function addNote(text) {
    var d = document.createElement("div");
    d.className = "ss-note";
    d.textContent = text;
    msgs.appendChild(d);
    msgs.scrollTop = msgs.scrollHeight;
  }
  function showLeadForm() {
    leadForm.classList.add("ss-show");
    var msgField = leadForm.querySelector('textarea[name="message"]');
    if (lastQuestion && !msgField.value) msgField.value = lastQuestion;
  }

  function api(path, options) {
    return fetch(endpoint + path, options).then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    });
  }

  function loadKb() {
    return api("/api/kb?site=" + encodeURIComponent(site), { method: "GET" })
      .then(function (kb) {
        business = kb.business || business;
        nameEl.textContent = business.name;
        kbLoaded = true;
        addMsg(kb.greeting || ("Hi — ask me about " + business.name + "."), "bot");
      })
      .catch(function () {
        nameEl.textContent = business.name;
        addMsg("The question tool can't load right now. Call or text " + (business.phone || "the business") + " and a person will help.", "bot");
      });
  }

  var opened = false;
  launcher.addEventListener("click", function () {
    var open = panel.classList.toggle("ss-open");
    launcher.setAttribute("aria-expanded", open ? "true" : "false");
    if (open && !opened) { opened = true; loadKb(); }
    if (open) input.focus();
  });

  askForm.addEventListener("submit", function (ev) {
    ev.preventDefault();
    var q = input.value.trim();
    if (!q) return;
    input.value = "";
    lastQuestion = q;
    addMsg(q, "user");
    var pending = addMsg("Checking " + business.name + "\u2019s info\u2026", "bot");
    api("/api/ask", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ site: site, question: q }),
    }).then(function (res) {
      pending.textContent = res.answer;
      if (res.answered) {
        if (res.fact) addNote("From " + business.name + "\u2019s own info.");
      } else {
        showLeadForm();
      }
    }).catch(function () {
      pending.textContent = "That didn't go through — the connection dropped. Call or text " + (business.phone || "the business") + " instead, or leave your number below.";
      showLeadForm();
    });
  });

  leaveBtn.addEventListener("click", showLeadForm);

  leadForm.addEventListener("submit", function (ev) {
    ev.preventDefault();
    var fd = new FormData(leadForm);
    var payload = {
      site: site,
      name: String(fd.get("name") || "").trim(),
      contact: String(fd.get("contact") || "").trim(),
      question: lastQuestion,
      message: String(fd.get("message") || "").trim(),
    };
    if (!payload.name || payload.contact.length < 3) {
      leadMsg.innerHTML = '<div class="ss-err">Add your name and a phone or email so they can reach you.</div>';
      return;
    }
    leadMsg.innerHTML = "";
    api("/api/lead", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    }).then(function () {
      leadForm.reset();
      leadForm.classList.remove("ss-show");
      addMsg("Got it — thanks. " + business.name + " will get back to you within one business day.", "bot");
    }).catch(function () {
      leadMsg.innerHTML = '<div class="ss-err">That didn\u2019t go through. Call or text ' + (business.phone || "the business") + " instead.</div>";
    });
  });

  window.SiteSays = { site: site, version: "live-proof-1" };
})();
