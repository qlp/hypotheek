<script lang="ts">
	import type { MonthlyData } from '$lib';
	import { formatEuro } from '$lib';
	import type { Translations } from '$lib/i18n';

	export let data: MonthlyData[];
	export let t: Translations;
	export let locale: string;
	export let beleggingsRendement: number;
	export let vermogensheffing: number;
	export let hypotheekType: 'annuiteit' | 'lineair';

	function getYearlyData() {
		const yearlyData: Array<{
			year: number;
			verschil: number;
			rendement: number;
			belasting: number;
			saldo: number;
		}> = [];

		let saldo = 0;
		const rendementsPercentage = beleggingsRendement / 100;
		const belastingPercentage = vermogensheffing / 100;

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
						jaarVerschil += (vergelijkingTotal - currentTotal);
					}
				}
			}
			
			// Rendement en belasting over het saldo aan het begin van het jaar (alleen op positief saldo)
			const rendement = Math.max(0, saldo) * rendementsPercentage;
			const belasting = Math.max(0, saldo) * belastingPercentage;
			
			// Update saldo: voeg verschil toe, voeg rendement toe en trek belasting af
			saldo += jaarVerschil + rendement - belasting;
			
			yearlyData.push({
				year: jaar,
				verschil: jaarVerschil,
				rendement,
				belasting,
				saldo
			});
		}

		return yearlyData;
	}

	$: yearlyData = data ? getYearlyData() : [];
</script>

<div class="space-y-4">
	<h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200">
		Spaarrekening vergelijking
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
						Verschil
					</th>
					<th
						class="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
					>
						Rendement
					</th>
					<th
						class="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
					>
						Belasting
					</th>
					<th
						class="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
					>
						Saldo
					</th>
				</tr>
			</thead>
			<tbody class="divide-y divide-gray-200 dark:divide-gray-600">
				{#each yearlyData as yearData}
					<tr class="hover:bg-gray-50 dark:hover:bg-gray-700">
						<td
							class="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100"
						>
							{t.year} {yearData.year}
						</td>
						<td
							class="px-4 py-3 text-sm text-right"
							class:text-green-600={yearData.verschil > 0}
							class:dark:text-green-400={yearData.verschil > 0}
							class:text-red-600={yearData.verschil < 0}
							class:dark:text-red-400={yearData.verschil < 0}
						>
							{formatEuro(yearData.verschil, locale)}
						</td>
						<td class="px-4 py-3 text-sm text-right text-blue-600 dark:text-blue-400">
							{formatEuro(yearData.rendement, locale)}
						</td>
						<td class="px-4 py-3 text-sm text-right text-red-600 dark:text-red-400">
							{formatEuro(yearData.belasting, locale)}
						</td>
						<td class="px-4 py-3 text-sm text-right text-gray-900 dark:text-gray-100">
							{formatEuro(yearData.saldo, locale)}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>