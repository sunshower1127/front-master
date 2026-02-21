<script lang="ts">
	import { page } from '$app/state';
	import favicon from '$lib/shared/assets/favicon.svg';
	import { locales, localizeHref } from '$lib/shared/paraglide/runtime';

	let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
{@render children()}

<div style="display:none">
	{#each locales as locale}
		<a href={localizeHref(page.url.pathname, { locale })}>{locale}</a>
	{/each}
</div>
