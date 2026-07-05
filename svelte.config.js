import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter({
			// EU region only — GDPR posture (Frankfurt)
			regions: ['fra1'],
			runtime: 'nodejs22.x'
		})
	}
};

export default config;
