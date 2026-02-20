# M03: 데이터 패칭 — 상품 API & 카테고리

## 목표

하드코딩된 상품 데이터를 서버 사이드 load 함수로 전환. SvelteKit의 데이터 패칭 패턴을 익힌다.

## React와 다른 점

| React 문제 | Svelte 해결 |
|-----------|------------|
| useEffect에서 fetch → waterfall | load 함수: 서버에서 병렬 fetch |
| loading/error state 수동 관리 | load가 데이터를 보장. {#await}로 스트리밍 |
| tanstack-query 같은 라이브러리 필요 | 프레임워크 내장 |
| 클라이언트에서만 fetch → SEO 불리 | 서버에서 fetch → HTML에 포함 |

## 배울 개념

### load 함수 기본

```ts
// routes/products/+page.server.ts
export async function load({ fetch }) {
  const products = await fetch('/api/products').then(r => r.json());
  return { products };
}
```

```svelte
<!-- routes/products/+page.svelte -->
<script>
  let { data } = $props();
  // data.products가 이미 있음. loading state 필요 없음.
</script>
```

### 병렬 fetch

```ts
export async function load({ fetch }) {
  const [products, categories] = await Promise.all([
    fetch('/api/products').then(r => r.json()),
    fetch('/api/categories').then(r => r.json()),
  ]);
  return { products, categories };
}
```

### Streaming (느린 API 대응)

```ts
export async function load({ fetch }) {
  const products = await fetch('/api/products').then(r => r.json());
  return {
    products,
    recommendations: fetch('/api/recommendations').then(r => r.json()),
  };
}
```

```svelte
{#await data.recommendations}
  <p>추천 상품 로딩중...</p>
{:then items}
  {#each items as item}
    <ProductCard product={item} />
  {/each}
{:catch}
  <p>추천 상품을 불러올 수 없습니다</p>
{/await}
```

### API 라우트 (+server.ts)

```ts
// routes/api/products/+server.ts
import { json } from '@sveltejs/kit';

export async function GET({ url }) {
  const category = url.searchParams.get('category');
  const products = await getProducts({ category });
  return json(products);
}
```

### Prefetch & Revalidation

```svelte
<!-- 호버시 자동 prefetch -->
<a href="/products/123">상품 보기</a>
```

```ts
import { invalidateAll } from '$app/navigation';
// 장바구니 변경 후 관련 데이터 새로고침
await invalidateAll();
```

## 과제: 상품 데이터를 API로 전환

### 1단계: 상품 API 라우트

- `/api/products/+server.ts` 생성 (mock 데이터 반환)
- 카테고리 필터, 정렬 파라미터 지원
- `/api/products/[id]/+server.ts` 개별 상품

### 2단계: load 함수로 전환

- m01~m02에서 하드코딩한 상품 데이터를 load 함수로 교체
- 상품 목록 + 카테고리를 병렬 fetch

### 3단계: 상품 상세 페이지

- `/products/[id]` 동적 라우트 생성
- load 함수에서 개별 상품 데이터 로딩
- 상품이 없으면 404 처리

### 4단계: 스트리밍 적용

- 메인 상품은 바로 표시
- 추천 상품/리뷰는 느린 API로 시뮬레이션 → 스트리밍

### 5단계: Prefetch 확인

- 상품 목록에서 상품 카드 호버시 상세 데이터가 미리 로드되는지 Network 탭 확인

## 검증

- Network 탭에서 병렬 fetch 확인 (waterfall 없음)
- 페이지 소스 보기에서 HTML에 상품 데이터 포함 (SSR 동작)
- 스트리밍: 메인 콘텐츠 먼저 표시, 느린 데이터 나중에 채워짐
- 상품 카드 hover시 prefetch 발생 확인
