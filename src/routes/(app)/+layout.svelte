<script>
	import { page } from '$app/state';
	let { data, children } = $props();
</script>

<div class="min-h-screen bg-zinc-950 text-zinc-100">
	<header class="sticky top-0 z-10 border-b border-zinc-800 bg-zinc-900/95 backdrop-blur">
		<div class="mx-auto flex max-w-md items-center justify-between px-4 py-3">
			<a href="/" class="text-lg font-bold tracking-tight text-amber-400">boozer</a>
			<nav class="flex items-center gap-4 text-sm text-zinc-400">
				<a
					href="/venues"
					class={[
						'transition-colors hover:text-zinc-100',
						page.url.pathname === '/venues' && 'text-zinc-100'
					].filter(Boolean).join(' ')}
				>venues</a>
				<a
					href="/profile"
					class={[
						'transition-colors hover:text-zinc-100',
						page.url.pathname === '/profile' && 'text-zinc-100'
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
