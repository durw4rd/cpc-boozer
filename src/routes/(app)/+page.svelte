<script lang="ts">
	import { enhance } from '$app/forms';
	import { formatEventDate } from '$lib/utils';

	let { data } = $props();

	// Free-form order input (fallback for venues without a menu)
	// svelte-ignore state_referenced_locally
	let orderInput = $state(data.currentUserOrder ?? '');
	let savingOrder = $state(false);

	// Menu picker state
	// svelte-ignore state_referenced_locally
	let selectedItemIds = $state(new Set<string>(data.currentUserMenuItemId ? [data.currentUserMenuItemId] : []));
	// svelte-ignore state_referenced_locally
	let notesInput = $state(data.currentUserNotes ?? '');
	let expandedCategories = $state<Record<string, boolean>>({});

	// Flatten all menu items for lookup
	const allMenuItems = $derived(Object.values(data.menuByCategory).flat() as Array<{
		id: string;
		category: string;
		dishName: string;
		descriptionEn: string | null;
		menuNumber: string;
		protein: string;
		priceEur: string;
		sortOrder: number;
	}>);

	const selectedItems = $derived(allMenuItems.filter((item) => selectedItemIds.has(item.id)));

	const selectedMeal = $derived(
		selectedItems
			.map((item) => `${item.dishName} #${item.menuNumber} — ${item.protein} — €${item.priceEur}`)
			.join('\n')
	);

	function toggleItem(id: string) {
		const next = new Set(selectedItemIds);
		if (next.has(id)) next.delete(id);
		else next.add(id);
		selectedItemIds = next;
	}

	function toggleCategory(cat: string) {
		expandedCategories = { ...expandedCategories, [cat]: !expandedCategories[cat] };
	}

	function groupByDish(items: typeof allMenuItems): [string, typeof allMenuItems][] {
		const map = new Map<string, typeof allMenuItems>();
		for (const item of items) {
			if (!map.has(item.dishName)) map.set(item.dishName, []);
			map.get(item.dishName)!.push(item);
		}
		return [...map.entries()];
	}
</script>

<div class="space-y-6">
	<!-- Event header -->
	<div>
		<p class="text-xs font-medium uppercase tracking-widest text-amber-500/80">Our next boozing session</p>
		<div class="flex items-center gap-3">
			<h1 class="text-2xl font-bold">{formatEventDate(data.event.date)}</h1>
			<span class="beer text-2xl">🍺</span>
		</div>
		{#if data.event.label}
			<p class="mt-1 text-sm text-orange-400">{data.event.label}</p>
		{/if}
	</div>

	<!-- Attendance -->
	<section class="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
		<div class="mb-3 flex items-baseline justify-between">
			<h2 class="text-xs font-semibold uppercase tracking-widest text-zinc-500">attendance</h2>
			<p class="text-xs text-zinc-500">
				<span class="font-medium text-emerald-400">{data.members.filter(m => m.attending === true).length}</span> in ·
				<span class="font-medium text-zinc-400">{data.members.filter(m => m.attending === null).length}</span> pending ·
				<span class="font-medium text-zinc-600">{data.members.filter(m => m.attending === false).length}</span> out
			</p>
		</div>

		<!-- Toggle for current user -->
		<div class="mb-4 flex gap-2">
			<form method="POST" action="?/toggleAttendance" use:enhance class="flex-1">
				<input type="hidden" name="eventId" value={data.event.id} />
				<input type="hidden" name="attending" value="true" />
				<button
					class={[
						'w-full rounded-lg py-2.5 text-sm font-semibold transition-colors',
						data.currentUserAttending === true
							? 'bg-emerald-500 text-white'
							: 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
					].join(' ')}
				>
					I'm in
				</button>
			</form>
			<form method="POST" action="?/toggleAttendance" use:enhance class="flex-1">
				<input type="hidden" name="eventId" value={data.event.id} />
				<input type="hidden" name="attending" value="false" />
				<button
					class={[
						'w-full rounded-lg py-2.5 text-sm font-semibold transition-colors',
						data.currentUserAttending === false
							? 'bg-zinc-600 text-zinc-300'
							: 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
					].join(' ')}
				>
					can't make it
				</button>
			</form>
		</div>

		<!-- Member list -->
		<ul class="space-y-1.5">
			{#each data.members as member}
				<li class="flex items-center justify-between text-sm">
					<span class={member.attending === null ? 'text-zinc-500' : 'text-zinc-200'}>
						{member.name}
					</span>
					<span>
						{#if member.attending === true}
							<span class="text-emerald-400">✓</span>
						{:else if member.attending === false}
							<span class="text-zinc-600">✗</span>
						{:else}
							<span class="text-zinc-700">—</span>
						{/if}
					</span>
				</li>
			{/each}
		</ul>
	</section>

	<!-- Food order -->
	<div>
		<p class="mb-2 text-xs font-medium uppercase tracking-widest text-amber-500/80">Joining for the dinner too?</p>
	<section class="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
		<h2 class="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-500">food order</h2>

		{#if data.lockedVenue}
			<!-- Venue locked header -->
			<div class="mb-4 flex items-center gap-2">
				<span class="text-sm font-medium text-orange-400">{data.lockedVenue.name}</span>
				<span class="rounded bg-amber-400/10 px-1.5 py-0.5 text-xs text-orange-400">locked</span>
				<form method="POST" action="?/unlockVenue" use:enhance class="ml-auto">
					<input type="hidden" name="eventId" value={data.event.id} />
					<button class="text-xs text-zinc-600 hover:text-zinc-400">unlock</button>
				</form>
			</div>

			{#if data.hasMenu}
				<!-- ── Menu picker ── -->
				<div class="mb-4 space-y-1">
					{#each Object.entries(data.menuByCategory) as [category, items]}
						{@const dishes = groupByDish(items as typeof allMenuItems)}
						<!-- Category header -->
						<button
							type="button"
							onclick={() => toggleCategory(category)}
							class="flex w-full items-center justify-between rounded-lg bg-zinc-800 px-3 py-2 text-left text-sm font-medium text-zinc-300 hover:bg-zinc-700"
						>
							<span>{category}</span>
							<span class="text-xs text-zinc-500">{expandedCategories[category] ? '▲' : '▼'}</span>
						</button>

						{#if expandedCategories[category]}
							<div class="space-y-3 rounded-lg bg-zinc-800/50 px-3 py-3">
								{#each dishes as [dishName, versions]}
									<div>
										<p class="text-sm font-medium text-zinc-200">{dishName}</p>
										{#if versions[0].descriptionEn}
											<p class="mb-1.5 text-xs text-zinc-500">{versions[0].descriptionEn}</p>
										{/if}
										<div class="flex flex-wrap gap-1.5">
											{#each versions as item}
												<button
													type="button"
													onclick={() => toggleItem(item.id)}
													class={[
														'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
														selectedItemIds.has(item.id)
															? 'bg-violet-500 text-white'
															: 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
													].join(' ')}
												>
													{item.protein} €{item.priceEur}
												</button>
											{/each}
										</div>
									</div>
								{/each}
							</div>
						{/if}
					{/each}
				</div>

				<!-- Order summary + save -->
				<form
					method="POST"
					action="?/saveOrder"
					use:enhance={() => {
						savingOrder = true;
						return async ({ update }) => {
							await update();
							savingOrder = false;
						};
					}}
					class="mb-4 space-y-2"
				>
					<input type="hidden" name="eventId" value={data.event.id} />
					<input type="hidden" name="venueId" value={data.lockedVenue.id} />
					<input type="hidden" name="menuItemId" value="" />
					<input type="hidden" name="meal" value={selectedMeal} />

					{#if selectedItems.length > 0}
						<div class="rounded-lg bg-zinc-800 px-3 py-2.5">
							<p class="mb-1 text-xs text-zinc-500">your order</p>
							{#each selectedItems as item}
								<div class="flex items-baseline justify-between">
									<p class="text-sm font-medium text-zinc-100">{item.dishName}</p>
									<p class="text-xs text-zinc-400">{item.protein} · €{item.priceEur}</p>
								</div>
							{/each}
						</div>
					{/if}

					<input
						type="text"
						name="notes"
						bind:value={notesInput}
						placeholder="notes (e.g. extra spicy)…"
						class="w-full rounded-lg bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 outline-none ring-1 ring-zinc-700 focus:ring-violet-500"
					/>

					<button
						disabled={savingOrder || selectedItems.length === 0}
						class="w-full rounded-lg bg-violet-600 py-2.5 text-sm font-semibold text-white transition-opacity disabled:opacity-40"
					>
						{savingOrder ? '…' : selectedItems.length > 0 ? 'confirm order' : 'pick a dish above'}
					</button>
				</form>

				{#if data.currentUserOrder}
					<form method="POST" action="?/clearOrder" use:enhance class="mt-1">
						<input type="hidden" name="eventId" value={data.event.id} />
						<button class="w-full text-center text-xs text-zinc-600 hover:text-zinc-400">
							remove my order
						</button>
					</form>
				{/if}
			{:else}
				<!-- ── Free-form fallback ── -->
				<form
					method="POST"
					action="?/saveOrder"
					use:enhance={() => {
						savingOrder = true;
						return async ({ update }) => {
							await update();
							savingOrder = false;
						};
					}}
					class="mb-4 flex gap-2"
				>
					<input type="hidden" name="eventId" value={data.event.id} />
					<input type="hidden" name="venueId" value={data.lockedVenue.id} />
					<input
						type="text"
						name="meal"
						bind:value={orderInput}
						placeholder="your order…"
						class="flex-1 rounded-lg bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 outline-none ring-1 ring-zinc-700 focus:ring-violet-500"
					/>
					<button
						disabled={savingOrder || !orderInput.trim()}
						class="rounded-lg bg-violet-600 px-3 py-2 text-sm font-semibold text-white transition-opacity disabled:opacity-40"
					>
						{savingOrder ? '…' : 'save'}
					</button>
				</form>
			{/if}

			<!-- Orders summary -->
			{#if data.foodOrders.length > 0}
				<ul class="space-y-2">
					{#each data.foodOrders as order}
						<li class="text-sm">
							<div class="flex items-start justify-between gap-2">
								<span class="shrink-0 text-zinc-400">{order.userName}</span>
								<span class="text-right text-zinc-200 whitespace-pre-line">{order.meal}</span>
							</div>
							{#if order.notes}
								<p class="mt-0.5 text-right text-xs text-zinc-500">{order.notes}</p>
							{/if}
						</li>
					{/each}
				</ul>
			{:else}
				<p class="text-sm text-zinc-600">no orders yet</p>
			{/if}
		{:else}
			<!-- Venue voting -->
			{#if data.venues.length === 0}
				<p class="text-sm text-zinc-500">
					no venues saved yet — <a href="/venues" class="text-orange-400 hover:underline"
						>add one</a
					>
				</p>
			{:else}
				<ul class="mb-3 space-y-2">
					{#each data.venues as venue}
						<li class="rounded-lg bg-zinc-800 p-3">
							<!-- Venue name + vote count -->
							<div class="mb-2.5 flex items-center justify-between">
								<span class="text-sm font-medium">
									{#if venue.url}
										<a
											href={venue.url}
											target="_blank"
											rel="noopener noreferrer"
											class="text-orange-400 underline underline-offset-2 hover:text-orange-300"
										>{venue.name} ↗</a>
									{:else}
										<span class="text-zinc-200">{venue.name}</span>
									{/if}
								</span>
								<span class="text-sm text-zinc-500">
									{venue.voteCount} {venue.voteCount === 1 ? 'vote' : 'votes'}
								</span>
							</div>
							<!-- Actions -->
							<div class="flex gap-2">
								<form method="POST" action="?/voteVenue" use:enhance class="flex-1">
									<input type="hidden" name="eventId" value={data.event.id} />
									<input type="hidden" name="venueId" value={venue.id} />
									<button
										class={[
											'w-full rounded-md py-1.5 text-xs font-semibold transition-colors',
											venue.myVote
												? 'bg-violet-500 text-white'
												: 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
										].join(' ')}
									>
										{venue.myVote ? '✓ voted' : 'vote'}
									</button>
								</form>
								{#if venue.voteCount > 0}
									<form method="POST" action="?/lockVenue" use:enhance>
										<input type="hidden" name="eventId" value={data.event.id} />
										<input type="hidden" name="venueId" value={venue.id} />
										<button
											class="rounded-md bg-zinc-700 px-3 py-1.5 text-xs text-zinc-400 transition-colors hover:bg-violet-600 hover:text-white"
										>
											lock
										</button>
									</form>
								{/if}
							</div>
						</li>
					{/each}
				</ul>
				<a href="/venues" class="text-xs text-zinc-600 hover:text-zinc-400">+ manage venues</a>
			{/if}
		{/if}
	</section>
	</div>

	<!-- Past events link -->
	<div class="text-center">
		<a href="/past" class="text-sm text-zinc-600 hover:text-zinc-400">past events →</a>
	</div>
</div>

<style>
	/* Beer sip: tilts back periodically as if someone's having a swig */
	@keyframes sip {
		0%, 70%, 100% { transform: rotate(0deg); }
		75%           { transform: rotate(-28deg) translateY(-3px); }
		82%           { transform: rotate(-22deg) translateY(-2px); }
		88%           { transform: rotate(-28deg) translateY(-3px); }
		94%           { transform: rotate(-5deg); }
	}

	/* Gentle wobble when the glass is set back down */
	@keyframes settle {
		94%, 100%     { transform: rotate(0deg); }
		96%           { transform: rotate(3deg); }
		98%           { transform: rotate(-2deg); }
	}

	.beer {
		display: inline-block;
		transform-origin: bottom right;
		animation: sip 5s ease-in-out infinite, settle 5s ease-in-out infinite;
		will-change: transform;
	}
</style>
