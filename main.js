// ==============================================
// CONFIGURATION & CONSTANTS
// ==============================================
const CONFIG = {
  EMAIL: 'dev@kalpha.kr',
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
  const skillsElement = document.createElement('div');
  skillsElement.className = 'skills';
  if (!languages.length) return skillsElement;

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
  card.className = 'github-project-card';

  const title = document.createElement('h3');
  title.textContent = repository.name;

  const description = document.createElement('p');
  description.textContent = repository.description || '설명이 없습니다.';

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

async function loadGithubRepositories() {
  if (!githubProjectsContainer) return;

  const username = githubProjectsContainer.dataset.githubUser || CONFIG.GITHUB_USERNAME;
  const repoLimit = CONFIG.GITHUB_REPO_LIMIT;

  renderGithubState('GitHub 저장소를 불러오는 중...', 'github-loading');

  const repositoriesUrl = `${CONFIG.GITHUB_API_BASE}/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=${repoLimit}&type=owner`;

  try {
    const response = await fetch(repositoriesUrl, { headers: { Accept: 'application/vnd.github+json' } });
    if (!response.ok) {
      if (response.status === 403) throw new Error('GitHub API 호출 한도 초과');
      throw new Error(`요청 실패 (${response.status})`);
    }

    const repositories = await response.json();
    const visibleRepositories = repositories.filter(repository => !repository.fork);

    if (!visibleRepositories.length) {
      renderGithubState('표시할 저장소가 없습니다.', 'github-empty');
      return;
    }

    const repositoryCards = await Promise.all(
      visibleRepositories.map(async repository => {
        const fetchedLanguages = await fetchRepositoryLanguages(repository.languages_url);
        const languages = fetchedLanguages.length ? fetchedLanguages : (repository.language ? [repository.language] : []);
        return createRepositoryCard(repository, languages);
      })
    );

    githubProjectsContainer.innerHTML = '';
    repositoryCards.forEach(card => githubProjectsContainer.appendChild(card));
  } catch (error) {
    console.error('GitHub 저장소 조회 실패:', error);
    renderGithubState(`GitHub 정보를 불러오지 못했습니다. (${error.message})`, 'github-error');
  }
}

// ==============================================
// NAVIGATION & SCROLL 
// ==============================================
document.addEventListener("DOMContentLoaded", () => {
  loadGithubRepositories();

  const navLinks = document.querySelectorAll('.nav a');
  const headerOffset = 80;

  navLinks.forEach(link => {
    link.addEventListener('click', e => {
      const targetId = link.getAttribute('href');
      if (targetId.startsWith('#')) {
        e.preventDefault();
        const targetSection = document.querySelector(targetId);
        if (targetSection) {
          window.scrollTo({
            top: targetSection.offsetTop - headerOffset,
            behavior: 'smooth'
          });
        }
      }
    });
  });
});
