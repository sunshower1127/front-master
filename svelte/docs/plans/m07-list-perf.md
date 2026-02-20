# M07: 리스트 퍼포먼스 — 대량 상품 목록 & 무한스크롤

## 목표

상품이 수백~수천 개일 때의 성능 문제를 해결. 가상 스크롤, key 최적화, 애니메이션을 적용한다.

## 공통 문제 (React/Svelte 모두)

몇백 개 아이템만 렌더해도 렉. 단, Svelte가 기본적으로 더 가벼움:
- Virtual DOM diff 없음
- 컴포넌트가 가벼운 vanilla JS로 컴파일
- → 같은 수의 상품을 렌더해도 Svelte가 빠름. 하지만 수천 개면 여전히 가상화 필요.

## 배울 개념

### {#each}의 key

```svelte
<!-- key 없음: 필터 변경시 전체 DOM 재생성 가능 -->
{#each products as product}
  <ProductCard {product} />
{/each}

<!-- key 있음: 변경된 상품만 업데이트 -->
{#each products as product (product.id)}
  <ProductCard {product} />
{/each}
```

key는 항상 넣기. 특히 필터/정렬이 있는 상품 목록에서 필수.

### 가상 스크롤 (직접 구현)

```svelte
<script>
  let { items, itemHeight = 280 } = $props();

  let scrollTop = $state(0);
  let containerHeight = $state(0);

  let startIndex = $derived(Math.floor(scrollTop / itemHeight));
  let endIndex = $derived(
    Math.min(startIndex + Math.ceil(containerHeight / itemHeight) + 1, items.length)
  );
  let visibleItems = $derived(items.slice(startIndex, endIndex));
  let totalHeight = $derived(items.length * itemHeight);
  let offsetY = $derived(startIndex * itemHeight);
</script>

<div
  class="container"
  bind:clientHeight={containerHeight}
  onscroll={(e) => scrollTop = e.currentTarget.scrollTop}
>
  <div style="height: {totalHeight}px">
    <div style="transform: translateY({offsetY}px)">
      {#each visibleItems as product (product.id)}
        <ProductCard {product} />
      {/each}
    </div>
  </div>
</div>
```

### 라이브러리 사용 (@tanstack/svelte-virtual)

```bash
pnpm install @tanstack/svelte-virtual
```

React에서 @tanstack/react-virtual 쓰던 것과 동일한 API.

### 애니메이션

```svelte
<script>
  import { flip } from 'svelte/animate';
  import { fade } from 'svelte/transition';
</script>

{#each products as product (product.id)}
  <div animate:flip={{ duration: 300 }} transition:fade>
    <ProductCard {product} />
  </div>
{/each}
```

필터/정렬 변경시 상품 카드가 부드럽게 재배치됨. 단, 수백 개에서는 가상화된 목록에서만 적용할 것.

## 과제: 대량 상품 목록

### 1단계: 성능 기준 측정

- 1000개 상품 mock 데이터 생성
- 가상화 없이 전체 렌더링
- DevTools Performance 탭에서 초기 렌더 시간, 스크롤 프레임 레이트 측정

### 2단계: 가상 스크롤 직접 구현

- 위 코드 기반으로 상품 목록에 가상 스크롤 적용
- 같은 1000개로 성능 비교
- DOM 노드 수가 수십 개로 줄었는지 Elements 탭 확인

### 3단계: 무한 스크롤

- 스크롤이 하단에 도달하면 다음 페이지 상품 로드
- API에 페이지네이션 파라미터 추가 (`?page=1&limit=20`)
- 로딩 인디케이터 표시

### 4단계: 필터 변경 애니메이션

- 카테고리 필터 변경시 상품 카드에 flip + fade 적용
- 성능에 영향 없는지 확인

## 검증

- 가상화 전후 Performance 탭 비교
- DOM 노드 수: 수천 개 → 수십 개
- 스크롤 60fps 유지
- 무한 스크롤이 끊김 없이 동작
- 필터 변경 애니메이션이 부드럽게 동작
