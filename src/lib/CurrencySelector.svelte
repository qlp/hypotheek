<script lang="ts">
	import { currencies, type Currency } from '$lib/currencies';
	export let selectedCurrency: string;
	export let onCurrencyChange: (currency: string) => void;

	let searchTerm = '';
	let isOpen = false;

	$: filteredCurrencies = currencies.filter(
		(currency) =>
			currency.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
			currency.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
			currency.name.toLowerCase().includes(searchTerm.toLowerCase())
	);

	$: selectedCurrencyData = currencies.find((c) => c.code === selectedCurrency) || currencies[0];

	function selectCurrency(currency: Currency) {
		selectedCurrency = currency.code;
		onCurrencyChange(currency.code);
		isOpen = false;
		searchTerm = '';
	}

	function toggleDropdown() {
		isOpen = !isOpen;
		if (isOpen) {
			setTimeout(() => {
				const input = document.getElementById('currency-search') as HTMLInputElement;
				input?.focus();
			}, 0);
		}
	}
</script>

<div class="relative">
	<button
		type="button"
		onclick={toggleDropdown}
		class="px-3 py-1 text-sm rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 flex items-center justify-between min-w-24"
	>
		<span class="flex items-center space-x-1">
			<span class="font-mono">{selectedCurrencyData.symbol}</span>
			<span>{selectedCurrencyData.code}</span>
		</span>
		<svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"
			></path>
		</svg>
	</button>

	{#if isOpen}
		<div
			class="absolute z-50 w-80 mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-hidden"
		>
			<div class="p-2 border-b border-gray-200 dark:border-gray-600">
				<input
					id="currency-search"
					type="text"
					placeholder="Search currency..."
					bind:value={searchTerm}
					class="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
				/>
			</div>
			<div class="max-h-48 overflow-y-auto">
				{#each filteredCurrencies as currency (currency.code)}
					<button
						type="button"
						onclick={() => selectCurrency(currency)}
						class="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center space-x-2 {currency.code ===
						selectedCurrency
							? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
							: 'text-gray-900 dark:text-gray-100'}"
					>
						<span class="font-mono w-8">{currency.symbol}</span>
						<span class="w-12">{currency.code}</span>
						<span class="text-gray-500 dark:text-gray-400">- {currency.name}</span>
					</button>
				{/each}
			</div>
		</div>
	{/if}
</div>

<!-- Close dropdown when clicking outside -->
<svelte:window
	on:click={(e) => {
		if (!(e.target as Element)?.closest('.relative')) {
			isOpen = false;
			searchTerm = '';
		}
	}}
/>
