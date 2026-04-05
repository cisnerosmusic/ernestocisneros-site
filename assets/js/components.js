/* =====================================================
   ERNESTO CISNEROS - COMPONENTS LOADER
   Carga dinámica de header y footer
   ===================================================== */

(async function loadComponents() {
  // Determine base path based on current location
  const path = window.location.pathname;
  const isSubfolder = path.includes('/music/') || path.includes('/nft/') || path.includes('/ideas/') || path.includes('/books/');
  const basePath = isSubfolder ? '../' : './';

  // Load Header
  const headerContainer = document.getElementById('header-component');
  if (headerContainer) {
    try {
      const response = await fetch(basePath + 'components/header.html');
      if (response.ok) {
        let html = await response.text();
        
        // Adjust paths for subfolders
        if (isSubfolder) {
          html = html.replace(/href="(?!http|#|mailto)/g, 'href="../');
          html = html.replace(/src="(?!http)/g, 'src="../');
        }
        
        headerContainer.innerHTML = html;
        
        // Reinitialize mobile menu toggle after loading
        initMobileMenu();
        markActiveNav();
      }
    } catch (err) {
      console.error('Failed to load header:', err);
    }
  }

  // Load Footer
  const footerContainer = document.getElementById('footer-component');
  if (footerContainer) {
    try {
      const response = await fetch(basePath + 'components/footer.html');
      if (response.ok) {
        let html = await response.text();
        footerContainer.innerHTML = html;
      }
    } catch (err) {
      console.error('Failed to load footer:', err);
    }
  }
})();

/* =====================================================
   MOBILE MENU INITIALIZATION
   ===================================================== */
function initMobileMenu() {
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('.nav-menu');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function() {
      navMenu.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', navMenu.classList.contains('open') ? 'true' : 'false');
    });

    document.addEventListener('click', function(e) {
      if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
        navMenu.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }
}

/* =====================================================
   MARK ACTIVE NAVIGATION ITEM
   ===================================================== */
function markActiveNav() {
  const currentPath = window.location.pathname;
  const filename = currentPath.split('/').pop() || 'index.html';
  
  document.querySelectorAll('.nav-item, .nav-dropdown-item').forEach(item => {
    const href = item.getAttribute('href');
    if (!href) return;
    
    const hrefFile = href.split('/').pop();
    
    if (filename === hrefFile || 
        (filename === '' && hrefFile === 'index.html') ||
        (filename === 'index.html' && hrefFile === 'index.html')) {
      item.classList.add('active');
      
      const parentDropdown = item.closest('.nav-dropdown');
      if (parentDropdown) {
        const parentItem = parentDropdown.querySelector('.nav-item');
        if (parentItem) parentItem.classList.add('active');
      }
    }
  });
}
