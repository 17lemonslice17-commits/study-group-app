# 스터디 모임 관리 서비스

## 프로젝트 소개
(나중에 기획서 작성하면서 채워넣을 예정)

## 기술 스택
- Frontend: React
- Backend: Node.js, Express
- DB: PostgreSQL

## 개발 진행 상황
- [x] 개발 환경 세팅
- [ ] 기획서 & ERD 작성
- [ ] DB 설계
- [ ] 백엔드 API 구현
- [ ] 프론트엔드 구현
- [ ] 배포

## 배포 재현 가이드

크레딧 절약을 위해 배포를 내려둔 상태입니다. 데모가 필요할 때 아래 순서로 재배포하세요.

### 1. DB (Railway - Postgres)
1. railway.app → New Project → Provision PostgreSQL
2. Connect 탭 → Public Network 토글 켜기 → `DATABASE_PUBLIC_URL` 복사
3. 로컬에서 스키마 적용:
```bash
   psql "복사한_DATABASE_PUBLIC_URL" -f docs/schema.sql
```
4. 확인 후 Public Network 토글 다시 끄기 (보안)

### 2. 백엔드 (Railway)
**중요: DB와 같은 프로젝트 안에 만들어야 함** (`${{Postgres.DATABASE_URL}}` 참조가 같은 프로젝트 내에서만 작동)

1. 같은 프로젝트에서 + New → GitHub Repo → 이 저장소 선택
2. Settings → Source → Root Directory: `/server`
3. Variables 탭에서 추가:
   - `DATABASE_URL` = `${{Postgres.DATABASE_URL}}`
   - `JWT_SECRET` = (로컬 server/.env 파일 참고, 없으면 `openssl rand -hex 32`로 새로 생성)
   - `NODE_ENV` = `production`
   - `PORT` = `4000`
4. Settings → Networking → Generate Domain → 포트 `4000` 입력
5. 확인: `curl https://발급주소/health` → `{"status":"ok"}` 나오면 성공

### 3. 프론트엔드 (Vercel)
1. vercel.com → Add New → Project → 이 저장소 선택
2. Root Directory: `client`
3. Environment Variables 추가:
   - Key: `VITE_API_URL`
   - Value: `https://[2단계에서 발급받은 Railway 주소]/api`
   - Type: **Config** (Secret 아님 — Secret으로 하면 브라우저에서 못 읽음)
4. Deploy

### 4. CORS 최종 확인
`server/src/index.js`의 `app.use(cors({ origin: [...] }))`에 Vercel 배포 주소(`https://xxx.vercel.app`)가 들어있는지 확인. 주소가 바뀌었다면 수정 후 커밋/푸시.

### 자주 겪었던 문제
- Railway `${{Postgres.DATABASE_URL}}`이 빈 값 → DB와 백엔드가 다른 프로젝트에 있는 경우. 반드시 같은 프로젝트 안에 생성.
- `Cannot find module '/app/index.js'` → `package.json`에 `"start": "node src/index.js"` 스크립트 누락 또는 JSON 문법 오류(콤마 누락 등).
- 환경변수 바꿔도 반영 안 됨 → 저장 후 재배포 필요. Vercel은 캐시 끄고 Redeploy.
- CORS 에러인데 알고보니 URL 자체가 틀림 → 브라우저 Network 탭에서 실제 요청 주소부터 확인.

### 다시 내릴 때
- Railway: 프로젝트 → Settings → Danger → Delete Project (DB 데이터도 같이 삭제되니 필요하면 백업)
- Vercel: 무료 플랜은 켜둬도 비용 거의 없음, 그대로 둬도 무방
