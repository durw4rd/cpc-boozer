<script>
	import { enhance } from '$app/forms';
	import { withPending } from '$lib/pending';

	let { data, form } = $props();

	const inputClass = 'w-full rounded-lg bg-black/40 px-3 py-2.5 text-sm text-white placeholder-white/30 outline-none ring-1 ring-white/20 backdrop-blur-sm focus:ring-red-400';
</script>

<div class="space-y-6">
	<div class="flex items-center gap-3">
		<a href="/" class="text-sm text-white/50 hover:text-white">← back</a>
		<h1 class="text-lg font-bold">profile</h1>
	</div>

	<section class="rounded-xl border border-white/10 bg-black/60 p-4 backdrop-blur-sm">
		<h2 class="mb-3 text-xs font-semibold uppercase tracking-widest text-white/40">change name</h2>
		<form method="POST" action="?/changeName" use:enhance={withPending} class="space-y-2">
			<input type="text" name="name" value={data.user.name} required class={inputClass} />
			{#if form?.nameError}
				<p class="text-xs text-red-400">{form.nameError}</p>
			{/if}
			{#if form?.nameSuccess}
				<p class="text-xs text-emerald-400">name updated</p>
			{/if}
			<button class="w-full rounded-lg bg-red-600 py-2.5 text-sm font-semibold text-white hover:opacity-90">save</button>
		</form>
	</section>

	<section class="rounded-xl border border-white/10 bg-black/60 p-4 backdrop-blur-sm">
		<h2 class="mb-3 text-xs font-semibold uppercase tracking-widest text-white/40">change password</h2>
		<form method="POST" action="?/changePassword" use:enhance={withPending} class="space-y-2">
			<input type="password" name="current" placeholder="current password" required class={inputClass} />
			<input type="password" name="next" placeholder="new password" required class={inputClass} />
			{#if form?.passwordError}
				<p class="text-xs text-red-400">{form.passwordError}</p>
			{/if}
			{#if form?.passwordSuccess}
				<p class="text-xs text-emerald-400">password updated</p>
			{/if}
			<button class="w-full rounded-lg bg-red-600 py-2.5 text-sm font-semibold text-white hover:opacity-90">update</button>
		</form>
	</section>
</div>
