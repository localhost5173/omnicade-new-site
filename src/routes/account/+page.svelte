<script lang="ts">
	let { data } = $props();
	const me = $derived(data.me);
	const mins = $derived(Math.floor(me.account.balance_seconds / 60));
	const minsLabel = (s: number) => `${Math.floor(s / 60)} min`;
	const reasonLabel: Record<string, string> = {
		bank_leftover: 'Banked leftover',
		stack_on_payment: 'Applied to a session',
		claim_sweep: 'Claimed from a cabinet',
		reserve: 'Reserved for a session',
		settle_refund: 'Unused time returned',
		spend: 'Played a session',
		release: 'Reservation returned',
		expire: 'Expired',
		admin_credit: 'Support credit'
	};
	const when = (iso: string) =>
		new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
</script>

<section class="wrap" style="padding-top:48px;padding-bottom:64px">
	<div class="sec-head">
		<p class="eyebrow">Omnicade players</p>
		<h2 class="h2">YOUR <span class="gold">MINUTES</span></h2>
	</div>

	<div style="max-width:720px;margin:0 auto">
		<div class="card" style="padding:24px;display:flex;align-items:center;gap:22px;flex-wrap:wrap">
			<div>
				<p class="mins" style="font-family:var(--display);font-size:44px;line-height:1;margin:0">
					{mins}<span style="font-size:18px;color:var(--dim)"> min</span>
				</p>
				<p class="lede" style="margin:6px 0 0;font-size:13px">
					{me.account.email} ·
					{#if me.account.email_verified}<span style="color:var(--ok)">verified</span>{:else}<span style="color:var(--warn)">unverified</span>{/if}
				</p>
			</div>
			<div style="flex:1"></div>
			<form method="POST" action="?/logout">
				<button class="btn btn-ghost" type="submit">LOG OUT</button>
			</form>
		</div>

		{#if me.cards.length > 0}
			<h3 class="eyebrow" style="margin:28px 0 10px">Linked payment cards</h3>
			{#each me.cards as card (card.card_hash_masked)}
				<div class="card" style="padding:14px 18px;margin-bottom:10px;display:flex;gap:16px;align-items:center">
					<span style="font-family:var(--ui);font-size:14px">{card.card_hash_masked}</span>
					<span style="flex:1"></span>
					<span class="badge ok">{minsLabel(card.balance_seconds)} banked</span>
				</div>
			{/each}
			<p class="lede" style="font-size:13px">
				Pay with the same card again and its banked time joins your next session automatically.
			</p>
		{/if}

		<h3 class="eyebrow" style="margin:28px 0 10px">Recent activity</h3>
		<div class="card" style="padding:0">
			<table style="width:100%;border-collapse:collapse;font-family:var(--ui);font-size:14px">
				<tbody>
					{#each me.entries as e (e.created_at + e.reason)}
						<tr style="border-bottom:1px solid var(--line)">
							<td style="padding:10px 16px">{reasonLabel[e.reason] ?? e.reason}</td>
							<td style="padding:10px 16px;color:var(--dim)">{e.machine_id ?? ''}</td>
							<td style="padding:10px 16px;text-align:right;white-space:nowrap">{when(e.created_at)}</td>
							<td style="padding:10px 16px;text-align:right;white-space:nowrap;color:{e.delta_seconds >= 0 ? 'var(--ok)' : 'var(--danger)'}">
								{e.delta_seconds >= 0 ? '+' : ''}{minsLabel(Math.abs(e.delta_seconds))}{e.delta_seconds >= 0 ? '' : ' (used)'}
							</td>
						</tr>
					{:else}
						<tr><td style="padding:14px 16px;color:var(--dim)">Nothing yet. Play a session and quit early to bank minutes here.</td></tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</section>
