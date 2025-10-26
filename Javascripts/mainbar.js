// Auto Hide Main Bar on Scroll
// version 2024.9.0
// Auto hides .mainbar when scrolling down, shows when scrolling up

(function autoHideMainBar() {
  "use strict"

  let lastScrollTop = 0;
  let scrollTimer;
  const mainBar = document.querySelector('.mainbar');
  
  if (!mainBar) return;

  // Set initial transition
  mainBar.style.transition = 'height 280ms ease-in-out';
  
  function handleScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    // Clear any pending timer
    clearTimeout(scrollTimer);
    
    // Wait a bit to determine scroll direction
    scrollTimer = setTimeout(() => {
      if (scrollTop > lastScrollTop && scrollTop > 50) {
        // Scrolling down - hide mainbar
        mainBar.style.height = '0';
        mainBar.style.overflow = 'hidden';
      } else {
        // Scrolling up - show mainbar
        mainBar.style.height = '';
        mainBar.style.overflow = '';
      }
      
      lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    }, 10);
  }

  // Add scroll event listener
  window.addEventListener('scroll', handleScroll, { passive: true });

  // Override appendChild to ensure script persistence
  let appendChild = Element.prototype.appendChild;
  Element.prototype.appendChild = function() {
    if (
      arguments[0].tagName === "DIV" &&
      arguments[0].classList.contains("tab-header")
    ) {
      // Re-attach scroll listener when new tabs are added
      setTimeout(() => {
        window.removeEventListener('scroll', handleScroll);
        window.addEventListener('scroll', handleScroll, { passive: true });
      }, 100);
    }
    return appendChild.apply(this, arguments);
  };
})();
