// ==============================================
// CONFIGURATION & CONSTANTS
// ==============================================
const CONFIG = {
  EMAIL: 'dev@kalpha.kr',
  TYPING_SPEED: 100,
  SCROLL_OFFSET: 80,
  SCROLL_REVEAL_POINT: 150,
  BACK_TO_TOP_THRESHOLD: 500,
  GITHUB_USERNAME: 'gguatit',
  GITHUB_REPO_LIMIT: 6,
  GITHUB_API_BASE: 'https://api.github.com'
};

// ==============================================
// GITHUB PROJECT INTEGRATION
// ==============================================
const githubProjectsContainer = document.getElementById('github-projects');

function formatNumber(value) {
  return new Intl.NumberFormat('ko-KR').format(value);
}

function formatUpdatedDate(isoDateString) {
  const parsedDate = new Date(isoDateString);

  if (Number.isNaN(parsedDate.getTime())) {
    return '날짜 정보 없음';
  }

  return parsedDate.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

function renderGithubState(message, className) {
  if (!githubProjectsContainer) {
    return;
  }

  githubProjectsContainer.innerHTML = '';
  const notice = document.createElement('p');
  notice.className = className;
  notice.textContent = message;
  githubProjectsContainer.appendChild(notice);
}

function createLanguageTags(languages) {
  const skillsElement = document.createElement('div');
  skillsElement.className = 'skills';

  if (!languages.length) {
    const fallbackTag = document.createElement('span');
    fallbackTag.className = 'skill-tag';
    fallbackTag.textContent = '언어 정보 없음';
    skillsElement.appendChild(fallbackTag);
    return skillsElement;
  }

  languages.forEach(language => {
    const languageTag = document.createElement('span');
    languageTag.className = 'skill-tag';
    languageTag.textContent = language;
    skillsElement.appendChild(languageTag);
  });

  return skillsElement;
}

function createRepositoryCard(repository, languages) {
  const card = document.createElement('article');
  card.className = 'project-card github-project-card';

  const banner = document.createElement('div');
  banner.className = 'repo-banner';
  const githubIcon = document.createElement('i');
  githubIcon.className = 'fa-brands fa-github';
  githubIcon.setAttribute('aria-hidden', 'true');
  banner.appendChild(githubIcon);

  const title = document.createElement('h3');
  title.textContent = repository.name;

  const description = document.createElement('p');
  description.textContent = repository.description || '설명이 등록되지 않은 저장소입니다.';

  const metadata = document.createElement('p');
  metadata.className = 'repo-meta';
  metadata.textContent = `⭐ ${formatNumber(repository.stargazers_count)} · 업데이트 ${formatUpdatedDate(repository.updated_at)}`;

  const actions = document.createElement('div');
  actions.className = 'btns';

  const githubLink = document.createElement('a');
  githubLink.href = repository.html_url;
  githubLink.target = '_blank';
  githubLink.rel = 'noopener noreferrer';
  githubLink.className = 'btn';
  githubLink.innerHTML = '<i class="fab fa-github" aria-hidden="true"></i> GitHub';
  actions.appendChild(githubLink);

  if (repository.homepage) {
    const liveLink = document.createElement('a');
    liveLink.href = repository.homepage;
    liveLink.target = '_blank';
    liveLink.rel = 'noopener noreferrer';
    liveLink.className = 'btn';
    liveLink.innerHTML = '<i class="fas fa-external-link-alt" aria-hidden="true"></i> 라이브 데모';
    actions.appendChild(liveLink);
  }

  card.appendChild(banner);
  card.appendChild(title);
  card.appendChild(description);
  card.appendChild(createLanguageTags(languages));
  card.appendChild(metadata);
  card.appendChild(actions);

  return card;
}

async function fetchRepositoryLanguages(languagesUrl) {
  try {
    const response = await fetch(languagesUrl, {
      headers: {
        Accept: 'application/vnd.github+json'
      }
    });

    if (!response.ok) {
      return [];
    }

    const languageBytes = await response.json();

    return Object.entries(languageBytes)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 4)
      .map(([language]) => language);
  } catch (error) {
    console.error('언어 정보 조회 실패:', error);
    return [];
  }
}

async function loadGithubRepositories() {
  if (!githubProjectsContainer) {
    return;
  }

  const username = githubProjectsContainer.dataset.githubUser || CONFIG.GITHUB_USERNAME;
  const requestedLimit = Number(githubProjectsContainer.dataset.repoLimit);
  const repoLimit = Number.isFinite(requestedLimit) && requestedLimit > 0
    ? requestedLimit
    : CONFIG.GITHUB_REPO_LIMIT;

  renderGithubState('GitHub 저장소를 불러오는 중...', 'github-loading');

  const repositoriesUrl = `${CONFIG.GITHUB_API_BASE}/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=${repoLimit}&type=owner`;

  try {
    const response = await fetch(repositoriesUrl, {
      headers: {
        Accept: 'application/vnd.github+json'
      }
    });

    if (!response.ok) {
      throw new Error(`GitHub API 요청 실패 (${response.status})`);
    }

    const repositories = await response.json();
    const visibleRepositories = repositories.filter(repository => !repository.fork);

    if (!visibleRepositories.length) {
      renderGithubState('표시할 공개 저장소가 없습니다.', 'github-empty');
      return;
    }

    const repositoryCards = await Promise.all(
      visibleRepositories.map(async repository => {
        const fetchedLanguages = await fetchRepositoryLanguages(repository.languages_url);
        const languages = fetchedLanguages.length
          ? fetchedLanguages
          : (repository.language ? [repository.language] : []);

        return createRepositoryCard(repository, languages);
      })
    );

    githubProjectsContainer.innerHTML = '';
    repositoryCards.forEach(card => githubProjectsContainer.appendChild(card));
  } catch (error) {
    console.error('GitHub 저장소 조회 실패:', error);
    renderGithubState('GitHub 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.', 'github-error');
  }
}

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
  loadGithubRepositories();
});
