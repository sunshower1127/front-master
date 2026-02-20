# M01: 셋업 & Runes 기초 — 상품 카드 만들기

## 목표

SvelteKit 프로젝트를 셋업하고, 정적 상품 카드 컴포넌트를 만들면서 Runes 기초를 익힌다.

## React와 다른 점

| React | Svelte 5 |
|-------|----------|
| useState | `$state` |
| useMemo | `$derived` |
| useEffect | `$effect` |
| props destructuring | `$props()` |
| Virtual DOM diffing | 컴파일 타임에 DOM 업데이트 코드 생성 |
| runtime 40KB+ (gzip) | runtime 거의 0 (컴파일러가 필요한 코드만 포함) |

핵심: Svelte는 **컴파일러**. 빌드 시점에 리액티브 코드를 vanilla JS로 변환함.

## 배울 개념

### $state (= useState)

```svelte
<script>
  // React: const [count, setCount] = useState(0)
  let count = $state(0);
</script>

<button onclick={() => count++}>
  {count}
</button>
```

setter 함수 없음. 그냥 변수에 직접 할당.

### $derived (= useMemo)

```svelte
<script>
  let count = $state(0);
  // React: const doubled = useMemo(() => count * 2, [count])
  let doubled = $derived(count * 2);
</script>
```

dependency array 없음. 컴파일러가 추적함.

### $effect (= useEffect)

```svelte
<script>
  let count = $state(0);
  // React: useEffect(() => { console.log(count) }, [count])
  $effect(() => {
    console.log(count);
  });
</script>
```

dependency array 없음. 안에서 읽는 $state를 자동 추적.

### $props (= props)

```svelte
<script>
  // React: function Button({ label, onClick }) { ... }
  let { label, onclick } = $props();
</script>

<button {onclick}>{label}</button>
```

### .svelte 파일 구조

```svelte
<script>
  // JS 로직
</script>

<!-- HTML 템플릿 -->

<style>
  /* 자동 scoped CSS. 이 컴포넌트에만 적용됨 */
</style>
```

React의 CSS-in-JS나 CSS Modules 필요 없음. 기본이 scoped.

## 과제: 상품 카드

### 1단계: ProductCard 컴포넌트

상품 하나를 표시하는 카드 컴포넌트를 만든다.

- `$props()`로 상품 정보(이름, 가격, 이미지URL, 설명) 받기
- 가격을 원화 포맷으로 표시 (`$derived`)
- scoped CSS로 카드 스타일링

### 2단계: 수량 선택기

카드에 수량 선택 기능을 추가한다.

- `$state`로 수량 관리
- +/- 버튼 (최소 1, 최대 99)
- 수량 × 가격 = 소계를 `$derived`로 계산
- 소계가 변경될 때 콘솔에 로그 (`$effect`)

### 3단계: 상품 목록 페이지

메인 페이지에 상품 카드 여러 개를 배치한다.

- 하드코딩된 상품 배열 (5~10개)
- `{#each}` 로 목록 렌더링
- 기본 그리드 레이아웃 (scoped CSS)

## 검증

- `pnpm run dev`로 정상 동작
- `pnpm run build`로 빌드 에러 없음
- 상품 카드에서 수량 변경 시 소계가 자동 업데이트
- React로 같은 걸 만들 때와 코드량 비교해보기
