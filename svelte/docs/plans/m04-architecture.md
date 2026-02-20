# M04: 코드 아키텍처 — 쇼핑몰 구조 잡기

## 목표

기능이 더 늘어나기 전에 프로젝트 구조를 정리한다. Route Group, $lib 구조, 서버 코드 분리를 적용.

## React와 다른 점

| React 문제 | Svelte 해결 |
|-----------|------------|
| 폴더 구조 자유도 높아서 프로젝트마다 다름 | 파일 기반 라우팅이 구조를 강제 |
| FSD, Atomic Design 등 직접 선택 | SvelteKit 추천 구조가 있음 |
| 상태 관리 라이브러리 선택 (redux, zustand...) | .svelte.ts로 끝 |

## 배울 개념

### 쇼핑몰 추천 구조

```
src/
  routes/
    (shop)/                    # 쇼핑 영역
      +layout.svelte           # 상점 레이아웃 (헤더, 카테고리 네비)
      +page.svelte             # / (메인, 상품 목록)
      products/
        [id]/+page.svelte      # /products/:id (상품 상세)
      cart/+page.svelte        # /cart (장바구니)
      checkout/+page.svelte    # /checkout (주문)
    (info)/                    # 정보 페이지
      +layout.svelte           # 심플 레이아웃
      about/+page.svelte       # /about
      contact/+page.svelte     # /contact
    api/                       # API 라우트
      products/+server.ts
      products/[id]/+server.ts

  lib/
    components/
      ui/                      # 범용 UI (Button, Modal, Input...)
      product/                 # 상품 관련 (ProductCard, ProductGrid...)
      cart/                    # 장바구니 관련 (CartItem, CartSummary...)
    stores/                    # 전역 상태
      cart.svelte.ts
    server/                    # 서버 전용 ($lib/server)
      products.ts              # 상품 데이터/DB 로직
    utils/
    types/
```

### Route Group으로 레이아웃 분리

```
routes/
  (shop)/     ← 쇼핑 레이아웃 (헤더 + 장바구니 뱃지 + 카테고리 네비)
  (info)/     ← 심플 레이아웃 (헤더 + 풋터만)
```

괄호 안 이름은 URL에 안 나타남. 순수하게 레이아웃 공유 목적.

### 핵심 원칙

**1. 라우트 파일은 얇게**

```svelte
<!-- routes/(shop)/+page.svelte -->
<script>
  import ProductGrid from '$lib/components/product/ProductGrid.svelte';
  import FilterBar from '$lib/components/product/FilterBar.svelte';
  let { data } = $props();
</script>

<FilterBar categories={data.categories} />
<ProductGrid products={data.products} />
```

**2. $lib/server로 서버 코드 격리**

```ts
// $lib/server/products.ts
// 이 파일은 클라이언트에서 import하면 빌드 에러
export async function getProducts(filters) { ... }
export async function getProductById(id) { ... }
```

**3. 전역 상태는 .svelte.ts**

m02에서 만든 cart.svelte.ts가 이미 이 패턴.

## 과제: 쇼핑몰 구조 리팩토링

### 1단계: Route Group 적용

- m01~m03에서 만든 라우트를 `(shop)` 그룹으로 이동
- `(info)` 그룹 생성 (about, contact 등)
- 각 그룹에 다른 레이아웃 적용

### 2단계: 컴포넌트 정리

- `$lib/components/ui/` — Button, Input 등 범용 컴포넌트 분리
- `$lib/components/product/` — ProductCard, ProductGrid 등
- `$lib/components/cart/` — CartItem, CartSummary 등

### 3단계: 서버 코드 분리

- API 로직을 `$lib/server/`로 이동
- load 함수에서 `$lib/server` import
- 클라이언트에서 `$lib/server` import시 빌드 에러 확인

### 4단계: 타입 정리

- `$lib/types/` — Product, CartItem, Category 등 타입 정의
- 전체 프로젝트에서 공유

### 5단계: 컴포넌트 테스트 (vitest + @testing-library/svelte)

구조를 잡았으니 분리된 컴포넌트를 테스트한다.

```bash
pnpm install -D @testing-library/svelte @testing-library/jest-dom jsdom
```

```ts
// lib/components/product/ProductCard.test.ts
import { render, screen } from '@testing-library/svelte';
import { userEvent } from '@testing-library/user-event';
import ProductCard from './ProductCard.svelte';

it('상품 정보를 올바르게 표시', () => {
  render(ProductCard, {
    props: { product: { id: '1', name: '테스트 상품', price: 15000 } }
  });
  expect(screen.getByText('테스트 상품')).toBeInTheDocument();
  expect(screen.getByText('15,000원')).toBeInTheDocument();
});

it('장바구니 담기 버튼 클릭', async () => {
  render(ProductCard, {
    props: { product: { id: '1', name: '테스트', price: 1000 } }
  });
  await userEvent.click(screen.getByText('장바구니 담기'));
  // cart store에 추가되었는지 확인
});
```

- UI 컴포넌트: 렌더링, 사용자 인터랙션 테스트
- 테스트 파일은 컴포넌트 옆에 배치 (`ProductCard.test.ts`)
- m02에서 만든 스토어 테스트도 리팩토링된 구조에 맞게 이동

## 검증

- Route Group별 레이아웃이 다르게 적용되는지 확인
- $lib/server 코드를 +page.svelte에서 import하면 빌드 에러 나는지 확인
- 기존 기능이 리팩토링 후에도 정상 동작하는지 확인
- `pnpm run test` — 스토어 + 컴포넌트 테스트 전부 통과
- 폴더 구조가 직관적인지 — 새 파일 어디에 넣을지 고민 없이 결정 가능한지
