<script lang="ts">
	import { setLocale } from '$lib/shared/paraglide/runtime';
	import { m } from '$lib/shared/paraglide/messages.js';
</script>

<h1>{m.hello_world({ name: 'SvelteKit User' })}</h1>

<div>
	<button onclick={() => setLocale('ko')}>ko</button>
	<button onclick={() => setLocale('en')}>en</button>
</div>

<p>
	If you use VSCode, install the

	<a
		href="https://marketplace.visualstudio.com/items?itemName=inlang.vs-code-extension"
		target="_blank">Sherlock i18n extension</a
	>

	for a better i18n experience.
</p>
