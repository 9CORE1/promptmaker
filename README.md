# 🪄 Prompt Studio (프롬프트 메이커)

> **AI Video & Image Prompt Studio**는 크리에이터와 마케터를 위한 고품질 AI 비디오 및 이미지 프롬프트 생성 도구입니다. 복잡하고 추상적인 프롬프트 작성 과정을 논리적이고 세분화된 단계별(Step-by-Step) 입력 폼으로 변환하여, 사용자가 원하는 AI 비주얼 결과물을 손쉽게 설계할 수 있도록 지원합니다.

---

## 🚀 주요 기능 (Key Features)

### 1. 🎬 비디오 & 이미지 멀티 모드 지원
- **비디오 모드 (9단계 입력 + 최종 조립 = 총 10단계)**
  - 상품 연출 광고, 영화적 서사 연출, 감성 일상 브이로그 등 실무 비디오 제작 목적에 맞춤화된 가이드 제공.
- **이미지 모드 (7단계 입력 + 최종 조립 = 총 8단계)**
  - 방송 & 미디어 포스터/썸네일, 소셜 미디어 마케팅 그래픽, 브랜드 키 비주얼 & 제품 광고 등 마케팅/디자인 용도에 최적화된 가이드 제공.

### 2. 📝 체계적인 단계별 세부 설정 (Step-by-Step UI)
- **기획부터 연출(카메라, 렌즈, 조명, 구도), 오디오, 금지 요소(Negative) 설정까지**: 영상 길이, 비율, 장르, 인물(나이, 외모, 피부, 메이크업 등), 의상, 제품/소품 정보, 장소 및 조명, 촬영 기법, 타임라인(비디오 전용), 오디오, 부정 프롬프트 등 AI 생성 엔진에 필요한 모든 필수 변수를 세분화하여 입력할 수 있습니다.
- **설정 제어 최적화**: 제작 목적(템플릿), 프리셋 불러오기, 작가 스타일 레퍼런스 선택 기능은 입력 혼선을 줄이기 위해 **Step 01(기본 정보) 단계에서만 노출 및 설정 가능**하도록 설계되어 있습니다.
- **필수 항목 표시 및 디폴트 처리**: 필수 입력 항목 외의 빈 칸은 최종 조립 시 자동으로 `'없음'`으로 처리되어 깔끔한 프롬프트를 유지합니다.

### 3. 🔍 실시간 프롬프트 프리뷰 (Live Preview)
- 사용자가 필드를 입력하거나 태그를 선택할 때마다 우측 영역에서 조립 과정을 실시간으로 확인할 수 있어, 최종 결과물이 어떻게 빌드되는지 즉각 파악 가능합니다.

### 4. 💡 전문 용어 툴팁 사전 (Professional Tooltips)
- 촬영 기법(광각, 표준, 망원 렌즈, 아웃포커싱, 보케 등), 라이팅(백라이트, 소프트박스, 림라이트 등), 오디오(ASMR, 로파이 등)의 전문적인 용어를 마우스 오버(Hover) 시 설명해주는 상세 툴팁 기능이 내장되어 있습니다.

### 5. ⚡ 원클릭 프리셋 및 예시 자동 완성 (Presets & Autofill)
- **전체 예시 채우기 / 현재 단계 예시 채우기**: 작성에 어려움을 느끼는 사용자를 위해 단 한 번의 클릭으로 전체 또는 현재 단계의 입력 필드를 전문가 수준의 예시 데이터로 즉시 채울 수 있습니다.
- **목적별 완성형 프리셋**: 각 모드 및 목적별로 세분화된 30종 이상의 완성형 프리셋 데이터를 탑재하여, 원하는 레퍼런스를 즉시 불러와 수정할 수 있습니다.

### 6. 🎨 작가 스타일 레퍼런스 (Artist Style Database)
- 웨스 앤더슨(Wes Anderson), 리들리 스콧(Ridley Scott), 왕가위(Wong Kar-wai) 등 영화 및 디자인 거장 20인의 스타일 라이브러리를 내장했습니다. 선택 시 해당 작가의 특징 키워드와 안전한 프롬프트 표현법을 필드에 자동으로 융합하며, 사이드바에 레퍼런스 카드를 시각화합니다.

### 7. 🌗 다크/라이트 테마 토글 (Dark/Light Theme)
- 사용자의 눈 피로를 덜어주기 위해 미려한 다크 모드와 라이트 모드 전환 인터페이스를 제공합니다.

---

## 📂 프로젝트 구조 (Project Structure)

- [index.html](file:///C:/Users/HRDPRO/Documents/promptmaker/index.html): 메인 웹 페이지 인터페이스 구조 및 UI 레이아웃
- [style.css](file:///C:/Users/HRDPRO/Documents/promptmaker/style.css): 모던 다크 모드/라이트 모드, 그래디언트 애니메이션 스타일시트
- [app.js](file:///C:/Users/HRDPRO/Documents/promptmaker/app.js): 양식 동적 렌더링, 툴팁, 프리셋 로드, 실시간 프리뷰 등 핵심 프론트 로직
- [configs.js](file:///C:/Users/HRDPRO/Documents/promptmaker/configs.js): 비디오/이미지 단계별 필드 설정, 작가 스타일 정보 및 조립 템플릿
- [presets.js](file:///C:/Users/HRDPRO/Documents/promptmaker/presets.js): 비디오/이미지 목적별 30종 이상의 풍부한 고화질 템플릿 프리셋 데이터
- [package.json](file:///C:/Users/HRDPRO/Documents/promptmaker/package.json): 프로젝트 메타데이터 및 로컬 개발 서버 스크립트
- [process.txt](file:///C:/Users/HRDPRO/Documents/promptmaker/process.txt): 비디오 프롬프트 설계 프로세스 참고 텍스트
- [image_prompt_analysis.txt](file:///C:/Users/HRDPRO/Documents/promptmaker/image_prompt_analysis.txt): 이미지 프롬프트 설계 규칙 분석 리포트

---

## 🛠️ 기술 스택 (Tech Stack)

- **Frontend Core**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **Design & Icons**: FontAwesome 6.4.0 (Vector Icons)
- **Typography**: Google Fonts (Outfit, Noto Sans KR, JetBrains Mono)
- **Local Dev Server**: `lite-server` (Node.js 기반 개발용 정적 서버)

---

## 💻 실행 및 설치 방법 (Getting Started)

프로젝트를 로컬 환경에서 구동하려면 다음 단계를 진행하세요.

1. **저장소 클론 또는 프로젝트 디렉토리 이동**
   ```bash
   cd promptmaker
   ```

2. **의존성 라이브러리 설치**
   - 개발 서버 구동용 `lite-server` 패키지를 설치합니다.
   ```bash
   npm install
   ```

3. **로컬 서버 실행**
   ```bash
   npm run dev
   ```
   - 명령어가 성공적으로 실행되면 브라우저에 `http://localhost:3000` 주소로 자동으로 창이 열리며 웹 인터페이스가 구동됩니다.

---

## 📜 기획 배경 및 분석 자료

서비스 설계에 활용된 세부 구조와 규칙 분석은 아래 문서를 참조하십시오.
- [비디오 프롬프트 제작 프로세스 가이드](file:///C:/Users/HRDPRO/Documents/promptmaker/process.txt)
- [이미지 생성 프롬프트 구조 분석 리포트](file:///C:/Users/HRDPRO/Documents/promptmaker/image_prompt_analysis.txt)
