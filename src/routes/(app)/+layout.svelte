<script>
	import { page } from '$app/state';
	import logo from '$lib/assets/cpc-boozers.png';
	let { data, children } = $props();
</script>

<div class="min-h-screen bg-zinc-950 text-zinc-100">
	<header class="sticky top-0 z-10 border-b border-violet-900/40 bg-zinc-900/95 backdrop-blur">
		<div class="mx-auto flex max-w-md items-center justify-between px-4 py-2">
			<a href="/" class="flex items-center gap-2">
				<img src={logo} alt="CPC Boozers" class="h-9 w-9 rounded-full object-cover" />
			</a>
			<nav class="flex items-center gap-4 text-sm text-zinc-400">
				<a
					href="/venues"
					class={[
						'transition-colors hover:text-zinc-100',
						page.url.pathname === '/venues' && 'text-violet-400'
					].filter(Boolean).join(' ')}
				>venues</a>
				<a
					href="/profile"
					class={[
						'transition-colors hover:text-zinc-100',
						page.url.pathname === '/profile' && 'text-violet-400'
					].filter(Boolean).join(' ')}
				>{data.user.name}</a>
				<form method="POST" action="/logout">
					<button class="cursor-pointer transition-colors hover:text-zinc-100">out</button>
				</form>
			</nav>
		</div>
	</header>

	<main class="mx-auto max-w-md px-4 py-6">
		{@render children()}
	</main>
</div>
