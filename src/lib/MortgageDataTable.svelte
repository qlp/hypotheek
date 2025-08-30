<script lang="ts">
	import type { MonthlyData } from '$lib';
	import { formatEuro, formatPercentage } from '$lib';
	import type { Translations } from '$lib/i18n';

	export let data: MonthlyData[];
	export let t: Translations;
	export let locale: string;

	let expandedYears = new Set<number>();

	function getYearlyData() {
		const yearlyData: Map<
			number,
			{
				year: number;
				months: MonthlyData[];
				totals: {
					aflossing: number;
					renteNetto: number;
					hraVoordeel: number;
					aflossing_reel: number;
					renteNetto_reel: number;
					hraVoordeel_reel: number;
					avgCumulatieveInflatie: number;
				};
			}
		> = new Map();

		data.forEach((monthData) => {
			const year = Math.ceil(monthData.maand / 12);

			if (!yearlyData.has(year)) {
				yearlyData.set(year, {
					year,
					months: [],
					totals: {
						aflossing: 0,
						renteNetto: 0,
						hraVoordeel: 0,
						aflossing_reel: 0,
						renteNetto_reel: 0,
						hraVoordeel_reel: 0,
						avgCumulatieveInflatie: 0
					}
				});
			}

			const yearData = yearlyData.get(year)!;
			yearData.months.push(monthData);
			yearData.totals.aflossing += monthData.aflossing;
			yearData.totals.renteNetto += monthData.renteNetto;
			yearData.totals.hraVoordeel += monthData.hraVoordeel;
			yearData.totals.aflossing_reel += monthData.aflossing_reel;
			yearData.totals.renteNetto_reel += monthData.renteNetto_reel;
			yearData.totals.hraVoordeel_reel += monthData.hraVoordeel_reel;
		});

		// Calculate average cumulative inflation for each year
		return Array.from(yearlyData.values())
			.map((yearData) => {
				const avgInflation =
					yearData.months.reduce((sum, month) => sum + month.cumulatieveInflatie, 0) /
					yearData.months.length;
				yearData.totals.avgCumulatieveInflatie = avgInflation;
				return yearData;
			})
			.sort((a, b) => a.year - b.year);
	}

	function toggleYear(year: number) {
		if (expandedYears.has(year)) {
			expandedYears.delete(year);
		} else {
			expandedYears.add(year);
		}
		expandedYears = new Set(expandedYears);
	}

	function toggleAll() {
		const currentYearlyData = getYearlyData();
		const allCurrentlyExpanded =
			currentYearlyData.length > 0 && currentYearlyData.every((y) => expandedYears.has(y.year));

		if (allCurrentlyExpanded) {
			expandedYears.clear();
		} else {
			expandedYears = new Set(currentYearlyData.map((y) => y.year));
		}
		expandedYears = new Set(expandedYears);
	}

	function getMonthName(monthNumber: number): string {
		const monthInYear = ((monthNumber - 1) % 12) + 1;
		const months = [
			'Jan',
			'Feb',
			'Mrt',
			'Apr',
			'Mei',
			'Jun',
			'Jul',
			'Aug',
			'Sep',
			'Okt',
			'Nov',
			'Dec'
		];
		return months[monthInYear - 1];
	}

	$: yearlyData = data ? getYearlyData() : [];
</script>

<div class="space-y-4">
	<div class="flex justify-between items-center">
		<h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200">{t.yearlyOverview}</h3>
		<button
			onclick={toggleAll}
			class="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white text-sm rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
		>
			{yearlyData.length > 0 && yearlyData.every((y) => expandedYears.has(y.year))
				? t.collapseAll
				: t.expandAll}
		</button>
	</div>

	<div class="overflow-x-auto">
		<table
			class="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
		>
			<thead class="bg-gray-50 dark:bg-gray-700">
				<tr>
					<th
						rowspan="2"
						class="px-2 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap border-r border-gray-200 dark:border-gray-600 w-16"
					>
						{t.year}
					</th>
					<th
						colspan="3"
						class="px-4 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-200 dark:border-gray-600"
					>
						{t.nominal}
					</th>
					<th
						colspan="3"
						class="px-4 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-200 dark:border-gray-600"
					>
						{t.real}
					</th>
					<th
						rowspan="2"
						class="px-2 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-20"
					>
						{t.cumulativeInflation}
					</th>
				</tr>
				<tr>
					<th
						class="px-2 py-2 text-right text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider"
					>
						{t.repayment}
					</th>
					<th
						class="px-2 py-2 text-right text-xs font-medium text-red-600 dark:text-red-400 uppercase tracking-wider"
					>
						{t.netInterest}
					</th>
					<th
						class="px-2 py-2 text-right text-xs font-medium text-green-600 dark:text-green-400 uppercase tracking-wider border-r border-gray-200 dark:border-gray-600"
						title={t.hraTooltip}
					>
						{t.hraBenefit}
					</th>
					<th
						class="px-2 py-2 text-right text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider"
					>
						{t.repayment}
					</th>
					<th
						class="px-2 py-2 text-right text-xs font-medium text-red-600 dark:text-red-400 uppercase tracking-wider"
					>
						{t.netInterest}
					</th>
					<th
						class="px-2 py-2 text-right text-xs font-medium text-green-600 dark:text-green-400 uppercase tracking-wider border-r border-gray-200 dark:border-gray-600"
						title={t.hraTooltip}
					>
						{t.hraBenefit}
					</th>
				</tr>
			</thead>
			<tbody class="divide-y divide-gray-200 dark:divide-gray-600">
				{#each yearlyData as yearData (yearData.year)}
					<tr
						class="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
						onclick={() => toggleYear(yearData.year)}
					>
						<td
							class="px-2 py-3 text-sm font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap border-r border-gray-200 dark:border-gray-600"
						>
							<div class="flex items-center">
								<span class="mr-2 text-gray-400">
									{expandedYears.has(yearData.year) ? '▼' : '▶'}
								</span>
								{t.year}
								{yearData.year}
							</div>
						</td>
						<td class="px-4 py-3 text-sm text-right text-blue-600 dark:text-blue-400"
							>{formatEuro(yearData.totals.aflossing, locale)}</td
						>
						<td class="px-4 py-3 text-sm text-right text-red-600 dark:text-red-400"
							>{formatEuro(yearData.totals.renteNetto, locale)}</td
						>
						<td
							class="px-4 py-3 text-sm text-right text-green-600 dark:text-green-400 border-r border-gray-200 dark:border-gray-600"
							>{formatEuro(yearData.totals.hraVoordeel, locale)}</td
						>
						<td class="px-4 py-3 text-sm text-right text-blue-600 dark:text-blue-400"
							>{formatEuro(yearData.totals.aflossing_reel, locale)}</td
						>
						<td class="px-4 py-3 text-sm text-right text-red-600 dark:text-red-400"
							>{formatEuro(yearData.totals.renteNetto_reel, locale)}</td
						>
						<td
							class="px-4 py-3 text-sm text-right text-green-600 dark:text-green-400 border-r border-gray-200 dark:border-gray-600"
							>{formatEuro(yearData.totals.hraVoordeel_reel, locale)}</td
						>
						<td class="px-2 py-3 text-sm text-right text-gray-600 dark:text-gray-400"
							>{formatPercentage(yearData.totals.avgCumulatieveInflatie)}</td
						>
					</tr>
					{#if expandedYears.has(yearData.year)}
						{#each yearData.months as monthData (monthData.maand)}
							<tr class="bg-gray-25 dark:bg-gray-800/50">
								<td
									class="px-2 py-2 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap border-r border-gray-200 dark:border-gray-600"
								>
									{getMonthName(monthData.maand)} ({monthData.maand})
								</td>
								<td class="px-4 py-2 text-xs text-right text-blue-600 dark:text-blue-400"
									>{formatEuro(monthData.aflossing, locale)}</td
								>
								<td class="px-4 py-2 text-xs text-right text-red-600 dark:text-red-400"
									>{formatEuro(monthData.renteNetto, locale)}</td
								>
								<td
									class="px-4 py-2 text-xs text-right text-green-600 dark:text-green-400 border-r border-gray-200 dark:border-gray-600"
									>{formatEuro(monthData.hraVoordeel, locale)}</td
								>
								<td class="px-4 py-2 text-xs text-right text-blue-600 dark:text-blue-400"
									>{formatEuro(monthData.aflossing_reel, locale)}</td
								>
								<td class="px-4 py-2 text-xs text-right text-red-600 dark:text-red-400"
									>{formatEuro(monthData.renteNetto_reel, locale)}</td
								>
								<td
									class="px-4 py-2 text-xs text-right text-green-600 dark:text-green-400 border-r border-gray-200 dark:border-gray-600"
									>{formatEuro(monthData.hraVoordeel_reel, locale)}</td
								>
								<td class="px-2 py-2 text-xs text-right text-gray-600 dark:text-gray-400"
									>{formatPercentage(monthData.cumulatieveInflatie)}</td
								>
							</tr>
						{/each}
					{/if}
				{/each}
			</tbody>
		</table>
	</div>
</div>
