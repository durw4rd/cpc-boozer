<script lang="ts">
	import { enhance } from '$app/forms';
	import { formatEventDate } from '$lib/utils';
	import { page } from '$app/state';
	import { withPending } from '$lib/pending';

	let { data } = $props();

	let expanded = $state<string | null>(null);

	function toggle(id: string) {
		expanded = expanded === id ? null : id;
	}

	const currentUserId = $derived(page.data.user?.id);
</script>

<div class="space-y-4">
	<div class="flex items-center gap-3">
		<a href="/" class="text-sm text-white/50 hover:text-white">← back</a>
		<h1 class="text-lg font-bold">past events</h1>
	</div>

	{#if data.events.length === 0}
		<p class="text-sm text-white/40">no past events yet</p>
	{:else}
		{#each data.events as event}
			<div class="overflow-hidden rounded-xl border border-white/10 bg-black/60 backdrop-blur-sm">
				<button
					onclick={() => toggle(event.id)}
					class="flex w-full items-center justify-between px-4 py-3 text-left"
				>
					<div>
						<p class="text-sm font-medium">{formatEventDate(event.date)}</p>
						{#if event.label}
							<p class="text-xs text-orange-400">{event.label}</p>
						{/if}
					</div>
					<div class="flex items-center gap-3 text-xs text-white/40">
						<span>{event.members.filter((m) => m.attending).length} coming</span>
						{#if event.lockedVenueName}
							<span class="text-white/30">{event.lockedVenueName}</span>
						{/if}
						<span class="text-white/30">{expanded === event.id ? '▲' : '▼'}</span>
					</div>
				</button>

				{#if expanded === event.id}
					<div class="space-y-4 border-t border-white/10 px-4 py-3">
						<div>
							<p class="mb-2 text-xs font-semibold uppercase tracking-widest text-white/40">attendance</p>
							<div class="mb-3 flex gap-2">
								<form method="POST" action="?/toggleAttendance" use:enhance={withPending} class="flex-1">
									<input type="hidden" name="eventId" value={event.id} />
									<input type="hidden" name="attending" value="true" />
									<button class={[
										'w-full rounded-lg py-2 text-xs font-semibold transition-colors',
										event.members.find(m => m.id === currentUserId)?.attending === true
											? 'bg-emerald-500 text-white'
											: 'bg-white/10 text-white/50 hover:bg-white/15'
									].join(' ')}>I was there</button>
								</form>
								<form method="POST" action="?/toggleAttendance" use:enhance={withPending} class="flex-1">
									<input type="hidden" name="eventId" value={event.id} />
									<input type="hidden" name="attending" value="false" />
									<button class={[
										'w-full rounded-lg py-2 text-xs font-semibold transition-colors',
										event.members.find(m => m.id === currentUserId)?.attending === false
											? 'bg-white/20 text-white/70'
											: 'bg-white/10 text-white/50 hover:bg-white/15'
									].join(' ')}>wasn't there</button>
								</form>
							</div>
							<ul class="space-y-1">
								{#each event.members as member}
									<li class="flex items-center justify-between text-sm">
										<span class={member.attending === null ? 'text-white/30' : 'text-white/80'}>{member.name}</span>
										{#if member.attending === true}
											<span class="text-xs text-emerald-400">✓</span>
										{:else if member.attending === false}
											<span class="text-xs text-white/30">✗</span>
										{:else}
											<span class="text-xs text-white/20">—</span>
										{/if}
									</li>
								{/each}
							</ul>
						</div>

						{#if event.foodOrders.length > 0}
							<div>
								<p class="mb-2 text-xs font-semibold uppercase tracking-widest text-white/40">
									food {event.lockedVenueName ? `· ${event.lockedVenueName}` : ''}
								</p>
								<ul class="space-y-1">
									{#each event.foodOrders as order}
										<li class="flex items-center justify-between text-sm">
											<span class="text-white/50">{order.userName}</span>
											<span class="text-white/90">{order.meal}</span>
										</li>
									{/each}
								</ul>
							</div>
						{/if}
					</div>
				{/if}
			</div>
		{/each}
	{/if}
</div>
