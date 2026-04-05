/* =====================================================
   ERNESTO CISNEROS - MAIN JS
   Partículas doradas y funcionalidades globales
   ===================================================== */

/* =====================================================
   GOLD PARTICLE ANIMATION
   ===================================================== */
(function initParticles() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let particles = [];
  const PARTICLE_COUNT = 60;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function createParticle(init) {
    return {
      x: Math.random() * canvas.width,
      y: init ? Math.random() * canvas.height : canvas.height + 10,
      size: Math.random() * 2 + 0.5,
      speedY: -(Math.random() * 0.4 + 0.1),
      speedX: (Math.random() - 0.5) * 0.2,
      opacity: Math.random() * 0.6 + 0.2,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: Math.random() * 0.02 + 0.01
    };
  }

  function init() {
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(createParticle(true));
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach((p, i) => {
      p.y += p.speedY;
      p.x += p.speedX;
      p.pulse += p.pulseSpeed;

      if (p.y < -10) particles[i] = createParticle(false);

      const op = p.opacity * (0.5 + 0.5 * Math.sin(p.pulse));

      // Main particle
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(212, 160, 48, ' + op + ')';
      ctx.fill();

      // Glow for larger particles
      if (p.size > 1.2) {
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4);
        g.addColorStop(0, 'rgba(212, 160, 48, ' + (op * 0.3) + ')');
        g.addColorStop(1, 'rgba(212, 160, 48, 0)');
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
      }
    });

    requestAnimationFrame(animate);
  }

  window.addEventListener('resize', resize);
  resize();
  init();
  animate();
})();

/* =====================================================
   MOBILE MENU TOGGLE
   ===================================================== */
document.addEventListener('DOMContentLoaded', function() {
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('.nav-menu');

  if (navToggle && navMenu) {
    function updateHamburger() {
      const isActive = navMenu.classList.contains('open');
      const spans = navToggle.querySelectorAll('span');
      if (spans.length >= 3) {
        spans[0].style.transform = isActive ? 'rotate(45deg) translateY(8px)' : '';
        spans[1].style.opacity = isActive ? '0' : '1';
        spans[2].style.transform = isActive ? 'rotate(-45deg) translateY(-8px)' : '';
      }
    }

    navToggle.addEventListener('click', function(e) {
      e.stopPropagation();
      navMenu.classList.toggle('open');
      document.body.style.overflow = navMenu.classList.contains('open') ? 'hidden' : '';
      navToggle.setAttribute('aria-expanded', navMenu.classList.contains('open') ? 'true' : 'false');
      updateHamburger();
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
      if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
        navMenu.classList.remove('open');
        document.body.style.overflow = '';
        navToggle.setAttribute('aria-expanded', 'false');
        updateHamburger();
      }
    });

    // Close menu when clicking a nav link
    navMenu.querySelectorAll('a').forEach(function(link) {
      link.addEventListener('click', function() {
        navMenu.classList.remove('open');
        document.body.style.overflow = '';
        navToggle.setAttribute('aria-expanded', 'false');
        updateHamburger();
      });
    });
  }
});

/* =====================================================
   AUDIO CONTROL (for pages with background music)
   ===================================================== */
function initAudioControl(audioSrc, autoplay = false) {
  const audioControl = document.querySelector('.audio-control');
  if (!audioControl) return;

  const audio = new Audio(audioSrc);
  audio.loop = true;
  audio.volume = 0.4;

  let isPlaying = false;

  function updateUI() {
    audioControl.classList.toggle('paused', !isPlaying);
    const label = audioControl.querySelector('.audio-label');
    if (label) {
      label.textContent = isPlaying ? 'Playing' : 'Paused';
    }
  }

  audioControl.addEventListener('click', function() {
    if (isPlaying) {
      audio.pause();
      isPlaying = false;
    } else {
      audio.play().catch(err => console.log('Audio play failed:', err));
      isPlaying = true;
    }
    updateUI();
  });

  // Autoplay if specified
  if (autoplay) {
    audio.play().then(() => {
      isPlaying = true;
      updateUI();
    }).catch(err => {
      console.log('Autoplay blocked:', err);
      isPlaying = false;
      updateUI();
    });
  }

  updateUI();
  return audio;
}

/* =====================================================
   SMOOTH SCROLL FOR ANCHOR LINKS
   ===================================================== */
document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
});

/* =====================================================
   MARK ACTIVE NAV ITEM
   ===================================================== */
document.addEventListener('DOMContentLoaded', function() {
  const currentPath = window.location.pathname;
  const navItems = document.querySelectorAll('.nav-item, .nav-dropdown-item');

  navItems.forEach(item => {
    const href = item.getAttribute('href');
    if (href && currentPath.endsWith(href.replace('./', '').replace('../', ''))) {
      item.classList.add('active');
      
      // Also mark parent dropdown as active
      const parentDropdown = item.closest('.nav-dropdown');
      if (parentDropdown) {
        const parentItem = parentDropdown.querySelector('.nav-item');
        if (parentItem) parentItem.classList.add('active');
      }
    }
  });
});
