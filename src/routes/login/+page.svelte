<script lang="ts">
	import { enhance } from '$app/forms';

	let { form } = $props();
</script>

<div class="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
	<div class="w-full max-w-sm space-y-6">
		<div class="text-center">
			<h1 class="text-3xl font-bold text-amber-400">boozer</h1>
			<p class="mt-1 text-sm text-zinc-500">wednesday nights, sorted</p>
		</div>

		<form method="POST" use:enhance class="space-y-3">
			<input
				type="text"
				name="name"
				placeholder="your name"
				required
				autocomplete="username"
				class="w-full rounded-xl bg-zinc-900 px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 outline-none ring-1 ring-zinc-800 focus:ring-amber-400"
			/>
			<input
				type="password"
				name="password"
				placeholder="password"
				required
				autocomplete="current-password"
				class="w-full rounded-xl bg-zinc-900 px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 outline-none ring-1 ring-zinc-800 focus:ring-amber-400"
			/>
			{#if form?.error}
				<p class="text-sm text-red-400">{form.error}</p>
			{/if}
			<button class="w-full rounded-xl bg-amber-400 py-3 text-sm font-bold text-zinc-950 transition-opacity hover:opacity-90">
				sign in
			</button>
		</form>

		<p class="text-center text-sm text-zinc-600">
			new here? <a href="/register" class="text-amber-400 hover:underline">create account</a>
		</p>
	</div>
</div>
