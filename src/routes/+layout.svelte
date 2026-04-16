<script lang="ts">
	import logo from '$lib/assets/cpc-boozers.png';
	import '../app.css';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={logo} />
</svelte:head>

{@render children()}
