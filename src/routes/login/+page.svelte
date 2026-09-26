<script lang="ts">
	let { data, form } = $props();
	const resetDone = $derived(data?.reset ?? false);
</script>

<section class="wrap" style="padding-top:48px;padding-bottom:64px">
	<div class="sec-head">
		<p class="eyebrow">Omnicade players</p>
		<h2 class="h2">LOG <span class="gold">IN</span></h2>
		<p class="lede">Your stored minutes live here — check the balance, claim a cabinet code, keep what you paid for.</p>
	</div>

	<div class="card" style="max-width:440px;margin:0 auto;padding:26px">
		{#if form?.emailNotVerified}
			<div class="banner err">
				Confirm your email first — check the link we sent
				{#if form?.email}
					to <strong>{form.email}</strong>. It may take a minute; resend it from the mail's "didn't arrive" hint on
					<a href="/verify">the verify page</a>.
				{/if}
			</div>
		{:else if form?.error}
			<div class="banner err">{form.error}</div>
		{:else if resetDone}
			<div class="banner ok">Password updated — log in with the new one.</div>
		{/if}

		<form method="POST">
			<label class="field">
				<span>Email</span>
				<input class="input" type="email" name="email" value={form?.email ?? ''} required autocomplete="email" />
			</label>
			<label class="field">
				<span>Password</span>
				<input class="input" type="password" name="password" required autocomplete="current-password" />
			</label>
			<button class="btn btn-gold" type="submit" style="width:100%">LOG IN</button>
		</form>

		<p class="lede" style="margin:16px 0 0;font-size:14px">
			No account? <a href="/signup">Create one</a> · <a href="/forgot">Forgot the password?</a>
		</p>
	</div>
</section>
