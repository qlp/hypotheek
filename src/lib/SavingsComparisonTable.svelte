<script lang="ts">
	import type { MonthlyData } from '$lib';
	import { formatCurrency } from '$lib';
	import type { Translations } from '$lib/i18n';

	export let data: MonthlyData[];
	export let t: Translations;
	export let locale: string;
	export let beleggingsRendement: number;
	export let vermogensheffing: number;
	export let hypotheekType: 'annuiteit' | 'lineair';
	export let kredietRente: number;
	export let currency: string;

	function getYearlyData() {
		const yearlyData: Array<{
			year: number;
			verschil: number;
			rendement: number;
			belasting: number;
			saldo: number;
		}> = [];

		// Export final balance for use in parent component
		let finalBalance = 0;

		let saldo = 0;
		const rendementsPercentage = beleggingsRendement / 100;
		const belastingPercentage = vermogensheffing / 100;
		const kredietPercentage = kredietRente / 100;

		for (let jaar = 1; jaar <= Math.ceil(data.length / 12); jaar++) {
			const startMaand = (jaar - 1) * 12;
			const eindMaand = Math.min(jaar * 12, data.length);

			// Som het maandelijkse verschil voor dit jaar
			let jaarVerschil = 0;
			for (let i = startMaand; i < eindMaand; i++) {
				if (data[i]) {
					if (hypotheekType === 'lineair') {
						// Voor lineair: verschil is hoeveel meer je betaalt dan annuiteit
						jaarVerschil += data[i].verschilAnnuiteit;
					} else {
						// Voor annuiteit: verschil is hoeveel minder je betaalt dan lineair (negatief van vergelijking)
						const currentTotal = data[i].aflossing + data[i].renteNetto;
						const vergelijkingTotal = data[i].vergelijkingTotal;
						jaarVerschil += vergelijkingTotal - currentTotal;
					}
				}
			}

			// Rendement en belasting/kredietkosten over het saldo aan het begin van het jaar
			const rendement =
				saldo > 0 ? saldo * rendementsPercentage : -Math.abs(saldo) * kredietPercentage;
			const belasting = saldo > 0 ? saldo * belastingPercentage : 0;

			// Update saldo: voeg verschil toe, voeg rendement toe, trek belasting af
			// (kredietkosten zijn al verwerkt in negatief rendement)
			saldo += jaarVerschil + rendement - belasting;

			yearlyData.push({
				year: jaar,
				verschil: jaarVerschil,
				rendement,
				belasting,
				saldo
			});
		}

		finalBalance = saldo;
		return { yearlyData, finalBalance };
	}

	$: savingsData = data ? getYearlyData() : { yearlyData: [], finalBalance: 0 };
	$: yearlyData = savingsData.yearlyData;
</script>

<div class="space-y-4">
	<h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200">
		{t.investmentAccountComparison}
	</h3>

	<div class="overflow-x-auto">
		<table
			class="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
		>
			<thead class="bg-gray-50 dark:bg-gray-700">
				<tr>
					<th
						class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
					>
						{t.year}
					</th>
					<th
						class="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
					>
						{t.difference}
					</th>
					<th
						class="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
					>
						{t.return}
					</th>
					<th
						class="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
					>
						{t.tax}
					</th>
					<th
						class="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
					>
						{t.balance}
					</th>
				</tr>
			</thead>
			<tbody class="divide-y divide-gray-200 dark:divide-gray-600">
				{#each yearlyData as yearData (yearData.year)}
					<tr class="hover:bg-gray-50 dark:hover:bg-gray-700">
						<td class="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
							{t.year}
							{yearData.year}
						</td>
						<td
							class="px-4 py-3 text-sm text-right"
							class:text-green-600={yearData.verschil > 0}
							class:dark:text-green-400={yearData.verschil > 0}
							class:text-red-600={yearData.verschil < 0}
							class:dark:text-red-400={yearData.verschil < 0}
						>
							{formatCurrency(yearData.verschil, locale, currency)}
						</td>
						<td class="px-4 py-3 text-sm text-right text-blue-600 dark:text-blue-400">
							{formatCurrency(yearData.rendement, locale, currency)}
						</td>
						<td class="px-4 py-3 text-sm text-right text-red-600 dark:text-red-400">
							{formatCurrency(yearData.belasting, locale, currency)}
						</td>
						<td class="px-4 py-3 text-sm text-right text-gray-900 dark:text-gray-100">
							{formatCurrency(yearData.saldo, locale, currency)}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
