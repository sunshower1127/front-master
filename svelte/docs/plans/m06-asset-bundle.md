# M06: 에셋 & 번들 — 상품 이미지 & 성능 최적화

## 목표

상품 이미지 최적화, 폰트 설정, 코드 스플리팅을 적용. 쇼핑몰의 로딩 속도를 개선한다.

## React와 다른 점

| React 문제 | Svelte 해결 |
|-----------|------------|
| React + ReactDOM ~45KB (gzip) | 런타임 거의 0 |
| React.lazy() 수동 코드 스플리팅 | 라우트별 자동 스플리팅 |
| next/image 같은 프레임워크 의존 | enhanced:img 빌트인 |
| CSS 죽은 코드 수동 관리 | scoped CSS 자동 제거 |

## 배울 개념

### 이미지 최적화

```svelte
<!-- 상품 이미지에 enhanced:img 적용 -->
<enhanced:img src={product.imageUrl} alt={product.name} />
```

빌드 시 자동으로: webp/avif 변환, srcset 생성, lazy loading 적용.

### 자동 코드 스플리팅

```
routes/
  (shop)/+page.svelte           → /  (이 JS만 로드)
  (shop)/products/[id]/+page.svelte → /products/1 (여기 가야 로드)
  (shop)/cart/+page.svelte      → /cart (여기 가야 로드)
```

설정 없이 라우트별 자동 분리.

### Dynamic import (추가 스플리팅)

```svelte
<script>
  let showReviews = $state(false);
  let ReviewsComponent = $state(null);

  async function loadReviews() {
    const module = await import('$lib/components/product/Reviews.svelte');
    ReviewsComponent = module.default;
    showReviews = true;
  }
</script>

<button onclick={loadReviews}>리뷰 보기</button>
{#if showReviews && ReviewsComponent}
  <ReviewsComponent productId={product.id} />
{/if}
```

### 폰트 최적화

```html
<!-- app.html -->
<head>
  <link rel="preload" href="/fonts/pretendard.woff2" as="font" type="font/woff2" crossorigin>
</head>
```

```css
@font-face {
  font-family: 'Pretendard';
  src: url('/fonts/pretendard.woff2') format('woff2');
  font-display: swap;
}
```

- woff2 포맷 (가장 가벼움)
- KR subset (한글만)
- `font-display: swap` (텍스트 먼저 보여주기)

### 번들 분석

```bash
npx vite-bundle-visualizer
```

## 과제: 쇼핑몰 에셋 최적화

### 1단계: 상품 이미지 최적화

- 상품 이미지에 `enhanced:img` 적용
- Network 탭에서 webp/avif 전환 확인
- lazy loading 동작 확인

### 2단계: 폰트 적용

- Pretendard (또는 원하는 한글 폰트) 적용
- preload 설정
- FCP 측정 (preload 전후 비교)

### 3단계: 코드 스플리팅 확인

- Network 탭에서 페이지 이동시 해당 라우트 JS만 로드되는지 확인
- 리뷰 컴포넌트를 dynamic import로 분리

### 4단계: 번들 분석 & Lighthouse

- `vite-bundle-visualizer`로 번들 구성 확인
- Lighthouse Performance 측정
- Slow 3G에서 체감 테스트

## 검증

- `pnpm run build` 후 번들 크기 확인
- Lighthouse Performance 점수 90+
- Network 탭에서 불필요한 JS 로딩 없음
- 이미지가 webp/avif로 서빙되는지 확인
- Slow 3G에서도 3초 이내 FCP
