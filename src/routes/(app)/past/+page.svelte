<script lang="ts">
	import { enhance } from '$app/forms';
	import { formatEventDate } from '$lib/utils';
	import { page } from '$app/state';

	let { data } = $props();

	let expanded = $state<string | null>(null);

	function toggle(id: string) {
		expanded = expanded === id ? null : id;
	}

	const currentUserId = $derived(page.data.user?.id);
</script>

<div class="space-y-4">
	<div class="flex items-center gap-3">
		<a href="/" class="text-sm text-zinc-500 hover:text-zinc-300">← back</a>
		<h1 class="text-lg font-bold">past events</h1>
	</div>

	{#if data.events.length === 0}
		<p class="text-sm text-zinc-500">no past events yet</p>
	{:else}
		{#each data.events as event}
			<div class="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
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
					<div class="flex items-center gap-3 text-xs text-zinc-500">
						<span>{event.members.filter((m) => m.attending).length} coming</span>
						{#if event.lockedVenueName}
							<span class="text-zinc-600">{event.lockedVenueName}</span>
						{/if}
						<span class="text-zinc-600">{expanded === event.id ? '▲' : '▼'}</span>
					</div>
				</button>

				{#if expanded === event.id}
					<div class="border-t border-zinc-800 px-4 py-3 space-y-4">
						<!-- Attendance -->
						<div>
							<p class="mb-2 text-xs font-semibold uppercase tracking-widest text-zinc-500">attendance</p>

							<!-- Toggle for current user -->
							<div class="mb-3 flex gap-2">
								<form method="POST" action="?/toggleAttendance" use:enhance class="flex-1">
									<input type="hidden" name="eventId" value={event.id} />
									<input type="hidden" name="attending" value="true" />
									<button class={[
										'w-full rounded-lg py-2 text-xs font-semibold transition-colors',
										event.members.find(m => m.id === currentUserId)?.attending === true
											? 'bg-emerald-500 text-white'
											: 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
									].join(' ')}>I was there</button>
								</form>
								<form method="POST" action="?/toggleAttendance" use:enhance class="flex-1">
									<input type="hidden" name="eventId" value={event.id} />
									<input type="hidden" name="attending" value="false" />
									<button class={[
										'w-full rounded-lg py-2 text-xs font-semibold transition-colors',
										event.members.find(m => m.id === currentUserId)?.attending === false
											? 'bg-zinc-600 text-zinc-300'
											: 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
									].join(' ')}>wasn't there</button>
								</form>
							</div>

							<ul class="space-y-1">
								{#each event.members as member}
									<li class="flex items-center justify-between text-sm">
										<span class={member.attending === null ? 'text-zinc-600' : 'text-zinc-300'}>{member.name}</span>
										{#if member.attending === true}
											<span class="text-emerald-400 text-xs">✓</span>
										{:else if member.attending === false}
											<span class="text-zinc-600 text-xs">✗</span>
										{:else}
											<span class="text-zinc-700 text-xs">—</span>
										{/if}
									</li>
								{/each}
							</ul>
						</div>

						<!-- Food orders -->
						{#if event.foodOrders.length > 0}
							<div>
								<p class="mb-2 text-xs font-semibold uppercase tracking-widest text-zinc-500">
									food {event.lockedVenueName ? `· ${event.lockedVenueName}` : ''}
								</p>
								<ul class="space-y-1">
									{#each event.foodOrders as order}
										<li class="flex items-center justify-between text-sm">
											<span class="text-zinc-400">{order.userName}</span>
											<span class="text-zinc-200">{order.meal}</span>
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
