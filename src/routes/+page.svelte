<script lang="ts">
	import { Effect } from 'effect';
	import {
		calculateMortgage,
		formatCurrency,
		type MortgageInputs,
		type MortgageResult
	} from '$lib';
	import MortgageChart from '$lib/MortgageChart.svelte';
	import MortgageDataTable from '$lib/MortgageDataTable.svelte';
	import ChartLegend from '$lib/ChartLegend.svelte';
	import SavingsComparisonTable from '$lib/SavingsComparisonTable.svelte';
	import SavingsBalanceChart from '$lib/SavingsBalanceChart.svelte';
	import CurrencySelector from '$lib/CurrencySelector.svelte';
	import { dutch, english } from '$lib/i18n';
	import { onMount } from 'svelte';

	const defaultInputs: MortgageInputs = {
		lening: 500000,
		rente: 5.0,
		looptijdJaren: 30,
		inflatie: 2,
		hraJaren: 15,
		belastingtarief: 37.48,
		hraLinearAfbouw: true,
		hraEindPercentage: 0,
		hypotheekType: 'annuiteit',
		beleggingsRendement: 6.0,
		vermogensheffing: 1.2,
		kredietRente: 12.0,
		currency: 'EUR'
	};

	let inputs: MortgageInputs = { ...defaultInputs };

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

	function saveInputs() {
		if (typeof localStorage !== 'undefined') {
			localStorage.setItem('hypotheek-inputs', JSON.stringify(inputs));
		}
	}

	function loadInputs() {
		if (typeof localStorage !== 'undefined') {
			const saved = localStorage.getItem('hypotheek-inputs');
			if (saved) {
				try {
					const parsed = JSON.parse(saved);
					// Merge with defaults to handle new fields
					inputs = { ...defaultInputs, ...parsed };
				} catch {
					console.warn('Failed to parse saved inputs, using defaults');
				}
			}
		}
	}

	function handleCurrencyChange(newCurrency: string) {
		inputs.currency = newCurrency;
		calculate();
	}

	function calculate() {
		calculating = true;
		showCalculating = false;

		// Save inputs after each calculation
		saveInputs();

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
		// Load saved inputs first
		loadInputs();

		// Use setTimeout to ensure DOM is updated with loaded values
		setTimeout(() => {
			// Initialize slider backgrounds after inputs are loaded
			const sliders = document.querySelectorAll('input[type="range"]');
			sliders.forEach((slider) => {
				updateSliderBackground(slider as HTMLInputElement);
			});
		}, 0);

		calculate();
	});
</script>

<div class="max-w-4xl mx-auto p-6 space-y-6">
	<div class="space-y-4">
		<div class="flex justify-between items-center">
			<h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100">{t.title}</h1>
			<div class="flex items-center space-x-2">
				<CurrencySelector
					selectedCurrency={inputs.currency}
					onCurrencyChange={handleCurrencyChange}
				/>
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
		<div
			class="text-xs text-gray-500 dark:text-gray-400 p-3 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-md"
		>
			{t.disclaimer}
		</div>
	</div>

	<div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
		<div class="space-y-4 lg:col-span-2">
			<h2 class="text-xl font-semibold text-gray-800 dark:text-gray-200">{t.parameters}</h2>

			<div class="space-y-3">
				<div>
					<div class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
						{t.mortgageType}
					</div>
					<div class="flex rounded-md border border-gray-300 dark:border-gray-600 overflow-hidden">
						<button
							type="button"
							onclick={() => {
								inputs.hypotheekType = 'annuiteit';
								calculate();
							}}
							class="flex-1 px-4 py-2 text-sm font-medium transition-colors {inputs.hypotheekType ===
							'annuiteit'
								? 'bg-blue-600 text-white'
								: 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'}"
						>
							{t.annuity}
						</button>
						<button
							type="button"
							onclick={() => {
								inputs.hypotheekType = 'lineair';
								calculate();
							}}
							class="flex-1 px-4 py-2 text-sm font-medium border-l border-gray-300 dark:border-gray-600 transition-colors {inputs.hypotheekType ===
							'lineair'
								? 'bg-blue-600 text-white'
								: 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'}"
						>
							{t.linear}
						</button>
					</div>
				</div>

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

				<div class="border-t pt-4 mt-4 space-y-3">
					<div>
						<label
							for="rendement"
							class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
						>
							{t.investmentReturn}
						</label>
						<div class="space-y-2">
							<input
								id="rendement"
								bind:value={inputs.beleggingsRendement}
								type="number"
								step="0.01"
								class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
								oninput={calculate}
							/>
							<input
								bind:value={inputs.beleggingsRendement}
								type="range"
								min="0"
								max="15"
								step="0.1"
								class="w-full"
								oninput={handleSliderInput}
							/>
						</div>
					</div>

					<div>
						<label
							for="vermogensheffing"
							class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
						>
							{t.wealthTax}
						</label>
						<div class="space-y-2">
							<input
								id="vermogensheffing"
								bind:value={inputs.vermogensheffing}
								type="number"
								step="0.01"
								class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
								oninput={calculate}
							/>
							<input
								bind:value={inputs.vermogensheffing}
								type="range"
								min="0"
								max="5"
								step="0.1"
								class="w-full"
								oninput={handleSliderInput}
							/>
						</div>
					</div>

					<div>
						<label
							for="kredietrente"
							class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
						>
							{t.creditInterest}
						</label>
						<div class="space-y-2">
							<input
								id="kredietrente"
								bind:value={inputs.kredietRente}
								type="number"
								step="0.01"
								class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
								oninput={calculate}
							/>
							<input
								bind:value={inputs.kredietRente}
								type="range"
								min="0"
								max="15"
								step="0.1"
								class="w-full"
								oninput={handleSliderInput}
							/>
						</div>
					</div>
				</div>
			</div>
		</div>

		<div class="space-y-4 lg:col-span-3">
			<h2 class="text-xl font-semibold text-gray-800 dark:text-gray-200">{t.results}</h2>

			{#if showCalculating}
				<div class="text-blue-600 dark:text-blue-400">{t.calculating}</div>
			{:else if result}
				<div class="space-y-6">
					<h3 class="text-lg font-semibold text-gray-800 dark:text-gray-300">
						{t.monthlyCostsOverTime}
					</h3>

					<div class="space-y-4">
						<MortgageChart
							data={result.monthlyData}
							title={t.nominalAmounts}
							isReal={false}
							showLegend={false}
							showComparison={true}
							{t}
							{locale}
							currency={inputs.currency}
						/>
						<MortgageChart
							data={result.monthlyData}
							title={t.realAmounts}
							isReal={true}
							showLegend={false}
							showComparison={true}
							{t}
							{locale}
							currency={inputs.currency}
						/>
						<ChartLegend {t} showComparison={true} />
					</div>

					<div class="overflow-x-auto mt-6">
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
										>{result.hypotheekType === 'annuiteit'
											? t.monthlyPayment
											: t.firstMonthlyPayment}</td
									>
									<td class="px-4 py-3 text-sm text-right text-gray-900 dark:text-gray-100"
										>{formatCurrency(result.annuiteit, locale, inputs.currency)}</td
									>
									<td class="px-4 py-3 text-sm text-right text-gray-900 dark:text-gray-100"
										>{formatCurrency(result.annuiteitReel, locale, inputs.currency)}</td
									>
								</tr>
								<tr>
									<td class="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100"
										>{t.totalPaid}</td
									>
									<td class="px-4 py-3 text-sm text-right text-gray-900 dark:text-gray-100"
										>{formatCurrency(result.totaalNominaal, locale, inputs.currency)}</td
									>
									<td class="px-4 py-3 text-sm text-right text-gray-900 dark:text-gray-100"
										>{formatCurrency(result.totaalReel, locale, inputs.currency)}</td
									>
								</tr>
								<tr class="bg-amber-50 dark:bg-amber-900/20">
									<td class="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100"
										>{t.extraCostsTotal}</td
									>
									<td class="px-4 py-3 text-sm text-right text-amber-700 dark:text-amber-400"
										>{formatCurrency(result.verschilNominaal, locale, inputs.currency)}</td
									>
									<td class="px-4 py-3 text-sm text-right text-amber-700 dark:text-amber-400"
										>{formatCurrency(result.verschilReel, locale, inputs.currency)}</td
									>
								</tr>
								<tr class="bg-amber-50 dark:bg-amber-900/20">
									<td class="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100"
										>{t.extraCostsMonthly}</td
									>
									<td class="px-4 py-3 text-sm text-right text-amber-700 dark:text-amber-400"
										>{formatCurrency(result.verschilNominaalPerMaand, locale, inputs.currency)}</td
									>
									<td class="px-4 py-3 text-sm text-right text-amber-700 dark:text-amber-400"
										>{formatCurrency(result.verschilReelPerMaand, locale, inputs.currency)}</td
									>
								</tr>
								{#if inputs.hypotheekType === 'annuiteit'}
									<tr class="bg-gray-100 dark:bg-gray-600">
										<td
											colspan="3"
											class="px-4 py-2 text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider text-center"
										>
											{t.comparisonWithLinear}
										</td>
									</tr>
									<tr class="bg-gray-50 dark:bg-gray-800">
										<td class="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100"
											>{t.extraCostsTotal} ({t.linear})</td
										>
										<td class="px-4 py-3 text-sm text-right text-gray-700 dark:text-gray-300"
											>{formatCurrency(result.linearExtraCosts, locale, inputs.currency)}</td
										>
										<td class="px-4 py-3 text-sm text-right text-gray-700 dark:text-gray-300"
											>{formatCurrency(result.linearExtraCostsReal, locale, inputs.currency)}</td
										>
									</tr>
									<tr class="bg-gray-50 dark:bg-gray-800">
										<td class="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100"
											>{t.extraCostsMonthly} ({t.linear})</td
										>
										<td class="px-4 py-3 text-sm text-right text-gray-700 dark:text-gray-300"
											>{formatCurrency(result.linearExtraCostsMonthly, locale, inputs.currency)}</td
										>
										<td class="px-4 py-3 text-sm text-right text-gray-700 dark:text-gray-300"
											>{formatCurrency(
												result.linearExtraCostsRealMonthly,
												locale,
												inputs.currency
											)}</td
										>
									</tr>
									<tr class="bg-purple-50 dark:bg-purple-900/20">
										<td class="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100"
											>{t.differenceCostComparison}</td
										>
										<td class="px-4 py-3 text-sm text-right text-purple-700 dark:text-purple-400"
											>{formatCurrency(
												result.linearExtraCosts - result.verschilNominaal,
												locale,
												inputs.currency
											)}</td
										>
										<td class="px-4 py-3 text-sm text-right text-purple-700 dark:text-purple-400"
											>{formatCurrency(
												result.linearExtraCostsReal - result.verschilReel,
												locale,
												inputs.currency
											)}</td
										>
									</tr>
									<tr class="bg-purple-50 dark:bg-purple-900/20">
										<td class="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100"
											>{t.differenceMonthlyComparison}</td
										>
										<td class="px-4 py-3 text-sm text-right text-purple-700 dark:text-purple-400"
											>{formatCurrency(
												result.linearExtraCostsMonthly - result.verschilNominaalPerMaand,
												locale,
												inputs.currency
											)}</td
										>
										<td class="px-4 py-3 text-sm text-right text-purple-700 dark:text-purple-400"
											>{formatCurrency(
												result.linearExtraCostsRealMonthly - result.verschilReelPerMaand,
												locale,
												inputs.currency
											)}</td
										>
									</tr>
									<tr class="bg-gray-100 dark:bg-gray-600">
										<td
											colspan="3"
											class="px-4 py-2 text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider text-center"
										>
											{t.investmentAccountSimulation}
										</td>
									</tr>
									<tr class="bg-blue-50 dark:bg-blue-900/20">
										<td class="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100"
											>{t.investmentAccountBalance} ({t.difference})</td
										>
										<td class="px-4 py-3 text-sm text-right text-blue-700 dark:text-blue-400"
											>{formatCurrency(result.savingsBalance, locale, inputs.currency)}</td
										>
										<td class="px-4 py-3 text-sm text-right text-blue-700 dark:text-blue-400"
											>{formatCurrency(result.savingsBalanceReal, locale, inputs.currency)}</td
										>
									</tr>
									<tr class="bg-blue-50 dark:bg-blue-900/20">
										<td class="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100"
											>{t.difference} {t.netDifferenceMonthly} ({t.investmentAccount})</td
										>
										<td class="px-4 py-3 text-sm text-right text-blue-700 dark:text-blue-400"
											>{formatCurrency(
												result.savingsBalance / (inputs.looptijdJaren * 12),
												locale,
												inputs.currency
											)}</td
										>
										<td class="px-4 py-3 text-sm text-right text-blue-700 dark:text-blue-400"
											>{formatCurrency(
												result.savingsBalanceReal / (inputs.looptijdJaren * 12),
												locale,
												inputs.currency
											)}</td
										>
									</tr>
									<tr class="bg-gray-100 dark:bg-gray-600">
										<td
											colspan="3"
											class="px-4 py-2 text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider text-center"
										>
											{t.netDifference}
										</td>
									</tr>
									<tr class="bg-green-50 dark:bg-green-900/20">
										<td class="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100"
											>{t.netDifferenceAnnuity}</td
										>
										<td
											class="px-4 py-3 text-sm text-right text-green-700 dark:text-green-400 font-semibold"
											>{formatCurrency(
												result.verschilNominaal - result.savingsBalance,
												locale,
												inputs.currency
											)}</td
										>
										<td
											class="px-4 py-3 text-sm text-right text-green-700 dark:text-green-400 font-semibold"
											>{formatCurrency(
												result.verschilReel - result.savingsBalanceReal,
												locale,
												inputs.currency
											)}</td
										>
									</tr>
									<tr class="bg-green-50 dark:bg-green-900/20">
										<td class="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100"
											>{t.netDifferenceMonthly} ({t.annuity})</td
										>
										<td
											class="px-4 py-3 text-sm text-right text-green-700 dark:text-green-400 font-semibold"
											>{formatCurrency(
												(result.verschilNominaal - result.savingsBalance) /
													(inputs.looptijdJaren * 12),
												locale,
												inputs.currency
											)}</td
										>
										<td
											class="px-4 py-3 text-sm text-right text-green-700 dark:text-green-400 font-semibold"
											>{formatCurrency(
												(result.verschilReel - result.savingsBalanceReal) /
													(inputs.looptijdJaren * 12),
												locale,
												inputs.currency
											)}</td
										>
									</tr>
									<tr class="bg-green-50 dark:bg-green-900/20">
										<td class="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100"
											>{t.netDifferenceLinear}</td
										>
										<td
											class="px-4 py-3 text-sm text-right text-green-700 dark:text-green-400 font-semibold"
											>{formatCurrency(result.linearExtraCosts, locale, inputs.currency)}</td
										>
										<td
											class="px-4 py-3 text-sm text-right text-green-700 dark:text-green-400 font-semibold"
											>{formatCurrency(result.linearExtraCostsReal, locale, inputs.currency)}</td
										>
									</tr>
									<tr class="bg-green-50 dark:bg-green-900/20">
										<td class="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100"
											>{t.netDifferenceMonthly} ({t.linear})</td
										>
										<td
											class="px-4 py-3 text-sm text-right text-green-700 dark:text-green-400 font-semibold"
											>{formatCurrency(result.linearExtraCostsMonthly, locale, inputs.currency)}</td
										>
										<td
											class="px-4 py-3 text-sm text-right text-green-700 dark:text-green-400 font-semibold"
											>{formatCurrency(
												result.linearExtraCostsRealMonthly,
												locale,
												inputs.currency
											)}</td
										>
									</tr>
									<tr
										class="bg-purple-50 dark:bg-purple-900/20 border-t-2 border-purple-300 dark:border-purple-700"
									>
										<td class="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100"
											>{t.finalNetDifference}</td
										>
										<td
											class="px-4 py-3 text-sm text-right text-purple-700 dark:text-purple-400 font-bold"
											>{formatCurrency(
												result.linearExtraCosts - (result.verschilNominaal - result.savingsBalance),
												locale,
												inputs.currency
											)}</td
										>
										<td
											class="px-4 py-3 text-sm text-right text-purple-700 dark:text-purple-400 font-bold"
											>{formatCurrency(
												result.linearExtraCostsReal -
													(result.verschilReel - result.savingsBalanceReal),
												locale,
												inputs.currency
											)}</td
										>
									</tr>
									<tr class="bg-purple-50 dark:bg-purple-900/20">
										<td class="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100"
											>{t.finalNetDifference} ({t.netDifferenceMonthly})</td
										>
										<td
											class="px-4 py-3 text-sm text-right text-purple-700 dark:text-purple-400 font-bold"
											>{formatCurrency(
												(result.linearExtraCosts -
													(result.verschilNominaal - result.savingsBalance)) /
													(inputs.looptijdJaren * 12),
												locale,
												inputs.currency
											)}</td
										>
										<td
											class="px-4 py-3 text-sm text-right text-purple-700 dark:text-purple-400 font-bold"
											>{formatCurrency(
												(result.linearExtraCostsReal -
													(result.verschilReel - result.savingsBalanceReal)) /
													(inputs.looptijdJaren * 12),
												locale,
												inputs.currency
											)}</td
										>
									</tr>
								{/if}
							</tbody>
						</table>
					</div>

					{#if inputs.hypotheekType === 'annuiteit'}
						<SavingsBalanceChart
							data={result.monthlyData}
							{t}
							{locale}
							beleggingsRendement={inputs.beleggingsRendement}
							vermogensheffing={inputs.vermogensheffing}
							hypotheekType={inputs.hypotheekType}
							kredietRente={inputs.kredietRente}
							currency={inputs.currency}
						/>
					{/if}
				</div>
			{/if}
		</div>
	</div>

	{#if result}
		<MortgageDataTable data={result.monthlyData} {t} {locale} currency={inputs.currency} />
		<SavingsComparisonTable
			data={result.monthlyData}
			{t}
			{locale}
			beleggingsRendement={inputs.beleggingsRendement}
			vermogensheffing={inputs.vermogensheffing}
			hypotheekType={inputs.hypotheekType}
			kredietRente={inputs.kredietRente}
			currency={inputs.currency}
		/>
	{/if}

	<div
		class="text-xs text-gray-500 dark:text-gray-400 mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-md"
	>
		{t.disclaimer}
	</div>
</div>
