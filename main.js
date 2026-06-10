// ==============================================
// CONFIGURATION & CONSTANTS
// ==============================================
const CONFIG = {
  EMAIL: 'dev@kalpha.kr',
  GITHUB_USERNAME: 'gguatit',
  GITHUB_REPO_LIMIT: 6,
  GITHUB_API_BASE: 'https://api.github.com',
  GITHUB_PINNED_API: 'https://gh-pinned-repos-tsj7ta5xfhep.deno.dev'
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
  if (Number.isNaN(parsedDate.getTime())) return '날짜 정보 없음';
  return parsedDate.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

function renderGithubState(message, className) {
  if (!githubProjectsContainer) return;
  githubProjectsContainer.innerHTML = '';
  const notice = document.createElement('div');
  notice.className = className;
  notice.textContent = message;
  githubProjectsContainer.appendChild(notice);
}

function createLanguageTags(languages) {
  const tagsEl = document.createElement('div');
  tagsEl.className = 'repo-tags';
  if (!languages.length) return tagsEl;

  languages.forEach(language => {
    const languageTag = document.createElement('span');
    languageTag.className = 'skill-tag';
    languageTag.textContent = language;
    tagsEl.appendChild(languageTag);
  });
  return tagsEl;
}

function createRepositoryCard(repository, languages) {
  const card = document.createElement('article');
  card.className = 'github-project-card';

  const title = document.createElement('h3');
  title.textContent = repository.name;

  const description = document.createElement('p');
  description.textContent = repository.description || '설명이 없습니다.';

  const metadata = document.createElement('p');
  metadata.className = 'repo-meta';
  const updatedStr = repository.updated_at ? `업데이트 ${formatUpdatedDate(repository.updated_at)}` : 'Pinned';
  metadata.textContent = `⭐ ${formatNumber(repository.stargazers_count)} · ${updatedStr}`;

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
    liveLink.innerHTML = '<i class="fas fa-external-link-alt" aria-hidden="true"></i> 데모';
    actions.appendChild(liveLink);
  }

  card.appendChild(title);
  card.appendChild(description);
  card.appendChild(createLanguageTags(languages));
  card.appendChild(metadata);
  card.appendChild(actions);

  return card;
}

async function fetchRepositoryLanguages(languagesUrl) {
  try {
    const response = await fetch(languagesUrl, { headers: { Accept: 'application/vnd.github+json' } });
    if (!response.ok) return [];
    const languageBytes = await response.json();
    return Object.entries(languageBytes).sort(([, a], [, b]) => b - a).slice(0, 4).map(([language]) => language);
  } catch (error) {
    return [];
  }
}

async function fetchRepoDetails(owner, repo) {
  const url = `${CONFIG.GITHUB_API_BASE}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;
  const response = await fetch(url, { headers: { Accept: 'application/vnd.github+json' } });
  if (!response.ok) return null;
  return response.json();
}

async function loadPinnedRepositories(username) {
  const pinnedUrl = `${CONFIG.GITHUB_PINNED_API}/?username=${encodeURIComponent(username)}`;
  const response = await fetch(pinnedUrl);
  if (!response.ok) return null;
  const data = await response.json();
  return data.length ? data : null;
}

async function loadRepositoriesFallback(username) {
  const repoLimit = CONFIG.GITHUB_REPO_LIMIT;
  const url = `${CONFIG.GITHUB_API_BASE}/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=${repoLimit}&type=owner`;
  const response = await fetch(url, { headers: { Accept: 'application/vnd.github+json' } });
  if (!response.ok) {
    if (response.status === 403) throw new Error('GitHub API 호출 한도 초과');
    throw new Error(`요청 실패 (${response.status})`);
  }
  const repos = await response.json();
  return repos.filter(r => !r.fork);
}

function pinnedToCardData(pinned) {
  return {
    name: pinned.repo,
    description: pinned.description || '설명이 없습니다.',
    html_url: pinned.link,
    homepage: pinned.website || '',
    stargazers_count: pinned.stars || 0,
    language: pinned.language || null,
    updated_at: null
  };
}

async function loadGithubRepositories() {
  if (!githubProjectsContainer) return;

  const username = githubProjectsContainer.dataset.githubUser || CONFIG.GITHUB_USERNAME;
  renderGithubState('GitHub 저장소를 불러오는 중...', 'github-loading');

  try {
    const pinnedRepos = await loadPinnedRepositories(username);

    if (pinnedRepos) {
      const cards = pinnedRepos.map(pinned => {
        const repo = pinnedToCardData(pinned);
        const languages = repo.language ? [repo.language] : [];
        return createRepositoryCard(repo, languages);
      });

      githubProjectsContainer.innerHTML = '';
      cards.forEach(card => githubProjectsContainer.appendChild(card));
      setupCardTilt();
      return;
    }

    const repositories = await loadRepositoriesFallback(username);

    if (!repositories.length) {
      renderGithubState('표시할 저장소가 없습니다.', 'github-empty');
      return;
    }

    const repositoryCards = await Promise.all(
      repositories.map(async repository => {
        const fetchedLanguages = await fetchRepositoryLanguages(repository.languages_url);
        const languages = fetchedLanguages.length ? fetchedLanguages : (repository.language ? [repository.language] : []);
        return createRepositoryCard(repository, languages);
      })
    );

    githubProjectsContainer.innerHTML = '';
    repositoryCards.forEach(card => githubProjectsContainer.appendChild(card));
    setupCardTilt();
  } catch (error) {
    console.error('GitHub 저장소 조회 실패:', error);
    renderGithubState(`GitHub 정보를 불러오지 못했습니다. (${error.message})`, 'github-error');
  }
}

// ==============================================
// SCROLL REVEAL
// ==============================================
function setupScrollReveal() {
  const revealEls = document.querySelectorAll('.reveal, .reveal-up');

  if (!revealEls.length) return;

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px'
    });

    revealEls.forEach(el => revealObserver.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('revealed'));
  }
}

// ==============================================
// CARD MOUSE TILT
// ==============================================
function setupCardTilt() {
  if (!window.matchMedia('(hover: hover)').matches) return;

  const cards = document.querySelectorAll('.github-project-card');

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const rotateX = ((y - cy) / cy) * -6;
      const rotateY = ((x - cx) / cx) * 6;
      const mx = (x / rect.width) * 100;
      const my = (y / rect.height) * 100;

      card.style.setProperty('--mx', `${mx}%`);
      card.style.setProperty('--my', `${my}%`);
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-3px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
      card.style.setProperty('--mx', '50%');
      card.style.setProperty('--my', '50%');
    });
  });
}

// ==============================================
// PROGRESS BAR
// ==============================================
function setupProgressBar() {
  const progressBar = document.querySelector('.progress-bar');
  if (!progressBar) return;

  function update() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = `${Math.min(scrolled, 100)}%`;
  }

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => { update(); ticking = false; });
      ticking = true;
    }
  });
  update();
}

// ==============================================
// LIVE CLOCK (KST)
// ==============================================
function setupLiveClock() {
  const clock = document.querySelector('.live-clock');
  if (!clock) return;

  function update() {
    const now = new Date();
    const kst = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
    const hh = String(kst.getHours()).padStart(2, '0');
    const mm = String(kst.getMinutes()).padStart(2, '0');
    const ss = String(kst.getSeconds()).padStart(2, '0');
    clock.textContent = `KST ${hh}:${mm}:${ss}`;
  }

  update();
  setInterval(update, 1000);
}

// ==============================================
// NAVIGATION SMOOTH SCROLL
// ==============================================
function setupNavScroll() {
  const navLinks = document.querySelectorAll('.nav a');
  const headerOffset = 80;

  navLinks.forEach(link => {
    link.addEventListener('click', e => {
      const targetId = link.getAttribute('href');
      if (targetId.startsWith('#')) {
        e.preventDefault();
        const targetSection = document.querySelector(targetId);
        if (targetSection) {
          window.scrollTo({ top: targetSection.offsetTop - headerOffset, behavior: 'smooth' });
        }
      }
    });
  });
}

// ==============================================
// BOOT
// ==============================================
document.addEventListener('DOMContentLoaded', () => {
  setupScrollReveal();
  setupProgressBar();
  setupLiveClock();
  setupNavScroll();
  loadGithubRepositories();
});
