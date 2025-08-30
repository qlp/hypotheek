<script lang="ts">
	import { Effect } from 'effect';
	import { calculateMortgage, formatEuro, type MortgageInputs, type MortgageResult } from '$lib';
	import MortgageChart from '$lib/MortgageChart.svelte';
	import MortgageDataTable from '$lib/MortgageDataTable.svelte';
	import ChartLegend from '$lib/ChartLegend.svelte';
	import { dutch, english } from '$lib/i18n';
	import { onMount } from 'svelte';

	let inputs: MortgageInputs = {
		lening: 500000,
		rente: 5.0,
		looptijdJaren: 30,
		inflatie: 2,
		hraJaren: 15,
		belastingtarief: 37.48,
		hraLinearAfbouw: true,
		hraEindPercentage: 0
	};

	let result: MortgageResult | null = null;
	let calculating = false;
	let showCalculating = false;
	let language: 'nl' | 'en' = 'nl';

	$: t = language === 'nl' ? dutch : english;
	$: locale = language === 'nl' ? 'nl-NL' : 'en-US';

	function updateSliderBackground(element: HTMLInputElement) {
		const min = parseFloat(element.min);
		const max = parseFloat(element.max);
		const value = parseFloat(element.value);
		const percentage = ((value - min) / (max - min)) * 100;

		const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
		const trackColor = isDark ? '#4b5563' : '#e5e7eb';

		element.style.background = `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${percentage}%, ${trackColor} ${percentage}%, ${trackColor} 100%)`;
	}

	function handleSliderInput(event: Event) {
		const target = event.target as HTMLInputElement;
		updateSliderBackground(target);
		calculate();
	}

	function calculate() {
		calculating = true;
		showCalculating = false;

		// Toon "Berekenen..." alleen na 200ms
		const timer = setTimeout(() => {
			if (calculating) {
				showCalculating = true;
			}
		}, 200);

		const program = Effect.gen(function* () {
			yield* Effect.sleep('50 millis');
			return yield* calculateMortgage(inputs);
		});

		Effect.runPromise(program).then((res) => {
			clearTimeout(timer);
			result = res;
			calculating = false;
			showCalculating = false;
		});
	}

	onMount(() => {
		calculate();

		// Initialize slider backgrounds
		const sliders = document.querySelectorAll('input[type="range"]');
		sliders.forEach((slider) => {
			updateSliderBackground(slider as HTMLInputElement);
		});
	});
</script>

<div class="max-w-4xl mx-auto p-6 space-y-6">
	<div class="flex justify-between items-center">
		<h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100">{t.title}</h1>
		<div class="flex space-x-2">
			<button
				onclick={() => (language = 'nl')}
				class="px-3 py-1 text-sm rounded {language === 'nl'
					? 'bg-blue-600 text-white'
					: 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}"
			>
				NL
			</button>
			<button
				onclick={() => (language = 'en')}
				class="px-3 py-1 text-sm rounded {language === 'en'
					? 'bg-blue-600 text-white'
					: 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}"
			>
				EN
			</button>
		</div>
	</div>

	<div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
		<div class="space-y-4 lg:col-span-2">
			<h2 class="text-xl font-semibold text-gray-800 dark:text-gray-200">{t.parameters}</h2>

			<div class="space-y-3">
				<div>
					<label
						for="lening"
						class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
						>{t.loanAmount}</label
					>
					<div class="space-y-2">
						<input
							id="lening"
							bind:value={inputs.lening}
							type="number"
							class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							oninput={calculate}
						/>
						<input
							bind:value={inputs.lening}
							type="range"
							min="100000"
							max="1500000"
							step="10000"
							class="w-full"
							oninput={handleSliderInput}
						/>
					</div>
				</div>

				<div>
					<label for="rente" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
						>{t.interestRate}</label
					>
					<div class="space-y-2">
						<input
							id="rente"
							bind:value={inputs.rente}
							type="number"
							step="0.01"
							class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							oninput={calculate}
						/>
						<input
							bind:value={inputs.rente}
							type="range"
							min="1"
							max="10"
							step="0.1"
							class="w-full"
							oninput={handleSliderInput}
						/>
					</div>
				</div>

				<div>
					<label
						for="looptijd"
						class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
						>{t.duration}</label
					>
					<div class="space-y-2">
						<input
							id="looptijd"
							bind:value={inputs.looptijdJaren}
							type="number"
							class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							oninput={calculate}
						/>
						<input
							bind:value={inputs.looptijdJaren}
							type="range"
							min="5"
							max="40"
							step="1"
							class="w-full"
							oninput={handleSliderInput}
						/>
					</div>
				</div>

				<div>
					<label
						for="inflatie"
						class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
						>{t.inflation}</label
					>
					<div class="space-y-2">
						<input
							id="inflatie"
							bind:value={inputs.inflatie}
							type="number"
							step="0.01"
							class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							oninput={calculate}
						/>
						<input
							bind:value={inputs.inflatie}
							type="range"
							min="0"
							max="8"
							step="0.1"
							class="w-full"
							oninput={handleSliderInput}
						/>
					</div>
				</div>

				<div>
					<div class="flex items-center space-x-2 mb-1">
						<label for="hra" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
							{inputs.hraLinearAfbouw ? t.hraReductionPeriodLabel : t.hraYearsLabel}
						</label>
						<div class="group relative">
							<span class="text-gray-400 cursor-help">ℹ️</span>
							<div
								class="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900 text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10"
							>
								{t.hraTooltip}
							</div>
						</div>
					</div>
					<div class="space-y-2">
						<input
							id="hra"
							bind:value={inputs.hraJaren}
							type="number"
							class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							oninput={calculate}
						/>
						<input
							bind:value={inputs.hraJaren}
							type="range"
							min="0"
							max="30"
							step="1"
							class="w-full"
							oninput={handleSliderInput}
						/>
					</div>
				</div>

				<div>
					<div class="flex items-center space-x-2 mb-1">
						<label
							for="belasting"
							class="block text-sm font-medium text-gray-700 dark:text-gray-300"
						>
							{inputs.hraLinearAfbouw ? t.hraStartPercentageLabel : t.taxRateLabel}
						</label>
						<div class="group relative">
							<span class="text-gray-400 cursor-help">ℹ️</span>
							<div
								class="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900 text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10"
							>
								{t.hraTooltip}
							</div>
						</div>
					</div>
					<div class="space-y-2">
						<input
							id="belasting"
							bind:value={inputs.belastingtarief}
							type="number"
							step="0.01"
							class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							oninput={calculate}
						/>
						<input
							bind:value={inputs.belastingtarief}
							type="range"
							min="20"
							max="55"
							step="0.1"
							class="w-full"
							oninput={handleSliderInput}
						/>
					</div>
				</div>

				<div>
					<label class="flex items-center space-x-2">
						<input
							type="checkbox"
							bind:checked={inputs.hraLinearAfbouw}
							onchange={calculate}
							class="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 bg-white dark:bg-gray-700"
						/>
						<span class="text-sm font-medium text-gray-700 dark:text-gray-300"
							>{t.hraLinearReduction}</span
						>
					</label>
				</div>

				{#if inputs.hraLinearAfbouw}
					<div>
						<div class="flex items-center space-x-2 mb-1">
							<label
								for="hraEind"
								class="block text-sm font-medium text-gray-700 dark:text-gray-300"
							>
								{t.hraEndPercentage}
							</label>
							<div class="group relative">
								<span class="text-gray-400 cursor-help">ℹ️</span>
								<div
									class="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900 text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10"
								>
									{t.hraTooltip}
								</div>
							</div>
						</div>
						<div class="space-y-2">
							<input
								id="hraEind"
								bind:value={inputs.hraEindPercentage}
								type="number"
								step="0.01"
								class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
								oninput={calculate}
							/>
							<input
								bind:value={inputs.hraEindPercentage}
								type="range"
								min="0"
								max="20"
								step="0.1"
								class="w-full"
								oninput={handleSliderInput}
							/>
						</div>
					</div>
				{/if}
			</div>
		</div>

		<div class="space-y-4 lg:col-span-3">
			<h2 class="text-xl font-semibold text-gray-800 dark:text-gray-200">{t.results}</h2>

			{#if showCalculating}
				<div class="text-blue-600 dark:text-blue-400">{t.calculating}</div>
			{:else if result}
				<div class="overflow-x-auto">
					<table
						class="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
					>
						<thead class="bg-gray-50 dark:bg-gray-700">
							<tr>
								<th
									class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
									>{t.metric}</th
								>
								<th
									class="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
									>{t.nominal}</th
								>
								<th
									class="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
									>{t.real}</th
								>
							</tr>
						</thead>
						<tbody class="divide-y divide-gray-200">
							<tr>
								<td class="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100"
									>{t.monthlyPayment}</td
								>
								<td class="px-4 py-3 text-sm text-right text-gray-900 dark:text-gray-100"
									>{formatEuro(result.annuiteit, locale)}</td
								>
								<td class="px-4 py-3 text-sm text-right text-gray-900 dark:text-gray-100"
									>{formatEuro(result.annuiteitReel, locale)}</td
								>
							</tr>
							<tr>
								<td class="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100"
									>{t.totalPaid}</td
								>
								<td class="px-4 py-3 text-sm text-right text-gray-900 dark:text-gray-100"
									>{formatEuro(result.totaalNominaal, locale)}</td
								>
								<td class="px-4 py-3 text-sm text-right text-gray-900 dark:text-gray-100"
									>{formatEuro(result.totaalReel, locale)}</td
								>
							</tr>
							<tr class="bg-amber-50 dark:bg-amber-900/20">
								<td class="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100"
									>{t.extraCostsTotal}</td
								>
								<td class="px-4 py-3 text-sm text-right text-amber-700 dark:text-amber-400"
									>{formatEuro(result.verschilNominaal, locale)}</td
								>
								<td class="px-4 py-3 text-sm text-right text-amber-700 dark:text-amber-400"
									>{formatEuro(result.verschilReel, locale)}</td
								>
							</tr>
							<tr class="bg-amber-50 dark:bg-amber-900/20">
								<td class="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100"
									>{t.extraCostsMonthly}</td
								>
								<td class="px-4 py-3 text-sm text-right text-amber-700 dark:text-amber-400"
									>{formatEuro(result.verschilNominaalPerMaand, locale)}</td
								>
								<td class="px-4 py-3 text-sm text-right text-amber-700 dark:text-amber-400"
									>{formatEuro(result.verschilReelPerMaand, locale)}</td
								>
							</tr>
						</tbody>
					</table>
				</div>

				{#if result}
					<div class="space-y-6 mt-6">
						<h3 class="text-lg font-semibold text-gray-800 dark:text-gray-300">
							{t.monthlyCostsOverTime}
						</h3>

						<div class="space-y-4">
							<MortgageChart
								data={result.monthlyData}
								title={t.nominalAmounts}
								isReal={false}
								showLegend={false}
								{t}
								{locale}
							/>
							<MortgageChart
								data={result.monthlyData}
								title={t.realAmounts}
								isReal={true}
								showLegend={false}
								{t}
								{locale}
							/>
							<ChartLegend {t} />
						</div>
					</div>
				{/if}
			{/if}
		</div>
	</div>

	{#if result}
		<MortgageDataTable data={result.monthlyData} {t} {locale} />
	{/if}

	<div
		class="text-xs text-gray-500 dark:text-gray-400 mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-md"
	>
		{t.disclaimer}
	</div>
</div>
