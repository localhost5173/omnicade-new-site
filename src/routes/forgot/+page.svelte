<script lang="ts">
	let { form } = $props();
</script>

<section class="wrap" style="padding-top:48px;padding-bottom:64px">
	<div class="sec-head">
		<p class="eyebrow">Omnicade players</p>
		<h2 class="h2">RESET YOUR <span class="gold">PASSWORD</span></h2>
		<p class="lede">Enter the address you signed up with and we will send a reset link.</p>
	</div>

	<div class="card" style="max-width:440px;margin:0 auto;padding:26px">
		{#if form?.success}
			<div class="banner ok">
				If that address has an account, a reset link is on its way. It works for one hour.
			</div>
		{:else}
			<form method="POST">
				<label class="field">
					<span>Email</span>
					<input class="input" type="email" name="email" required autocomplete="email" />
				</label>
				<button class="btn btn-gold" type="submit" style="width:100%">SEND RESET LINK</button>
			</form>
		{/if}
		<p class="lede" style="margin:16px 0 0;font-size:14px"><a href="/login">Back to log in</a></p>
	</div>
</section>
