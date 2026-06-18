// Scroll reveal
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// Smooth active nav
const sections = document.querySelectorAll('section[id], div[id]');
const navLinks = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(s => {
    if (window.scrollY >= s.offsetTop - 100) current = s.id;
  });
  navLinks.forEach(a => {
    a.classList.remove('active');
    if (a.getAttribute('href') === '#' + current) a.classList.add('active');
  });
});

// -- Live stat demo animation --
const stats = {
  cpu:  { el: document.getElementById('stat-cpu'),  fill: document.getElementById('fill-cpu'),  min: 8,  max: 72,  cur: 23,  color: '#3b9eff', unit: '%' },
  ram:  { el: document.getElementById('stat-ram'),  fill: document.getElementById('fill-ram'),  min: 38, max: 68,  cur: 45,  color: '#a855f7', unit: '%' },
  gpu:  { el: document.getElementById('stat-gpu'),  fill: document.getElementById('fill-gpu'),  min: 5,  max: 85,  cur: 32,  color: '#22d3a0', unit: '%' },
  net:  { el: document.getElementById('stat-net'),  fill: document.getElementById('fill-net'),  min: 0.2,max: 8.4, cur: 1.2, color: '#f59e0b', unit: 'net' },
};

function lerp(a, b, t) { return a + (b - a) * t; }

function nextTarget(s) {
  const range = s.max - s.min;
  return s.min + Math.random() * range;
}

// Give each stat a target and a speed
Object.values(stats).forEach(s => {
  s.target = nextTarget(s);
  s.speed = 0.04 + Math.random() * 0.03;
});

function tick() {
  Object.values(stats).forEach(s => {
    if (!s.el || !s.fill) return;

    // Drift toward target
    s.cur = lerp(s.cur, s.target, s.speed);

    // When close enough, pick a new target
    if (Math.abs(s.cur - s.target) < 0.5) {
      s.target = nextTarget(s);
    }

    // Update DOM
    if (s.unit === 'net') {
      s.el.innerHTML = s.cur.toFixed(1) + '<span style="font-size:11px;color:var(--text3)"> MB/s</span>';
      const pct = ((s.cur - s.min) / (s.max - s.min)) * 100;
      s.fill.style.width = Math.max(2, pct) + '%';
    } else {
      const val = Math.round(s.cur);
      s.el.textContent = val + '%';
      s.fill.style.width = val + '%';
    }
  });

  requestAnimationFrame(tick);
}

// Only start when the hero mockup is visible
const mockup = document.querySelector('.mockup-main');
if (mockup) {
  const startObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      tick();
      startObserver.disconnect();
    }
  }, { threshold: 0.3 });
  startObserver.observe(mockup);
}

// Passive WebTrigger Viewer image rotator
const viewerRotator = document.querySelector('[data-viewer-rotator]');
if (viewerRotator) {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const viewerImages = [
    'viewer/Phone1.png',
    'viewer/Phone2.png',
    'viewer/Phone3.png',
    'viewer/Phone4.png',
    'viewer/Phone5.png',
  ];
  const viewerSlots = viewerRotator.querySelectorAll('[data-viewer-slot]');
  let viewerIndex = 0;

  function setViewerPair(index) {
    viewerSlots.forEach((slot, slotIndex) => {
      const nextSrc = viewerImages[(index + slotIndex) % viewerImages.length];
      slot.classList.add('is-swapping');
      window.setTimeout(() => {
        slot.src = nextSrc;
        slot.alt = `WebTrigger Viewer screenshot ${((index + slotIndex) % viewerImages.length) + 1}`;
        slot.classList.remove('is-swapping');
      }, 180);
    });
  }

  if (!reduceMotion && viewerSlots.length === 2) {
    window.setInterval(() => {
      viewerIndex = (viewerIndex + 2) % viewerImages.length;
      setViewerPair(viewerIndex);
    }, 4000);
  }
}

// Bolt survey prompt
const boltSurvey = document.querySelector('[data-bolt-survey]');
if (boltSurvey) {
  const BOLT_SURVEY_DISMISSED_KEY = 'webtriggerBoltSurveyDismissed';
  const BOLT_SURVEY_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSevvx0CkxcUbNwyniAE-BQkYRDSHa_2Yz9TB2j9D7qGIKqSHw/viewform?usp=publish-editor';
  const boltSurveyLink = boltSurvey.querySelector('a');
  const boltCloseButton = boltSurvey.querySelector('[data-bolt-close]');
  const boltDismissButton = boltSurvey.querySelector('[data-bolt-dismiss]');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let dismissedForPage = false;

  function hasDismissedBoltSurvey() {
    try {
      return window.localStorage.getItem(BOLT_SURVEY_DISMISSED_KEY) === 'true';
    } catch (_) {
      return dismissedForPage;
    }
  }

  function dismissBoltSurvey() {
    dismissedForPage = true;
    try {
      window.localStorage.setItem(BOLT_SURVEY_DISMISSED_KEY, 'true');
    } catch (_) {
      // Closing for this page view is enough when localStorage is unavailable.
    }
    boltSurvey.classList.remove('is-visible');
    window.setTimeout(() => {
      boltSurvey.hidden = true;
    }, reduceMotion ? 0 : 280);
  }

  function closeBoltSurvey() {
    dismissedForPage = true;
    boltSurvey.classList.remove('is-visible');
    window.setTimeout(() => {
      boltSurvey.hidden = true;
    }, reduceMotion ? 0 : 280);
  }

  function showBoltSurvey() {
    if (hasDismissedBoltSurvey()) return;
    boltSurvey.hidden = false;
    window.requestAnimationFrame(() => {
      boltSurvey.classList.add('is-visible');
    });
  }

  if (boltSurveyLink) {
    boltSurveyLink.href = BOLT_SURVEY_FORM_URL;
  }

  if (boltCloseButton) {
    boltCloseButton.addEventListener('click', closeBoltSurvey);
  }

  if (boltDismissButton) {
    boltDismissButton.addEventListener('click', dismissBoltSurvey);
  }

  if (!hasDismissedBoltSurvey()) {
    window.setTimeout(showBoltSurvey, reduceMotion ? 0 : 2500);
  }
}

// WebShell screenshot lightbox
const shellLightbox = document.querySelector('[data-shell-lightbox]');
if (shellLightbox) {
  const shellData = {
    default: {
      name: 'Default',
      desc: 'A clean everyday dashboard for launchers, system actions, remote mouse, and live PC values.',
      images: [
        'shells/Default1.png',
        'shells/Default2.png',
        'shells/Default3.png',
        'shells/Default4.png',
        'shells/Default_Remote_Mouse.png',
      ],
    },
    action: {
      name: 'Action Deck',
      desc: 'A page-based button deck for touchscreens, creator setups, and dedicated control panels.',
      images: [
        'shells/Action_Deck1.png',
        'shells/Action_Deck2.png',
        'shells/Action_Deck3.png',
        'shells/Action_Deck5.png',
        'shells/Action_Deck6.png',
        'shells/Action_Deck7.png',
        'shells/Action_Deck8.png',
        'shells/Action_Deck9.png',
      ],
    },
    cyber: {
      name: 'Cyber Fantasy',
      desc: 'A high-energy shell for gaming setups, themed rooms, and expressive control panels.',
      images: [
        'shells/Cyber_Fantasy1.png',
        'shells/Cyber_Fantasy2.png',
        'shells/Cyber_Fantasy3.png',
        'shells/Cyber_Fantasy4.png',
        'shells/Cyber_Fantasy5.png',
      ],
    },
    companion: {
      name: 'Companion',
      desc: 'A compact companion shell for phones, tablets, and quick control from a nearby screen.',
      images: [
        'shells/Companion1.png',
        'shells/Companion2.png',
        'shells/Companion3.png',
        'shells/Companion4.png',
      ],
    },
  };

  const shellCards = document.querySelectorAll('[data-shell]');
  const shellDialog = shellLightbox.querySelector('.shell-lightbox-dialog');
  const closeButtons = shellLightbox.querySelectorAll('[data-shell-close]');
  const showcaseTitle = document.getElementById('shell-lightbox-title');
  const showcaseDesc = document.getElementById('shell-lightbox-desc');
  const showcaseCount = document.getElementById('shell-slide-count');
  const showcaseImg = document.getElementById('shell-showcase-img');
  const dotsWrap = document.querySelector('[data-shell-dots]');
  const prevBtn = document.querySelector('[data-shell-prev]');
  const nextBtn = document.querySelector('[data-shell-next]');
  let activeShell = 'default';
  let activeSlide = 0;
  let lastTrigger = null;

  function renderDots(images) {
    if (!dotsWrap) return;
    dotsWrap.innerHTML = '';
    images.forEach((_, index) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'shell-dot';
      dot.setAttribute('aria-label', `Show screenshot ${index + 1}`);
      dot.addEventListener('click', () => {
        activeSlide = index;
        renderShell();
      });
      dotsWrap.appendChild(dot);
    });
  }

  function renderShell() {
    const shell = shellData[activeShell];
    if (!shell || !showcaseImg) return;
    activeSlide = (activeSlide + shell.images.length) % shell.images.length;

    if (showcaseTitle) showcaseTitle.textContent = shell.name;
    if (showcaseDesc) showcaseDesc.textContent = shell.desc;
    if (showcaseCount) showcaseCount.textContent = `${activeSlide + 1} / ${shell.images.length}`;

    if (shellLightbox.hidden) {
      showcaseImg.src = shell.images[activeSlide];
      showcaseImg.alt = `${shell.name} WebShell screenshot ${activeSlide + 1}`;
    } else {
      showcaseImg.classList.add('is-changing');
      window.setTimeout(() => {
        showcaseImg.src = shell.images[activeSlide];
        showcaseImg.alt = `${shell.name} WebShell screenshot ${activeSlide + 1}`;
        showcaseImg.classList.remove('is-changing');
      }, 80);
    }

    if (dotsWrap) {
      dotsWrap.querySelectorAll('.shell-dot').forEach((dot, index) => {
        dot.classList.toggle('is-active', index === activeSlide);
        dot.setAttribute('aria-current', index === activeSlide ? 'true' : 'false');
      });
    }
  }

  function openShell(shellKey, trigger) {
    if (!shellData[shellKey]) return;
    lastTrigger = trigger || null;
    activeShell = shellKey;
    activeSlide = 0;
    renderDots(shellData[activeShell].images);
    renderShell();
    shellLightbox.hidden = false;
    document.body.classList.add('modal-open');
    if (shellDialog) shellDialog.focus();
  }

  function closeShell() {
    shellLightbox.hidden = true;
    document.body.classList.remove('modal-open');
    if (lastTrigger && typeof lastTrigger.focus === 'function') {
      lastTrigger.focus({ preventScroll: true });
    }
  }

  shellCards.forEach(card => {
    card.addEventListener('click', () => openShell(card.dataset.shell, card));
  });

  closeButtons.forEach(button => {
    button.addEventListener('click', closeShell);
  });

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      activeSlide -= 1;
      renderShell();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      activeSlide += 1;
      renderShell();
    });
  }

  document.addEventListener('keydown', (event) => {
    if (shellLightbox.hidden) return;
    if (event.key === 'Escape') {
      closeShell();
      event.preventDefault();
      return;
    }
    if (event.key === 'ArrowLeft') {
      activeSlide -= 1;
      renderShell();
      event.preventDefault();
    }
    if (event.key === 'ArrowRight') {
      activeSlide += 1;
      renderShell();
      event.preventDefault();
    }
  });

  renderDots(shellData[activeShell].images);
  renderShell();
}
