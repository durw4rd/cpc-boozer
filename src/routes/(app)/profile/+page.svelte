<script lang="ts">
	import { enhance } from '$app/forms';

	let { data, form } = $props();
</script>

<div class="space-y-6">
	<div class="flex items-center gap-3">
		<a href="/" class="text-sm text-zinc-500 hover:text-zinc-300">← back</a>
		<h1 class="text-lg font-bold">profile</h1>
	</div>

	<!-- Change name -->
	<section class="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
		<h2 class="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-500">change name</h2>
		<form method="POST" action="?/changeName" use:enhance class="space-y-2">
			<input
				type="text"
				name="name"
				value={data.user.name}
				required
				class="w-full rounded-lg bg-zinc-800 px-3 py-2.5 text-sm text-zinc-100 outline-none ring-1 ring-zinc-700 focus:ring-amber-400"
			/>
			{#if form?.nameError}
				<p class="text-xs text-red-400">{form.nameError}</p>
			{/if}
			{#if form?.nameSuccess}
				<p class="text-xs text-emerald-400">name updated</p>
			{/if}
			<button class="w-full rounded-lg bg-amber-400 py-2.5 text-sm font-semibold text-zinc-950 hover:opacity-90">
				save
			</button>
		</form>
	</section>

	<!-- Change password -->
	<section class="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
		<h2 class="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-500">change password</h2>
		<form method="POST" action="?/changePassword" use:enhance class="space-y-2">
			<input
				type="password"
				name="current"
				placeholder="current password"
				required
				class="w-full rounded-lg bg-zinc-800 px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 outline-none ring-1 ring-zinc-700 focus:ring-amber-400"
			/>
			<input
				type="password"
				name="next"
				placeholder="new password"
				required
				class="w-full rounded-lg bg-zinc-800 px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 outline-none ring-1 ring-zinc-700 focus:ring-amber-400"
			/>
			{#if form?.passwordError}
				<p class="text-xs text-red-400">{form.passwordError}</p>
			{/if}
			{#if form?.passwordSuccess}
				<p class="text-xs text-emerald-400">password updated</p>
			{/if}
			<button class="w-full rounded-lg bg-amber-400 py-2.5 text-sm font-semibold text-zinc-950 hover:opacity-90">
				update
			</button>
		</form>
	</section>
</div>
