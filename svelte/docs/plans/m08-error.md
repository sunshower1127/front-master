# M08: 에러 관리 — 주문 실패 & 네트워크 에러

## 목표

주문 플로우에서 발생할 수 있는 에러를 체계적으로 처리. 에러 페이지, 서버/클라이언트 에러 핸들링을 구현한다.

## React와 다른 점

| React 문제 | Svelte 해결 |
|-----------|------------|
| ErrorBoundary를 class component로 직접 구현 | +error.svelte 파일만 생성 |
| 라우트별 에러 UI 분리 어려움 | 파일 기반으로 자연스럽게 분리 |
| 클라이언트 에러 수집 안됨 | hooks.client.ts 내장 |

## 배울 개념

### +error.svelte (라우트별 에러 페이지)

```
routes/
  +error.svelte                    ← 전역 에러 페이지
  (shop)/
    +error.svelte                  ← 쇼핑 영역 에러 (상품 못 찾음 등)
    checkout/
      +error.svelte                ← 주문 전용 에러 (결제 실패 등)
```

```svelte
<!-- routes/(shop)/+error.svelte -->
<script>
  import { page } from '$app/state';
</script>

{#if page.status === 404}
  <h1>상품을 찾을 수 없습니다</h1>
  <a href="/">쇼핑 계속하기</a>
{:else}
  <h1>문제가 발생했습니다</h1>
  <p>{page.error?.message}</p>
{/if}
```

### Expected vs Unexpected 에러

```ts
// routes/(shop)/products/[id]/+page.server.ts
import { error } from '@sveltejs/kit';

export async function load({ params }) {
  const product = await getProduct(params.id);

  if (!product) {
    // Expected: 404 → +error.svelte에서 처리
    error(404, { message: '상품을 찾을 수 없습니다' });
  }

  if (product.stock === 0) {
    // Expected: 품절 안내
    error(410, { message: '품절된 상품입니다' });
  }

  return { product };
}
```

### hooks.server.ts (전역 서버 에러)

```ts
// src/hooks.server.ts
export const handleError = async ({ error, event }) => {
  // Sentry 전송, 로깅 등
  console.error('Server error:', error);

  return {
    message: '서버 오류가 발생했습니다',
    code: 'UNEXPECTED',
  };
};
```

### hooks.client.ts (클라이언트 에러)

```ts
// src/hooks.client.ts
export const handleClientError = async ({ error }) => {
  console.error('Client error:', error);

  return {
    message: '문제가 발생했습니다',
  };
};
```

### 폼 에러 처리 (주문 폼)

```ts
// routes/(shop)/checkout/+page.server.ts
import { fail } from '@sveltejs/kit';

export const actions = {
  default: async ({ request }) => {
    const data = await request.formData();
    const address = data.get('address');

    if (!address) {
      return fail(400, { address, missing: true });
    }

    try {
      await processOrder(data);
    } catch (e) {
      return fail(500, { message: '주문 처리 실패' });
    }
  }
};
```

```svelte
<script>
  let { form } = $props();
</script>

{#if form?.missing}
  <p class="error">배송지를 입력해주세요</p>
{/if}

{#if form?.message}
  <p class="error">{form.message}</p>
{/if}
```

## 과제: 쇼핑몰 에러 처리

### 1단계: 에러 페이지 계층

- 전역 +error.svelte (기본 에러)
- (shop) +error.svelte (상품/쇼핑 에러)
- checkout +error.svelte (주문 에러)

### 2단계: 상품 404

- 존재하지 않는 상품 ID 접근시 404
- "쇼핑 계속하기" 링크로 메인 이동

### 3단계: 주문 폼 검증

- 간단한 주문 페이지 (이름, 주소, 연락처)
- 서버 사이드 검증 (fail 사용)
- 에러 메시지 인라인 표시

### 4단계: 전역 에러 핸들링

- hooks.server.ts, hooks.client.ts 설정
- 의도적으로 unexpected error 발생시켜 잡히는지 확인

### 5단계: E2E 테스트 (Playwright)

전체 주문 플로우를 브라우저에서 자동 테스트한다.

```ts
// tests/checkout.test.ts
import { test, expect } from '@playwright/test';

test('상품 선택 → 장바구니 → 주문 플로우', async ({ page }) => {
  await page.goto('/');

  // 상품 장바구니 담기
  await page.click('text=장바구니 담기');
  await expect(page.locator('.cart-badge')).toHaveText('1');

  // 장바구니 이동
  await page.click('text=장바구니');
  await expect(page).toHaveURL('/cart');

  // 주문 진행
  await page.click('text=주문하기');
  await page.fill('[name=address]', '서울시 강남구');
  await page.click('text=결제');
});

test('존재하지 않는 상품 → 404', async ({ page }) => {
  await page.goto('/products/99999');
  await expect(page.locator('h1')).toContainText('찾을 수 없습니다');
});

test('주문 폼 빈 제출 → 에러 메시지', async ({ page }) => {
  await page.goto('/checkout');
  await page.click('text=결제');
  await expect(page.locator('.error')).toBeVisible();
});
```

- `pnpm exec playwright test` 로 실행
- 핵심 유저 플로우를 E2E로 커버
- 에러 시나리오도 테스트

## 검증

- `/products/99999` 접근시 쇼핑 영역 에러 페이지
- 주문 폼 빈 제출시 에러 메시지 표시
- 에러 페이지 계층이 정상 (하위 우선)
- hooks에서 unexpected error 캐치 확인
- `pnpm run test` — 유닛/컴포넌트 테스트 통과
- `pnpm exec playwright test` — E2E 테스트 통과
