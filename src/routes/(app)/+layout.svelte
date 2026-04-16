<script>
	import { page } from '$app/state';
	import logo from '$lib/assets/cpc-boozers.png';
	import background from '$lib/assets/cpc-background.png';
	let { data, children } = $props();
</script>

<!-- Fixed background — works reliably on iOS/mobile -->
<div class="fixed inset-0 -z-10" style="background-image: url({background}); background-size: cover; background-position: center;"></div>

<div class="min-h-screen text-zinc-100">
	<header class="sticky top-0 z-10 border-b border-white/10 bg-black/50 backdrop-blur-md">
		<div class="mx-auto flex max-w-md items-center justify-between px-4 py-2">
			<a href="/" class="flex items-center gap-2">
				<img src={logo} alt="CPC Boozers" class="h-9 w-9 rounded-full object-cover" />
			</a>
			<nav class="flex items-center gap-4 text-sm text-zinc-300">
				<a
					href="/venues"
					class={[
						'transition-colors hover:text-white',
						page.url.pathname === '/venues' && 'text-red-400'
					].filter(Boolean).join(' ')}
				>venues</a>
				<a
					href="/profile"
					class={[
						'transition-colors hover:text-white',
						page.url.pathname === '/profile' && 'text-red-400'
					].filter(Boolean).join(' ')}
				>{data.user.name}</a>
				<form method="POST" action="/logout">
					<button class="cursor-pointer transition-colors hover:text-white">out</button>
				</form>
			</nav>
		</div>
	</header>

	<main class="mx-auto max-w-md px-4 py-6">
		{@render children()}
	</main>
</div>
