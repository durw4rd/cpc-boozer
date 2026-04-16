<script lang="ts">
	import { enhance } from '$app/forms';

	let { data, form } = $props();

	let editingId = $state<string | null>(null);
	let editName = $state('');
	let editDescription = $state('');

	function startEdit(venue: { id: string; name: string; description: string | null }) {
		editingId = venue.id;
		editName = venue.name;
		editDescription = venue.description ?? '';
	}
</script>

<div class="space-y-6">
	<div class="flex items-center gap-3">
		<a href="/" class="text-sm text-zinc-500 hover:text-zinc-300">← back</a>
		<h1 class="text-lg font-bold">venues</h1>
	</div>

	<!-- Add venue form -->
	<section class="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
		<h2 class="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-500">add venue</h2>
		<form method="POST" action="?/add" use:enhance class="space-y-2">
			<input
				type="text"
				name="name"
				placeholder="name"
				required
				class="w-full rounded-lg bg-zinc-800 px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 outline-none ring-1 ring-zinc-700 focus:ring-violet-500"
			/>
			<input
				type="text"
				name="description"
				placeholder="description (optional)"
				class="w-full rounded-lg bg-zinc-800 px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 outline-none ring-1 ring-zinc-700 focus:ring-violet-500"
			/>
			{#if form?.error}
				<p class="text-xs text-red-400">{form.error}</p>
			{/if}
			<button
				class="w-full rounded-lg bg-violet-600 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
			>
				add
			</button>
		</form>
	</section>

	<!-- Venue list -->
	{#if data.venues.length === 0}
		<p class="text-sm text-zinc-500">no venues yet</p>
	{:else}
		<ul class="space-y-2">
			{#each data.venues as venue}
				<li class="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
					{#if editingId === venue.id}
						<form method="POST" action="?/edit" use:enhance={() => async ({ update }) => { await update(); editingId = null; }} class="space-y-2">
							<input type="hidden" name="id" value={venue.id} />
							<input
								type="text"
								name="name"
								bind:value={editName}
								required
								class="w-full rounded-lg bg-zinc-800 px-3 py-2 text-sm text-zinc-100 outline-none ring-1 ring-zinc-700 focus:ring-violet-500"
							/>
							<input
								type="text"
								name="description"
								bind:value={editDescription}
								placeholder="description (optional)"
								class="w-full rounded-lg bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 outline-none ring-1 ring-zinc-700 focus:ring-violet-500"
							/>
							<div class="flex gap-2">
								<button class="flex-1 rounded-lg bg-violet-600 py-2 text-xs font-semibold text-white">save</button>
								<button type="button" onclick={() => (editingId = null)} class="flex-1 rounded-lg bg-zinc-800 py-2 text-xs text-zinc-400">cancel</button>
							</div>
						</form>
					{:else}
						<div class="flex items-start justify-between gap-2">
							<div>
								<p class="text-sm font-medium">{venue.name}</p>
								{#if venue.description}
									<p class="text-xs text-zinc-500">{venue.description}</p>
								{/if}
							</div>
							<button
								onclick={() => startEdit(venue)}
								class="text-xs text-zinc-600 hover:text-zinc-300 transition-colors"
							>edit</button>
						</div>
					{/if}
				</li>
			{/each}
		</ul>
	{/if}
</div>
