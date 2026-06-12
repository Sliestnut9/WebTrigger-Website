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
