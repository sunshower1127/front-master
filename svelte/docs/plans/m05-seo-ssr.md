# M05: SEO & SSR/SSG — 상품 상세 페이지

## 목표

상품 상세 페이지에 SSR과 메타태그를 적용하고, 정적 페이지는 SSG로 처리. 쇼핑몰의 검색엔진 노출을 최적화한다.

## React와 다른 점

| React 문제 | Svelte 해결 |
|-----------|------------|
| CRA는 빈 HTML → SEO 안됨 | SSR이 기본 |
| Next.js를 별도로 배워야 함 | SvelteKit에 내장 |
| react-helmet으로 메타태그 | `<svelte:head>` 빌트인 |
| getStaticProps/getServerSideProps 구분 복잡 | 한 줄 설정 (prerender = true) |

## 배울 개념

### 렌더링 모드 3가지

```ts
// +page.ts 또는 +page.server.ts
export const prerender = true;  // SSG: 빌드 시 HTML 생성
export const ssr = true;        // SSR: 요청마다 HTML 생성 (기본값)
export const csr = true;        // CSR: 클라이언트 hydration (기본값)
```

쇼핑몰에서의 적용:
- 상품 상세 → **SSR** (재고, 가격이 실시간)
- about, contact → **SSG** (내용 안 변함)
- 장바구니, 주문 → **CSR도 OK** (SEO 불필요)

### 메타 태그

```svelte
<!-- routes/(shop)/products/[id]/+page.svelte -->
<script>
  let { data } = $props();
</script>

<svelte:head>
  <title>{data.product.name} | 내 쇼핑몰</title>
  <meta name="description" content={data.product.description} />
  <meta property="og:title" content={data.product.name} />
  <meta property="og:description" content={data.product.description} />
  <meta property="og:image" content={data.product.imageUrl} />
  <meta property="og:type" content="product" />
</svelte:head>
```

### Sitemap 생성

```ts
// routes/sitemap.xml/+server.ts
import { getProducts } from '$lib/server/products';

export async function GET() {
  const products = await getProducts();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://myshop.com</loc></url>
  ${products.map(p => `<url><loc>https://myshop.com/products/${p.id}</loc></url>`).join('')}
</urlset>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml' }
  });
}
```

### 구조화 데이터 (Schema.org)

```svelte
<svelte:head>
  <script type="application/ld+json">
    {JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Product",
      "name": data.product.name,
      "description": data.product.description,
      "image": data.product.imageUrl,
      "offers": {
        "@type": "Offer",
        "price": data.product.price,
        "priceCurrency": "KRW"
      }
    })}
  </script>
</svelte:head>
```

## 과제: SEO 최적화

### 1단계: 상품 상세 SSR

- 상품 상세 페이지 SSR 확인 (기본값이라 이미 되어있을 수 있음)
- 페이지 소스 보기에서 상품 데이터가 HTML에 포함되는지 확인

### 2단계: 동적 메타태그

- 각 상품 페이지에 고유한 title, description, og 태그
- 카카오톡/슬랙에 URL 공유시 미리보기가 올바른지 테스트

### 3단계: 정적 페이지 SSG

- about, contact 페이지에 `prerender = true` 적용
- 빌드 후 정적 HTML 파일 생성 확인

### 4단계: Sitemap

- `/sitemap.xml` 엔드포인트 생성
- 모든 상품 페이지 URL 포함

### 5단계: 구조화 데이터

- 상품 상세 페이지에 Product Schema 추가
- Google Rich Results Test로 확인

## 검증

- `curl localhost:5173/products/1` 에서 HTML에 상품 데이터 포함
- Lighthouse SEO 점수 90+
- 빌드 후 about, contact의 정적 HTML 생성 확인
- `/sitemap.xml` 접근 시 올바른 XML 반환
- 소셜 미디어 공유시 미리보기 정상
