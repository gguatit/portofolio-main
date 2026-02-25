// ==============================================
// CONFIGURATION & CONSTANTS
// ==============================================
const CONFIG = {
  EMAIL: 'dev@kalpha.kr',
  TYPING_SPEED: 100,
  SCROLL_OFFSET: 80,
  SCROLL_REVEAL_POINT: 150,
  BACK_TO_TOP_THRESHOLD: 500
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

  if (window.scrollY > CONFIG.BACK_TO_TOP_THRESHOLD) {
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
});

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
// INITIALIZATION
// ==============================================
document.addEventListener("DOMContentLoaded", () => {
  // Re-enable scrolling (if it was somehow disabled)
  document.body.classList.remove('loading');
});
