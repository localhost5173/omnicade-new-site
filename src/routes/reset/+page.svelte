<script lang="ts">
	let { data, form } = $props();
</script>

<section class="wrap" style="padding-top:48px;padding-bottom:64px">
	<div class="sec-head">
		<p class="eyebrow">Omnicade players</p>
		<h2 class="h2">CHOOSE A NEW <span class="gold">PASSWORD</span></h2>
	</div>

	<div class="card" style="max-width:440px;margin:0 auto;padding:26px">
		{#if !data?.token}
			<div class="banner err">This page needs the link from your reset mail.</div>
		{:else if form?.error}
			<div class="banner err">{form.error}</div>
		{/if}

		{#if data?.token}
			<form method="POST">
				<input type="hidden" name="token" value={data.token} />
				<label class="field">
					<span>New password</span>
					<input class="input" type="password" name="password" required minlength="8" autocomplete="new-password" />
				</label>
				<label class="field">
					<span>New password, again</span>
					<input class="input" type="password" name="password2" required minlength="8" autocomplete="new-password" />
				</label>
				<button class="btn btn-gold" type="submit" style="width:100%">SET PASSWORD</button>
			</form>
		{/if}
	</div>
</section>
