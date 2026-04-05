/* =====================================================
   SHARED NAVIGATION BEHAVIOR
   Hamburger menu toggle, X animation, scroll lock,
   close on outside click, close on link click.
   Works with both .nav-toggle and #nav-toggle selectors.
   ===================================================== */

document.addEventListener('DOMContentLoaded', function() {
  const menuBtn = document.querySelector('.nav-toggle') || document.getElementById('nav-toggle');
  const navMenuEl = document.querySelector('.nav-menu') || document.getElementById('nav-menu');

  if (!menuBtn || !navMenuEl) return;

  function updateHamburger() {
    const isOpen = navMenuEl.classList.contains('open');
    const spans = menuBtn.querySelectorAll('span');
    if (spans.length >= 3) {
      spans[0].style.transform = isOpen ? 'rotate(45deg) translateY(8px)' : '';
      spans[1].style.opacity = isOpen ? '0' : '1';
      spans[2].style.transform = isOpen ? 'rotate(-45deg) translateY(-8px)' : '';
    }
  }

  menuBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    navMenuEl.classList.toggle('open');
    document.body.style.overflow = navMenuEl.classList.contains('open') ? 'hidden' : '';
    menuBtn.setAttribute('aria-expanded', menuBtn.getAttribute('aria-expanded') === 'true' ? 'false' : 'true');
    updateHamburger();
  });

  // Close menu when clicking outside
  document.addEventListener('click', function(e) {
    if (!menuBtn.contains(e.target) && !navMenuEl.contains(e.target)) {
      navMenuEl.classList.remove('open');
      document.body.style.overflow = '';
      menuBtn.setAttribute('aria-expanded', 'false');
      updateHamburger();
    }
  });

  // Close menu when clicking a nav link
  navMenuEl.querySelectorAll('a').forEach(function(link) {
    link.addEventListener('click', function() {
      navMenuEl.classList.remove('open');
      document.body.style.overflow = '';
      menuBtn.setAttribute('aria-expanded', 'false');
      updateHamburger();
    });
  });

  // Optional: scroll-based nav background
  const nav = document.querySelector('.nav') || document.getElementById('nav');
  if (nav) {
    window.addEventListener('scroll', function() {
      nav.classList.toggle('scrolled', window.scrollY > 50);
    });
  }
});
