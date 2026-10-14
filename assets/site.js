(function () {
        // Header nav toggle
        var toggle = document.getElementById('nav-toggle');
        var nav = document.getElementById('main-nav');
        if (toggle && nav) {
          toggle.addEventListener('click', function () {
            var open = nav.classList.toggle('open');
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
            toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
          });
          nav.addEventListener('click', function (e) {
            if (e.target.closest('a')) {
              nav.classList.remove('open');
              toggle.setAttribute('aria-expanded', 'false');
              toggle.setAttribute('aria-label', 'Open menu');
            }
          });
        }

        // Chat widget
        var btn = document.getElementById('nb-chat-btn');
        var panel = document.getElementById('nb-chat-panel');
        var closeBtn = document.getElementById('nb-chat-close');
        var messagesEl = document.getElementById('nb-chat-messages');
        var chipsEl = document.getElementById('nb-chips');
        var form = document.getElementById('nb-chat-form');
        var input = document.getElementById('nb-chat-input');
        var started = false;
        var captureStep = 0; // 0 none, 1 name, 2 contact, 3 need
        var capture = { name: '', contact: '', need: '' };

        var GREETING = "Hi! I'm Northbeam's automated assistant — not a person. I answer questions from Northbeam's own site info, and if you'd like to get started I can take your details for a follow-up.";
        var PRICES = "Here are our prices:\n• Never-Miss-a-Lead — $199 setup + $99/month ($298 first month)\n• Website FAQ & Lead Capture Agent — $49 flat, one-time\n• Website + Online Booking — from $249, one-time\n• AI Chatbot — $149 setup + $49/month\n• AI Phone Receptionist — $399 setup + $199/month\nFull table: /pricing/";
        var TOOLS = "What the tools do:\n• Never-Miss-a-Lead — catches every inquiry (missed calls, form fills, after-hours messages), replies instantly, and routes every lead to one inbox.\n• Website FAQ & Lead Capture Agent — a chat agent on a business's own website (this widget is one), answering from the business's own content and capturing leads.\n• Website + Online Booking — a small-business website with online booking built in.\n• AI Chatbot — answers customer questions around the clock on a business's site and messages.\n• AI Phone Receptionist — answers calls by voice, answers questions, books appointments, with humans as escalation.";
        var HOW = "How it works:\n1) Short intake about your business.\n2) We build and configure it — most tools are live in 24–48 hours; the phone receptionist takes 3–7 days, including a test call you approve.\n3) You test and approve it.\n4) Go live — month-to-month, cancel anytime.";
        var TERMS = "Terms: month-to-month, no long-term contract. If we miss what we promised, we fix it.";
        var CONTACT = "You can email northbeambuilds@gmail.com — a person replies within one business day. The studio is in Austin, TX. Demos are at /demos/ — they're concepts built from public info, not real client sites.";
        var FALLBACK = "I don't have that in Northbeam's information yet — I only answer from our own site content. You can email northbeambuilds@gmail.com, or leave your name and contact here and we'll reply within one business day.";
        var DISCOUNT = "I can't confirm that — the prices I have are the ones on our Pricing page.";

        function addMsg(text, who) {
          var div = document.createElement('div');
          div.className = 'nb-msg ' + who;
          div.textContent = text;
          messagesEl.appendChild(div);
          messagesEl.scrollTop = messagesEl.scrollHeight;
          return div;
        }
        function setChips(list) {
          chipsEl.innerHTML = '';
          list.forEach(function (label) {
            var b = document.createElement('button');
            b.type = 'button'; b.className = 'nb-chip'; b.textContent = label;
            b.setAttribute('aria-label', 'Ask: ' + label);
            b.addEventListener('click', function () { handleUser(label); });
            chipsEl.appendChild(b);
          });
        }
        function defaultChips() { setChips(['Prices', 'What do the tools do?', 'How it works', 'Get started']); }
        function startCapture() {
          captureStep = 1;
          addMsg("What's your name?", 'bot');
          setChips([]);
          input.focus();
        }
        function finishCapture() {
          captureStep = 0;
          var summary = 'Requested — we\'ll reply within one business day.\n\nHere\'s what you shared:\nName: ' + capture.name + '\nContact: ' + capture.contact + '\nInterested in: ' + capture.need;
          var div = addMsg(summary, 'bot');
          var body = 'Name: ' + capture.name + '\nContact: ' + capture.contact + '\nInterested in / need: ' + capture.need;
          var a = document.createElement('a');
          a.className = 'nb-mailto';
          a.textContent = 'Send this by email';
          a.href = 'mailto:northbeambuilds@gmail.com?subject=' + encodeURIComponent('New request from the website') + '&body=' + encodeURIComponent(body);
          div.appendChild(document.createElement('br'));
          div.appendChild(a);
          var note = document.createElement('div');
          note.textContent = 'or email us any time at northbeambuilds@gmail.com.';
          note.style.marginTop = '8px';
          div.appendChild(note);
          messagesEl.scrollTop = messagesEl.scrollHeight;
          defaultChips();
        }
        function botAnswer(raw) {
          var t = raw.toLowerCase();
          if (/(discount|coupon|promo|% off|percent off|special offer|deal you|you offered|sale price)/.test(t)) { addMsg(DISCOUNT, 'bot'); defaultChips(); return; }
          if (t === 'get started' || /\b(get started|sign me up|sign up|i'm interested|im interested|i am interested|book a|request a)\b/.test(t)) { startCapture(); return; }
          if (/(price|pricing|cost|how much|\\$)/.test(t)) { addMsg(PRICES, 'bot'); defaultChips(); return; }
          if (/(how it works|how does it work|process|how long|timeline|set ?up time|steps)/.test(t)) { addMsg(HOW, 'bot'); defaultChips(); return; }
          if (/(what do the tools do|what.*tools|tools do|never-miss|never miss|faq|lead capture|booking|chatbot|phone receptionist|receptionist|services|offer)/.test(t)) { addMsg(TOOLS, 'bot'); defaultChips(); return; }
          if (/(contract|cancel|terms|month.to.month|guarantee|refund)/.test(t)) { addMsg(TERMS, 'bot'); defaultChips(); return; }
          if (/(contact|email|phone number|human|person|austin|where|demo)/.test(t)) { addMsg(CONTACT, 'bot'); defaultChips(); return; }
          addMsg(FALLBACK, 'bot');
          setChips(['Get started', 'Prices', 'What do the tools do?', 'How it works']);
        }
        function handleUser(text) {
          var trimmed = (text || '').trim();
          if (!trimmed) return;
          addMsg(trimmed, 'user');
          if (captureStep === 1) { capture.name = trimmed; captureStep = 2; addMsg("What's the best email or phone to reach you?", 'bot'); return; }
          if (captureStep === 2) { capture.contact = trimmed; captureStep = 3; addMsg("Which tool are you interested in, or what do you need?", 'bot'); return; }
          if (captureStep === 3) { capture.need = trimmed; finishCapture(); return; }
          botAnswer(trimmed);
        }
        form.addEventListener('submit', function (e) {
          e.preventDefault();
          var v = input.value; input.value = '';
          handleUser(v);
        });
        function openPanel() {
          panel.hidden = false;
          btn.setAttribute('aria-expanded', 'true');
          btn.setAttribute('aria-label', 'Close chat with Northbeam\'s automated assistant');
          if (!started) { started = true; addMsg(GREETING, 'bot'); defaultChips(); }
          input.focus();
        }
        function closePanel() {
          panel.hidden = true;
          btn.setAttribute('aria-expanded', 'false');
          btn.setAttribute('aria-label', 'Open chat with Northbeam\'s automated assistant');
          btn.focus();
        }
        btn.addEventListener('click', function () { panel.hidden ? openPanel() : closePanel(); });
        closeBtn.addEventListener('click', closePanel);
        document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !panel.hidden) closePanel(); });
      })();
