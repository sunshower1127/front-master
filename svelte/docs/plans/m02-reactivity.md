# M02: 리액티비티 — 장바구니 & 필터/정렬

## 목표

장바구니 시스템과 상품 필터/정렬을 구현하면서 Svelte의 깊은 리액티비티와 전역 상태를 익힌다.

## React와 다른 점

| React 문제 | Svelte 해결 |
|-----------|------------|
| useCallback으로 함수 메모이제이션 | 필요 없음. 컴파일러가 처리 |
| useMemo로 파생값 메모이제이션 | `$derived`가 자동 추적 |
| useEffect dependency array 실수 | 자동 추적. 배열 없음 |
| Context + useReducer 조합 복잡 | `.svelte.ts` 파일로 전역 상태 간단하게 |
| 불변성 유지 (spread, map, filter) | 직접 변경 가능 (push, splice 등) |

## 배울 개념

### 깊은 리액티비티 (Deep Reactivity)

```svelte
<script>
  // React: setItems([...items, newItem]) — 불변성 유지 필수
  // Svelte: 그냥 push 하면 됨
  let items = $state([]);
  items.push({ name: '상품', price: 1000 }); // UI 자동 업데이트
</script>
```

### 전역 상태 (.svelte.ts)

```typescript
// lib/stores/cart.svelte.ts
class CartStore {
  items = $state<CartItem[]>([]);

  get total() {
    return this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  add(product: Product) {
    const existing = this.items.find(i => i.id === product.id);
    if (existing) {
      existing.quantity++;
    } else {
      this.items.push({ ...product, quantity: 1 });
    }
  }

  remove(id: string) {
    this.items = this.items.filter(i => i.id !== id);
  }
}

export const cart = new CartStore();
```

React의 Context + useReducer + Provider 패턴이 클래스 하나로 끝남.

### $derived.by (복잡한 파생값)

```svelte
<script>
  let products = $state(allProducts);
  let sortBy = $state('price');
  let category = $state('all');

  let filtered = $derived.by(() => {
    let result = products;
    if (category !== 'all') {
      result = result.filter(p => p.category === category);
    }
    return result.toSorted((a, b) =>
      sortBy === 'price' ? a.price - b.price : a.name.localeCompare(b.name)
    );
  });
</script>
```

### 심화: children 합성 → snippet

```svelte
<!-- Card.svelte -->
<script>
  let { header, children } = $props();
</script>

<div class="card">
  <div class="header">{@render header()}</div>
  <div class="body">{@render children()}</div>
</div>

<!-- 사용처 -->
<Card>
  {#snippet header()}
    <h2>상품명</h2>
  {/snippet}
  <p>상품 설명</p>
</Card>
```

## 과제: 장바구니 & 필터

### 1단계: 전역 장바구니 스토어

- `lib/stores/cart.svelte.ts` 생성
- 상품 추가/제거/수량 변경
- 총 개수, 총 금액을 `$derived`로 계산
- m01의 ProductCard에서 "장바구니 담기" 버튼 연결

### 2단계: 장바구니 페이지

- `/cart` 라우트 생성
- 장바구니 아이템 목록, 수량 변경, 삭제
- 총 금액 표시
- 빈 장바구니일 때 빈 상태 UI

### 3단계: 상품 필터/정렬

- 카테고리 필터 (전체, 전자기기, 의류, 식품 등)
- 정렬 (가격 낮은순, 높은순, 이름순)
- 가격 범위 필터 (min~max)
- 필터 결과 개수 표시 (`$derived`)
- 필터 변경 시 URL 파라미터 반영 (뒤로가기 지원)

### 4단계: 헤더에 장바구니 뱃지

- 전역 레이아웃에 헤더 추가
- 장바구니 아이콘 + 담긴 개수 뱃지
- 어떤 페이지에서든 실시간 반영

### 5단계: 장바구니 스토어 유닛 테스트 (vitest 입문)

여기서 처음으로 테스트를 작성한다. 스토어는 순수 로직이라 테스트하기 가장 좋은 시작점.

```ts
// lib/stores/cart.svelte.test.ts
import { describe, it, expect } from 'vitest';
import { cart } from './cart.svelte';

describe('CartStore', () => {
  it('상품 추가시 items에 포함', () => {
    cart.add({ id: '1', name: '테스트', price: 1000 });
    expect(cart.items.length).toBe(1);
  });

  it('같은 상품 추가시 수량 증가', () => {
    cart.add({ id: '1', name: '테스트', price: 1000 });
    expect(cart.items[0].quantity).toBe(2);
  });

  it('총액 계산', () => {
    expect(cart.total).toBe(2000);
  });
});
```

- `pnpm run test` 로 vitest 실행
- 장바구니 add, remove, 수량 변경, 총액 계산 테스트
- 엣지 케이스: 빈 장바구니, 수량 0 이하 방지

## 검증

- 상품 페이지에서 장바구니 담기 → 장바구니 페이지에서 확인
- 수량 변경/삭제 시 총액 자동 업데이트
- 필터/정렬 변경 시 목록 즉시 반영
- `console.log`로 불필요한 리렌더가 없는지 확인
- `pnpm run test` — 장바구니 스토어 테스트 전부 통과
