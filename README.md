# Kalpha_Dev Portfolio

> 풀스택 개발자 및 보안 전문가의 프로젝트 중심 포트폴리오 웹사이트

[![Live Demo](https://img.shields.io/badge/demo-live-success?style=flat-square)](https://kalpha.kr) [![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE) [![GitHub Stars](https://img.shields.io/github/stars/gguatit/portofolio-main?style=flat-square)](https://github.com/gguatit/portofolio-main/stargazers)

## 소개

프론트엔드부터 백엔드, 서버 구축, 네트워크 보안까지 다루는 풀스택 개발자 Kalpha_Dev의 포트폴리오 웹사이트입니다. 불필요한 장식을 배제하고 **핵심 프로젝트**를 한눈에 확인할 수 있도록 최적화된 1페이지 레이아웃을 제공합니다.

## 주요 기능

- **즉시 로딩**: 불필요한 로딩 애니메이션을 제거하여 접속 시 콘텐츠가 즉시 노출됩니다.
- **프로젝트 중심 레이아웃**: 주요 작업물을 효과적으로 보여주기 위한 2열 그리드 배치를 적용했습니다.
- **반응형 디자인**: 모바일(`768px` 이하) 1열 배치, 데스크톱 2열 배치로 모든 디바이스에 최적화된 사용자 경험을 제공합니다.
- **접근성 및 성능 최적화**: 시맨틱 markup, 이미지 지연 로딩 등을 통해 웹 표준과 성능을 준수합니다.
- **SEO 최적화**: 메타 태그 및 JSON-LD를 통해 검색 엔진 노출을 강화했습니다.

## 기술 스택

### Frontend
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)

### Backend & Cloud
![Cloudflare Workers](https://img.shields.io/badge/Cloudflare_Workers-F38020?style=flat-square&logo=cloudflare&logoColor=white)
![WebSocket](https://img.shields.io/badge/WebSocket-010101?style=flat-square&logo=socket.io&logoColor=white)

## 프로젝트 구조

```
portofolio-main/
├── index.html          # 메인 HTML 파일 (프로젝트 중심 구성)
├── style.css           # 스타일시트 (Flexbox & Grid 레이아웃)
├── main.js             # JavaScript 로직 (최소화 및 성능 최적화)
├── robots.txt          # 검색 엔진 크롤러 설정
├── sitemap.xml         # 사이트맵
└── images/             # 이미지 리소스 (lazy loading 적용)
```

## 주요 수록 프로젝트

- **포트폴리오 웹사이트**: 현재 이 웹사이트의 기획 및 개발 내역을 소개합니다. (HTML/CSS/JS)
- **익명채팅 앱**: 실시간 익명 통신을 지원하는 웹 애플리케이션입니다. (Cloudflare Workers/WebSocket)
- **Kalpha's API**: 실용적인 기능을 제공하는 공용 API 프로젝트입니다. (TypeScript)

## 로컬 개발

```bash
# 저장소 클론
git clone https://github.com/gguatit/portofolio-main.git

# 디렉토리 이동
cd portofolio-main

# 로컬 서버 실행
npx http-server -p 8000
```

## 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 연락처

- **개발자**: Kalpha_Dev
- **이메일**: dev@kalpha.kr
- **GitHub**: [@gguatit](https://github.com/gguatit)
- **웹사이트**: [https://kalpha.kr](https://kalpha.kr)

---

**Focusing on Code and Security by Kalpha_Dev**
