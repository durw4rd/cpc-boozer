<script lang="ts">
	import { enhance } from '$app/forms';
	import { pending, withPending } from '$lib/pending';

	let { data, form } = $props();

	let editingId = $state<string | null>(null);
	let editName = $state('');
	let editDescription = $state('');
	let editUrl = $state('');

	function startEdit(venue: { id: string; name: string; description: string | null; url: string | null }) {
		editingId = venue.id;
		editName = venue.name;
		editDescription = venue.description ?? '';
		editUrl = venue.url ?? '';
	}

	const inputClass = 'w-full rounded-lg bg-black/40 px-3 py-2 text-sm text-white placeholder-white/30 outline-none ring-1 ring-white/20 backdrop-blur-sm focus:ring-red-400';
</script>

<div class="space-y-6">
	<div class="flex items-center gap-3">
		<a href="/" class="text-sm text-white/50 hover:text-white">← back</a>
		<h1 class="text-lg font-bold">venues</h1>
	</div>

	<section class="rounded-xl border border-white/10 bg-black/60 p-4 backdrop-blur-sm">
		<h2 class="mb-3 text-xs font-semibold uppercase tracking-widest text-white/40">add venue</h2>
		<form method="POST" action="?/add" use:enhance={withPending} class="space-y-2">
			<input type="text" name="name" placeholder="name" required class="{inputClass} py-2.5" />
			<input type="text" name="description" placeholder="description (optional)" class="{inputClass} py-2.5" />
			<input type="url" name="url" placeholder="website / menu URL (optional)" class="{inputClass} py-2.5" />
			{#if form?.error}
				<p class="text-xs text-red-400">{form.error}</p>
			{/if}
			<button class="w-full rounded-lg bg-red-600 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90">
				add
			</button>
		</form>
	</section>

	{#if data.venues.length === 0}
		<p class="text-sm text-white/40">no venues yet</p>
	{:else}
		<ul class="space-y-2">
			{#each data.venues as venue}
				<li class="rounded-xl border border-white/10 bg-black/60 p-4 backdrop-blur-sm">
					{#if editingId === venue.id}
						<form method="POST" action="?/edit" use:enhance={() => {
							pending.set(true);
							return async ({ update }) => {
								try {
									await update();
									editingId = null;
								} finally {
									pending.set(false);
								}
							};
						}} class="space-y-2">
							<input type="hidden" name="id" value={venue.id} />
							<input type="text" name="name" bind:value={editName} required class={inputClass} />
							<input type="text" name="description" bind:value={editDescription} placeholder="description (optional)" class={inputClass} />
							<input type="url" name="url" bind:value={editUrl} placeholder="website / menu URL (optional)" class={inputClass} />
							<div class="flex gap-2">
								<button class="flex-1 rounded-lg bg-red-600 py-2 text-xs font-semibold text-white">save</button>
								<button type="button" onclick={() => (editingId = null)} class="flex-1 rounded-lg bg-white/10 py-2 text-xs text-white/60">cancel</button>
							</div>
						</form>
					{:else}
						<div class="flex items-start justify-between gap-2">
							<div class="space-y-0.5">
								{#if venue.url}
									<a href={venue.url} target="_blank" rel="noopener noreferrer"
										class="text-sm font-medium text-amber-400 underline underline-offset-2 hover:text-amber-300 transition-colors">{venue.name} ↗</a>
								{:else}
									<p class="text-sm font-medium">{venue.name}</p>
								{/if}
								{#if venue.description}
									<p class="text-xs text-white/40">{venue.description}</p>
								{/if}
							</div>
							<button onclick={() => startEdit(venue)} class="text-xs text-white/30 hover:text-white transition-colors">edit</button>
						</div>
					{/if}
				</li>
			{/each}
		</ul>
	{/if}
</div>
