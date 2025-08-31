<script lang="ts">
	import { onMount } from 'svelte';
	import { Chart, registerables } from 'chart.js';
	import type { MonthlyData } from '$lib';
	import type { Translations } from '$lib/i18n';

	export let data: MonthlyData[];
	export let t: Translations;
	export let locale: string;
	export let beleggingsRendement: number;
	export let vermogensheffing: number;
	export let hypotheekType: 'annuiteit' | 'lineair';
	export let kredietRente: number;
	export let currency: string = 'EUR';

	let canvas: HTMLCanvasElement;
	let chart: Chart;

	function calculateSavingsOverTime() {
		let saldo = 0;
		const rendementsPercentage = beleggingsRendement / 100;
		const belastingPercentage = vermogensheffing / 100;
		const kredietPercentage = kredietRente / 100;

		const balanceData: number[] = [];
		const labels: string[] = [];

		// Sample every 12 months for readability
		for (let jaar = 1; jaar <= Math.ceil(data.length / 12); jaar++) {
			const startMaand = (jaar - 1) * 12;
			const eindMaand = Math.min(jaar * 12, data.length);

			// Som het maandelijkse verschil voor dit jaar
			let jaarVerschil = 0;
			for (let i = startMaand; i < eindMaand; i++) {
				if (data[i]) {
					if (hypotheekType === 'lineair') {
						jaarVerschil += data[i].verschilAnnuiteit;
					} else {
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

			// Update saldo
			saldo += jaarVerschil + rendement - belasting;

			balanceData.push(saldo);
			labels.push(`${t.year} ${jaar}`);
		}

		return { balanceData, labels };
	}

	function updateChart() {
		if (!chart) return;

		const { balanceData, labels } = calculateSavingsOverTime();

		chart.data.labels = labels;
		chart.data.datasets[0].data = balanceData;

		// Update colors based on values
		const pointColors = balanceData.map((value) =>
			value >= 0 ? 'rgba(59, 130, 246, 1)' : 'rgba(239, 68, 68, 1)'
		);
		// @ts-expect-error - Chart.js types don't include point color properties
		chart.data.datasets[0].pointBackgroundColor = pointColors;
		// @ts-expect-error - Chart.js types don't include point border color properties
		chart.data.datasets[0].pointBorderColor = pointColors;

		chart.update();
	}

	onMount(() => {
		Chart.register(...registerables);

		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		const { balanceData, labels } = calculateSavingsOverTime();

		// Create segment colors based on positive/negative values
		const pointColors = balanceData.map((value) =>
			value >= 0 ? 'rgba(59, 130, 246, 1)' : 'rgba(239, 68, 68, 1)'
		);

		chart = new Chart(ctx, {
			type: 'line',
			data: {
				labels,
				datasets: [
					{
						label: t.investmentAccountBalance,
						data: balanceData,
						borderColor: (context) => {
							const value = context.parsed?.y;
							return value >= 0 ? 'rgba(59, 130, 246, 1)' : 'rgba(239, 68, 68, 1)';
						},
						backgroundColor: 'rgba(59, 130, 246, 0.1)',
						borderWidth: 3,
						fill: false,
						tension: 0.1,
						pointBackgroundColor: pointColors,
						pointBorderColor: pointColors,
						pointRadius: 4,
						segment: {
							borderColor: (ctx) => {
								return ctx.p0.parsed.y >= 0 && ctx.p1.parsed.y >= 0
									? 'rgba(59, 130, 246, 1)'
									: 'rgba(239, 68, 68, 1)';
							}
						}
					}
				]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				scales: {
					x: {
						grid: {
							display: false
						}
					},
					y: {
						beginAtZero: false,
						grid: {
							color: 'rgba(0, 0, 0, 0.1)'
						},
						ticks: {
							callback: function (value) {
								return new Intl.NumberFormat(locale, {
									style: 'currency',
									currency: currency,
									minimumFractionDigits: 0,
									maximumFractionDigits: 0
								}).format(Number(value));
							}
						}
					}
				},
				plugins: {
					title: {
						display: true,
						text: t.investmentAccountBalanceOverTime,
						font: {
							size: 16,
							weight: 'bold'
						}
					},
					legend: {
						display: false
					},
					tooltip: {
						callbacks: {
							label: function (context) {
								const value = Math.round(Number(context.parsed.y));
								const formattedValue = new Intl.NumberFormat(locale, {
									style: 'currency',
									currency: currency,
									minimumFractionDigits: 0,
									maximumFractionDigits: 0
								}).format(value);
								return `${t.balance}: ${formattedValue}`;
							}
						}
					}
				}
			}
		});

		return () => {
			chart?.destroy();
		};
	});

	$: if (data && chart && t) {
		updateChart();
	}
</script>

<div class="h-80">
	<canvas bind:this={canvas}></canvas>
</div>
