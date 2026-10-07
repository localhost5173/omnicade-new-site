<script lang="ts">
	import { getLocale, strings } from '$lib/i18n';

	const t = strings[getLocale()];
</script>

<footer id="contact">
	<div class="wrap">
		<div class="base">
			<div class="brand">
				<img class="logo" src="/logo.jpg" alt="Omnicade" width="220" height="122" />
				<p>{t.footer.tagline}</p>
				<a class="mail" href="mailto:beni@omnicade.se">beni@omnicade.se</a>
			</div>

			<nav aria-label="Footer">
				{#each t.footer.links as [label, href] (href)}
					<a {href}>{label}</a>
				{/each}
			</nav>

		</div>

		<p class="legal">
			© {new Date().getFullYear()} Omnicade
		</p>
	</div>
</footer>

<style>
	footer {
		border-top: 1px solid var(--line);
		padding: 72px 0 40px;
		background: linear-gradient(180deg, var(--bg), #050509);
	}

	.base {
		display: flex;
		align-items: flex-start;
		gap: 40px;
		flex-wrap: wrap;
	}

	.logo {
		display: block;
		width: 220px;
		height: auto;
		/* the jpg's pure-black box disappears into the page's near-black bg */
		mix-blend-mode: lighten;
	}

	.mail {
		display: inline-block;
		margin-top: 14px;
		font-size: 14px;
		font-weight: 600;
		letter-spacing: 0.04em;
		color: var(--dim);
		transition: color 0.15s ease;
	}

	.mail:hover {
		color: var(--accent);
	}

	.gold {
		color: var(--accent);
	}

	.brand p {
		color: var(--dim);
		font-size: 13px;
		margin-top: 6px;
	}

	nav {
		display: flex;
		gap: 18px;
		margin-left: auto;
		flex-wrap: wrap;
	}

	nav a {
		font-size: 13px;
		font-weight: 600;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--dim);
	}

	nav a:hover {
		color: var(--accent);
	}

	.legal {
		margin-top: 48px;
		color: var(--dim);
		font-size: 12.5px;
		letter-spacing: 0.04em;
		border-top: 1px solid var(--line);
		padding-top: 22px;
	}
</style>
