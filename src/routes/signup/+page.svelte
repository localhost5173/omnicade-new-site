<script lang="ts">
	let { form } = $props();
</script>

<section class="wrap" style="padding-top:48px;padding-bottom:64px">
	<div class="sec-head">
		<p class="eyebrow">Omnicade players</p>
		<h2 class="h2">CREATE YOUR <span class="gold">ACCOUNT</span></h2>
		<p class="lede">Quit early? Your leftover minutes wait here instead of dying on the cabinet, and any Omnicade honors them.</p>
	</div>

	<div class="card" style="max-width:440px;margin:0 auto;padding:26px">
		{#if form?.success}
			<div class="banner ok">
				Account created! We sent a confirmation link to <strong>{form.email}</strong>.
				Open it and your account is live.
			</div>
		{:else}
			{#if form?.error}
				<div class="banner err">{form.error}</div>
			{/if}
			<form method="POST">
				<label class="field">
					<span>Email</span>
					<input class="input" type="email" name="email" value={form?.email ?? ''} required autocomplete="email" />
				</label>
				<label class="field">
					<span>Password</span>
					<input class="input" type="password" name="password" required minlength="8" autocomplete="new-password" />
				</label>
				<label class="field">
					<span>Password, again</span>
					<input class="input" type="password" name="password2" required minlength="8" autocomplete="new-password" />
				</label>
				<button class="btn btn-gold" type="submit" style="width:100%">CREATE ACCOUNT</button>
			</form>
			<p class="lede" style="margin:16px 0 0;font-size:14px">
				Already have one? <a href="/login">Log in</a>
			</p>
		{/if}
	</div>
</section>
