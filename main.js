// ==============================================
// CONFIGURATION & CONSTANTS
// ==============================================
const CONFIG = {
  EMAIL: 'dev@kalpha.kr',
  TYPING_SPEED: 100,
  SCROLL_OFFSET: 80,
  SCROLL_REVEAL_POINT: 150,
  BACK_TO_TOP_THRESHOLD: 500,
  LOADING: {
    TEXT_DELAY: 0,
    ICON_DELAY: 800,
    SUBICON_BASE_DELAY: 1600,
    SUBICON_INCREMENT: 400,
    DESIGNER_DELAY: 2800,
    ANIMATION_DURATION: 900,  // fall animation duration
    MIN_DISPLAY_TIME: 4500    // 2800 (last element) + 900 (animation) + 800 (viewing time)
  }
};

// ==============================================
// NAVIGATION
// ==============================================
const navLinks = document.querySelectorAll('.ul-list li a');
const sections = document.querySelectorAll('section');

function removeActive() {
  navLinks.forEach(link => link.parentElement.classList.remove('active'));
}

navLinks.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const targetId = link.getAttribute('href').substring(1);
    const targetSection = document.getElementById(targetId);

    window.scrollTo({
      top: targetSection.offsetTop - CONFIG.SCROLL_OFFSET, 
      behavior: 'smooth'
    });

    removeActive();
    link.parentElement.classList.add('active');
  });
});

window.addEventListener('scroll', () => {
  let scrollPos = window.scrollY + 100;

  sections.forEach(section => {
    if (scrollPos >= section.offsetTop && scrollPos < section.offsetTop + section.offsetHeight) {
      removeActive();
      const activeLink = document.querySelector(`.ul-list li a[href="#${section.id}"]`);
      if (activeLink) activeLink.parentElement.classList.add('active');
    }
  });

  if(window.scrollY > CONFIG.BACK_TO_TOP_THRESHOLD){
    backToTop.style.display = "flex";
  } else {
    backToTop.style.display = "none";
  }

  // Footer 영역에 도달하면 버튼 색상 반전
  const footer = document.querySelector('.footer');
  if (footer) {
    const footerTop = footer.getBoundingClientRect().top;
    const windowHeight = window.innerHeight;
    
    if (footerTop < windowHeight) {
      backToTop.style.background = 'white';
      backToTop.style.color = '#333333';
      backToTop.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    } else {
      backToTop.style.background = '#333333';
      backToTop.style.color = 'white';
      backToTop.style.boxShadow = 'none';
    }
  }

  revealElements.forEach(el => {
    const windowHeight = window.innerHeight;
    const elementTop = el.getBoundingClientRect().top;
    const revealPoint = CONFIG.SCROLL_REVEAL_POINT;

    if(elementTop < windowHeight - revealPoint){
      el.classList.add('active-reveal');
    }
  });
});

// ==============================================
// SCROLL REVEAL ANIMATIONS
// ==============================================
const revealElements = document.querySelectorAll('.home-container, .about-container, .projects-container, .services-container, .contact-content');
revealElements.forEach(el => el.classList.add('reveal'));

// ==============================================
// BACK TO TOP BUTTON
// ==============================================
const backToTop = document.getElementById('back-to-top');

if (backToTop) {
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  backToTop.addEventListener('mouseover', () => backToTop.style.transform = 'scale(1.2)');
  backToTop.addEventListener('mouseout', () => backToTop.style.transform = 'scale(1)');
}

const cards = document.querySelectorAll('.project-card, .c1, .service-card');
cards.forEach(card => {
  card.addEventListener('mouseenter', () => card.style.transform = 'translateY(-8px) scale(1.05)');
  card.addEventListener('mouseleave', () => card.style.transform = 'translateY(0) scale(1)');
});

// ==============================================
// TYPING EFFECT
// ==============================================
const typingElement = document.querySelector('.info-home h3'); 
const words = ["Fullstack Developer", "Internal Network Hacking", "Server Hacking"];
let wordIndex = 0;
let charIndex = 0;
let isDeleting = false;
let typingSpeed = CONFIG.TYPING_SPEED;

function type() {
    const currentWord = words[wordIndex];
    let displayedText = currentWord.substring(0, charIndex);
    
    typingElement.innerHTML = displayedText + '<span class="cursor">|</span>';

    if (!isDeleting && charIndex < currentWord.length) {
        charIndex++;
        setTimeout(type, typingSpeed);
    } else if (isDeleting && charIndex > 0) {
        charIndex--;
        setTimeout(type, typingSpeed / 2);
    } else {
        isDeleting = !isDeleting;
        if (!isDeleting) {
            wordIndex = (wordIndex + 1) % words.length;
        }
        setTimeout(type, 1000);
    }
}

document.addEventListener('DOMContentLoaded', type);

// 버튼 기능 추가
const hireBtn = document.querySelector('.btn-home1');

// ==============================================
// BUTTONS & ACTIONS
// ==============================================
if (hireBtn) {
  hireBtn.addEventListener('click', () => {
    window.location.href = `mailto:${CONFIG.EMAIL}?subject=프리랜서 작업 문의`;
  });
}

// ==============================================
// MOBILE NAVIGATION
// ==============================================
const mobileMenuBtn = document.createElement('div');
mobileMenuBtn.className = 'mobile-menu-btn';
mobileMenuBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
const headerList = document.querySelector('.header-list');
if (headerList) {
  headerList.prepend(mobileMenuBtn);
}

mobileMenuBtn.addEventListener('click', () => {
  document.querySelector('.ul-list').classList.toggle('mobile-active');
  const icon = mobileMenuBtn.querySelector('i');
  icon.classList.toggle('fa-bars');
  icon.classList.toggle('fa-times');
});

// ==============================================
// LOADING SCREEN
// ==============================================
document.addEventListener("DOMContentLoaded", () => {
  const loadingText = document.getElementById("loading-text");
  const mainIcon = document.querySelector(".main-icon");
  const subIcons = document.querySelectorAll(".sub-icons i");
  const designerText = document.getElementById("designer-text");
  const loadingScreen = document.getElementById("loading-screen");
  const startTime = Date.now();
  
  // Prevent scrolling during loading
  document.body.classList.add('loading');

  function showElement(element, delay=0){
    if (!element) return;
    setTimeout(() => {
      element.classList.remove("hidden");
      element.classList.add("fall");
    }, delay);
  }

  // Show loading elements with configured delays
  showElement(loadingText, CONFIG.LOADING.TEXT_DELAY);          
  showElement(mainIcon, CONFIG.LOADING.ICON_DELAY);         
  subIcons.forEach((icon, idx) => {
    showElement(icon, CONFIG.LOADING.SUBICON_BASE_DELAY + idx * CONFIG.LOADING.SUBICON_INCREMENT);  
  });
  showElement(designerText, CONFIG.LOADING.DESIGNER_DELAY);    

  // Hide loading screen after minimum display time and content is ready
  function hideLoadingScreen() {
    const elapsed = Date.now() - startTime;
    const remainingTime = Math.max(0, CONFIG.LOADING.MIN_DISPLAY_TIME - elapsed);
    
    setTimeout(() => {
      if (loadingScreen) {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
          loadingScreen.style.display = 'none';
          // Re-enable scrolling
          document.body.classList.remove('loading');
        }, 500);
      }
    }, remainingTime);
  }

  // Wait for critical resources
  if (document.readyState === 'complete') {
    hideLoadingScreen();
  } else {
    window.addEventListener('load', hideLoadingScreen);
  }
});
