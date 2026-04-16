<script lang="ts">
	import { enhance } from '$app/forms';
	import { formatEventDate } from '$lib/utils';

	let { data } = $props();

	// svelte-ignore state_referenced_locally
	let orderInput = $state(data.currentUserOrder ?? '');
	let savingOrder = $state(false);
</script>

<div class="space-y-6">
	<!-- Event header -->
	<div>
		<p class="text-xs font-medium uppercase tracking-widest text-zinc-500">next up</p>
		<h1 class="text-2xl font-bold">{formatEventDate(data.event.date)}</h1>
		{#if data.event.label}
			<p class="mt-1 text-sm text-amber-400">{data.event.label}</p>
		{/if}
	</div>

	<!-- Attendance -->
	<section class="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
		<h2 class="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-500">attendance</h2>

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
	<section class="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
		<h2 class="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-500">food order</h2>

		{#if data.lockedVenue}
			<!-- Venue locked — show order input -->
			<div class="mb-4 flex items-center gap-2">
				<span class="text-sm font-medium text-amber-400">{data.lockedVenue.name}</span>
				<span class="rounded bg-amber-400/10 px-1.5 py-0.5 text-xs text-amber-400">locked</span>
			</div>

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
					class="flex-1 rounded-lg bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 outline-none ring-1 ring-zinc-700 focus:ring-amber-400"
				/>
				<button
					disabled={savingOrder || !orderInput.trim()}
					class="rounded-lg bg-amber-400 px-3 py-2 text-sm font-semibold text-zinc-950 transition-opacity disabled:opacity-40"
				>
					{savingOrder ? '…' : 'save'}
				</button>
			</form>

			{#if data.foodOrders.length > 0}
				<ul class="space-y-1.5">
					{#each data.foodOrders as order}
						<li class="flex items-center justify-between text-sm">
							<span class="text-zinc-400">{order.userName}</span>
							<span class="text-zinc-200">{order.meal}</span>
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
					no venues saved yet — <a href="/venues" class="text-amber-400 hover:underline"
						>add one</a
					>
				</p>
			{:else}
				<ul class="mb-3 space-y-2">
					{#each data.venues as venue}
						<li class="flex items-center gap-2">
							<form method="POST" action="?/voteVenue" use:enhance class="flex flex-1 items-center gap-2">
								<input type="hidden" name="eventId" value={data.event.id} />
								<input type="hidden" name="venueId" value={venue.id} />
								<button
									class={[
										'flex flex-1 items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors',
										venue.myVote
											? 'bg-amber-400/15 ring-1 ring-amber-400/40 text-zinc-100'
											: 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
									].join(' ')}
								>
									<span>{venue.name}</span>
									<span class={venue.myVote ? 'text-amber-400 font-semibold' : 'text-zinc-500'}>
										{venue.voteCount}
									</span>
								</button>
							</form>
							{#if venue.voteCount > 0}
								<form method="POST" action="?/lockVenue" use:enhance>
									<input type="hidden" name="eventId" value={data.event.id} />
									<input type="hidden" name="venueId" value={venue.id} />
									<button
										class="rounded-lg bg-zinc-800 px-2.5 py-2 text-xs text-zinc-400 transition-colors hover:bg-amber-400 hover:text-zinc-950"
										title="lock this venue"
									>
										lock
									</button>
								</form>
							{/if}
						</li>
					{/each}
				</ul>
				<a href="/venues" class="text-xs text-zinc-600 hover:text-zinc-400">+ manage venues</a>
			{/if}
		{/if}
	</section>

	<!-- Past events link -->
	<div class="text-center">
		<a href="/past" class="text-sm text-zinc-600 hover:text-zinc-400">past events →</a>
	</div>
</div>
