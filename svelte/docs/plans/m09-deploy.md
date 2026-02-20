# M09: 배포 — 쇼핑몰 런칭

## 목표

완성된 쇼핑몰을 실제 배포. 환경 변수 설정, adapter 선택, 도메인 연결까지.

## 배울 개념

### Adapter 선택

```bash
# 현재 auto → 배포 타겟에 맞게 변경
pnpm install @sveltejs/adapter-vercel    # Vercel
pnpm install @sveltejs/adapter-node      # Node.js 서버
pnpm install @sveltejs/adapter-static    # 정적 사이트
pnpm install @sveltejs/adapter-cloudflare # Cloudflare
```

```js
// svelte.config.js
import adapter from '@sveltejs/adapter-vercel';

export default {
  kit: {
    adapter: adapter()
  }
};
```

| 용도 | Adapter | 비용 |
|------|---------|------|
| 빠른 배포, 간편 | adapter-vercel | 무료 티어 |
| 엣지 퍼포먼스 | adapter-cloudflare | 무료 티어 |
| 서버 제어 필요 | adapter-node | VPS 비용 |

### 환경 변수

```bash
# .env
PUBLIC_API_URL=https://api.myshop.com   # 클라이언트에서도 접근 가능
SECRET_API_KEY=sk-xxx                     # 서버에서만 접근 가능
```

```ts
// 서버 코드
import { SECRET_API_KEY } from '$env/static/private';
import { PUBLIC_API_URL } from '$env/static/public';

// 클라이언트 코드
import { PUBLIC_API_URL } from '$env/static/public';
// SECRET_API_KEY는 import 불가 (빌드 에러)
```

`PUBLIC_` 접두사가 없으면 서버 전용. 실수로 시크릿 노출 불가.

### Vercel 배포

```bash
# 1. GitHub에 푸시
git init && git add . && git commit -m "init"
gh repo create my-shop --public --push

# 2. Vercel CLI
pnpm install -g vercel
vercel

# 또는 vercel.com에서 GitHub repo 연결 (push시 자동 배포)
```

### 도메인 연결

1. 도메인 구매 (Cloudflare, Namecheap 등)
2. 배포 플랫폼에서 커스텀 도메인 설정
3. DNS에 CNAME 또는 A 레코드 추가
4. SSL은 자동 (Vercel, Cloudflare 모두)

## 과제: 쇼핑몰 배포

### 1단계: 프로덕션 빌드 확인

```bash
pnpm run build
pnpm run preview
```

- 프리뷰에서 전체 기능 동작 확인
- 빌드 에러/경고 해결

### 2단계: 환경 변수 분리

- `.env`에 환경 변수 설정
- `PUBLIC_` vs 비공개 변수 분리 확인
- `.env`가 `.gitignore`에 있는지 확인

### 3단계: 배포

- GitHub에 푸시
- Vercel (또는 선택한 플랫폼)에 배포
- 배포된 URL에서 정상 동작 확인

### 4단계: 최종 점검

- Lighthouse 전체 점수 확인
- 시크릿 변수가 클라이언트 번들에 없는지 확인
- 모바일에서 테스트
- (선택) 커스텀 도메인 연결

## 검증

- 배포된 URL에서 전체 기능 정상 동작
- Lighthouse Performance 90+, SEO 90+, Accessibility 90+
- 환경 변수 올바르게 적용
- 소스맵/Network 탭에서 시크릿 노출 없음
