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
      })();
