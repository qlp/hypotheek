<script lang="ts">
	import type { Translations } from '$lib/i18n';

	export let t: Translations;
	export let showComparison: boolean = false;
</script>

<div class="flex justify-center space-x-6 py-4">
	<div class="flex items-center space-x-2">
		<div class="w-4 h-4 bg-blue-500 rounded-sm"></div>
		<span class="text-sm text-gray-700 dark:text-gray-300">{t.repayment}</span>
	</div>
	<div class="flex items-center space-x-2">
		<div class="w-4 h-4 bg-red-500 rounded-sm"></div>
		<span class="text-sm text-gray-700 dark:text-gray-300">{t.netInterest}</span>
	</div>
	<div class="flex items-center space-x-2">
		<div class="w-4 h-4 bg-green-500 rounded-sm"></div>
		<span class="text-sm text-gray-700 dark:text-gray-300">{t.hraBenefit}</span>
	</div>
	{#if showComparison}
		<div class="flex items-center space-x-2">
			<div class="w-4 h-1 bg-purple-600"></div>
			<span class="text-sm text-gray-700 dark:text-gray-300">{t.comparison}</span>
		</div>
	{/if}
</div>
