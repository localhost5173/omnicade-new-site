<script lang="ts">
	let { data, form } = $props();
</script>

<section class="wrap" style="padding-top:48px;padding-bottom:64px">
	<div class="sec-head">
		<p class="eyebrow">Omnicade players</p>
		<h2 class="h2">CONFIRM YOUR <span class="gold">EMAIL</span></h2>
	</div>

	<div class="card" style="max-width:440px;margin:0 auto;padding:26px">
		{#if form?.resent}
			<div class="banner ok">If that address has an unconfirmed account, a fresh link is on its way.</div>
		{:else if data?.state === 'verified'}
			<div class="banner ok">Email confirmed — your account is live. See you at the cabinet!</div>
			<a class="btn btn-gold" href="/login" style="display:inline-block;margin-top:8px">LOG IN</a>
		{:else if data?.state === 'missing'}
			<p class="lede">This page needs the link from your confirmation mail.</p>
		{:else}
			<div class="banner err">That link is invalid or has expired.</div>
			<p class="lede" style="margin-top:0">Enter your email and we will send a fresh one.</p>
			<form method="POST" action="?/resend">
				<label class="field">
					<span>Email</span>
					<input class="input" type="email" name="email" required />
				</label>
				<button class="btn btn-gold" type="submit" style="width:100%">RESEND LINK</button>
			</form>
		{/if}
	</div>
</section>
