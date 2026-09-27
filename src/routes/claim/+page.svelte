<script lang="ts">
	let { data, form } = $props();
	const mins = $derived(data?.preview ? Math.floor(data.preview.seconds / 60) : 0);
</script>

<section class="wrap" style="padding-top:48px;padding-bottom:64px">
	<div class="sec-head">
		<p class="eyebrow">Omnicade players</p>
		<h2 class="h2">CLAIM YOUR <span class="gold">MINUTES</span></h2>
	</div>

	<div class="card" style="max-width:480px;margin:0 auto;padding:28px;text-align:center">
		{#if form?.success}
			<div class="banner ok">
				Done — <strong>{Math.floor((form.swept ?? 0) / 60)} min</strong> moved to your account
				(you now hold {Math.floor((form.balance ?? 0) / 60)} min).
			</div>
			<a class="btn btn-gold" href="/account" style="display:inline-block;margin-top:8px">GO TO YOUR ACCOUNT</a>
		{:else if form?.error}
			<div class="banner err">{form.error}</div>
			<a class="walk" href="/">Back to omnicade.eu</a>
		{:else if data?.unreachable}
			<div class="banner err">Can't reach the arcade service right now — your code is fine, try again in a moment.</div>
			<a class="walk" href="/">Back to omnicade.eu</a>
		{:else if data?.dead}
			<div class="banner err">This code is invalid or has expired. Quitting a session early always mints a fresh one on the cabinet's thanks screen.</div>
			<a class="walk" href="/">Back to omnicade.eu</a>
		{:else if data?.preview}
			<p style="font-family:var(--display);font-size:52px;line-height:1;margin:6px 0">
				{mins}<span style="font-size:20px;color:var(--dim)"> min</span>
			</p>
			<p class="lede" style="margin:0 0 18px">
				are waiting{data?.preview.arcade_name ? ` on ${data.preview.arcade_name}` : ''}'s card.
				Create an account (or log in) and they move under your login — ready on any Omnicade.
			</p>

			{#if data?.loggedIn}
				<form method="POST">
					<input type="hidden" name="code" value={data.code} />
					<button class="btn btn-gold" type="submit" style="width:100%">CLAIM THE MINUTES</button>
				</form>
			{:else}
				<a class="btn btn-gold" style="display:inline-block;margin-bottom:10px"
					href={`/login?next=${encodeURIComponent('/claim?code=' + (data?.code ?? ''))}`}>LOG IN & CLAIM</a>
				<a class="btn btn-ghost" style="display:inline-block"
					href={`/signup?next=${encodeURIComponent('/claim?code=' + (data?.code ?? ''))}`}>CREATE ACCOUNT</a>
			{/if}
		{:else}
			<div class="banner err">This page needs a claim code — scan the QR on the cabinet's thanks screen.</div>
			<a class="walk" href="/">Back to omnicade.eu</a>
		{/if}
	</div>
</section>
