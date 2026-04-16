<script lang="ts">
	import { enhance } from '$app/forms';
	import logo from '$lib/assets/cpc-boozers.png';

	let { form } = $props();
</script>

<div class="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
	<div class="w-full max-w-sm space-y-6">
		<div class="flex flex-col items-center gap-3">
			<img src={logo} alt="CPC Boozers" class="h-24 w-24 rounded-full object-cover" />
			<p class="text-sm text-zinc-500">wednesday nights, sorted</p>
		</div>

		<form method="POST" use:enhance class="space-y-3">
			<input
				type="text"
				name="name"
				placeholder="your name"
				required
				autocomplete="username"
				class="w-full rounded-xl bg-zinc-900 px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 outline-none ring-1 ring-zinc-800 focus:ring-violet-500"
			/>
			<input
				type="password"
				name="password"
				placeholder="password"
				required
				autocomplete="current-password"
				class="w-full rounded-xl bg-zinc-900 px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 outline-none ring-1 ring-zinc-800 focus:ring-violet-500"
			/>
			{#if form?.error}
				<p class="text-sm text-red-400">{form.error}</p>
			{/if}
			<button class="w-full rounded-xl bg-violet-600 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90">
				sign in
			</button>
		</form>

		<p class="text-center text-sm text-zinc-600">
			new here? <a href="/register" class="text-orange-400 hover:underline">create account</a>
		</p>
	</div>
</div>
