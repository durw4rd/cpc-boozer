<script>
	import { enhance } from '$app/forms';
	import logo from '$lib/assets/cpc-boozers.png';
	import background from '$lib/assets/cpc-background.png';

	let { form } = $props();
</script>

<div class="fixed inset-0 -z-10" style="background-image: url({background}); background-size: cover; background-position: center;"></div>

<div class="flex min-h-screen items-center justify-center px-4">
	<div class="w-full max-w-sm space-y-6">
		<div class="flex flex-col items-center gap-3">
			<img src={logo} alt="CPC Boozers" class="h-24 w-24 rounded-full object-cover" />
			<p class="text-sm text-white/60">create your account</p>
		</div>

		<form method="POST" use:enhance class="space-y-3">
			<input
				type="text"
				name="name"
				placeholder="your name"
				required
				autocomplete="username"
				class="w-full rounded-xl bg-black/50 px-4 py-3 text-sm text-white placeholder-white/30 outline-none ring-1 ring-white/20 backdrop-blur-sm focus:ring-red-400"
			/>
			<input
				type="password"
				name="password"
				placeholder="password (min 6 chars)"
				required
				autocomplete="new-password"
				class="w-full rounded-xl bg-black/50 px-4 py-3 text-sm text-white placeholder-white/30 outline-none ring-1 ring-white/20 backdrop-blur-sm focus:ring-red-400"
			/>
			{#if form?.error}
				<p class="text-sm text-red-400">{form.error}</p>
			{/if}
			<button class="w-full rounded-xl bg-red-600 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90">
				create account
			</button>
		</form>

		<p class="text-center text-sm text-white/40">
			already have an account? <a href="/login" class="text-amber-400 hover:underline">sign in</a>
		</p>
	</div>
</div>
