<script lang="ts">
	let { data, form } = $props();
</script>

<section class="wrap" style="padding-top:48px;padding-bottom:64px">
	<div class="sec-head">
		<p class="eyebrow">Omnicade players</p>
		<h2 class="h2">USE YOUR MINUTES <span class="gold">HERE</span></h2>
	</div>

	<div class="card" style="max-width:480px;margin:0 auto;padding:28px;text-align:center">
		{#if data?.unreachable}
			<div class="banner err">Can't reach the arcade service right now — the cabinet may be fine, try again in a moment.</div>
			<a class="walk" href="/">Back to omnicade.eu</a>
		{:else if !data?.machine}
			<div class="banner err">No cabinet answers to this code.</div>
			<a class="walk" href="/">Back to omnicade.eu</a>
		{:else if form?.success}
			<div class="banner ok">
				The cabinet has your account. Pick your time on its screen — your stored minutes pay, no card needed.
			</div>
		{:else if !data?.loggedIn}
			<p class="lede" style="margin:0 0 16px">
				Log in to link your minutes to <strong>{data.machine.arcade_name || data.machine.machine_id}</strong>.
			</p>
			<a class="btn btn-gold" style="display:inline-block" href={`/login?next=${encodeURIComponent('/m/' + data.machine.machine_id)}`}>LOG IN</a>
		{:else}
			<p class="lede" style="margin:0 0 6px">You are about to use your stored minutes on</p>
			<p style="font-family:var(--display);font-size:30px;margin:0 0 14px">
				{data.machine.arcade_name || data.machine.machine_id}
			</p>
			<p class="lede" style="margin:0 0 18px">
				Balance: <strong style="color:var(--ok)">{Math.floor((data.balance ?? 0) / 60)} min</strong>
			</p>
			{#if !data.machine.online}
				<div class="banner err">This cabinet is offline right now — try again when its screen is up.</div>
			{/if}
			<form method="POST">
				<button class="btn btn-gold" type="submit" disabled={!data.machine.online} style="width:100%">
					USE MY MINUTES ON THIS MACHINE
				</button>
			</form>
		{/if}
	</div>
</section>
