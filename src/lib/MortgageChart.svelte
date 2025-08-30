<script lang="ts">
	import { onMount } from 'svelte';
	import { Chart, registerables } from 'chart.js';
	import type { MonthlyData } from '$lib';
	import type { Translations } from '$lib/i18n';

	export let data: MonthlyData[];
	export let title: string;
	export let isReal: boolean = false;
	export let showBoth: boolean = false;
	export let showLegend: boolean = true;
	export let t: Translations;
	export let locale: string;

	let canvas: HTMLCanvasElement;
	let chart: Chart;

	function updateChart() {
		if (!chart) return;

		// Sample every 12 months for readability
		const sampledData = data.filter((_, index) => index % 12 === 0);
		const labels = sampledData.map((d) => `${t.year} ${Math.ceil(d.maand / 12)}`);

		if (showBoth) {
			// Show both nominal and real data
			const aflossing = sampledData.map((d) => d.aflossing);
			const renteNetto = sampledData.map((d) => d.renteNetto);
			const hraVoordeel = sampledData.map((d) => d.hraVoordeel);
			const aflossing_reel = sampledData.map((d) => d.aflossing_reel);
			const renteNetto_reel = sampledData.map((d) => d.renteNetto_reel);
			const hraVoordeel_reel = sampledData.map((d) => d.hraVoordeel_reel);

			chart.data.labels = labels;
			chart.data.datasets[0].data = aflossing;
			chart.data.datasets[1].data = renteNetto;
			chart.data.datasets[2].data = hraVoordeel;
			chart.data.datasets[3].data = aflossing_reel;
			chart.data.datasets[4].data = renteNetto_reel;
			chart.data.datasets[5].data = hraVoordeel_reel;

			// Update labels
			chart.data.datasets[0].label = `${t.repayment} (${t.nominal})`;
			chart.data.datasets[1].label = `${t.netInterest} (${t.nominal})`;
			chart.data.datasets[2].label = `${t.hraBenefit} (${t.nominal})`;
			chart.data.datasets[3].label = `${t.repayment} (${t.real})`;
			chart.data.datasets[4].label = `${t.netInterest} (${t.real})`;
			chart.data.datasets[5].label = `${t.hraBenefit} (${t.real})`;
		} else {
			// Show single dataset (original behavior)
			const aflossing = sampledData.map((d) => (isReal ? d.aflossing_reel : d.aflossing));
			const renteNetto = sampledData.map((d) => (isReal ? d.renteNetto_reel : d.renteNetto));
			const hraVoordeel = sampledData.map((d) => (isReal ? d.hraVoordeel_reel : d.hraVoordeel));

			chart.data.labels = labels;
			chart.data.datasets[0].data = aflossing;
			chart.data.datasets[1].data = renteNetto;
			chart.data.datasets[2].data = hraVoordeel;

			// Update labels for language changes
			chart.data.datasets[0].label = t.repayment;
			chart.data.datasets[1].label = t.netInterest;
			chart.data.datasets[2].label = t.hraBenefit;
		}

		// Update title
		if (chart.options.plugins?.title) {
			chart.options.plugins.title.text = title;
		}

		// Update colors for Safari compatibility
		chart.data.datasets[0].backgroundColor = 'rgba(59, 130, 246, 0.8)';
		chart.data.datasets[0].borderColor = 'rgba(59, 130, 246, 1)';
		chart.data.datasets[1].backgroundColor = 'rgba(239, 68, 68, 0.8)';
		chart.data.datasets[1].borderColor = 'rgba(239, 68, 68, 1)';
		chart.data.datasets[2].backgroundColor = 'rgba(34, 197, 94, 0.5)';
		chart.data.datasets[2].borderColor = 'rgba(34, 197, 94, 0.8)';

		if (showBoth) {
			// Real data with lighter/dashed variants
			chart.data.datasets[3].backgroundColor = 'rgba(59, 130, 246, 0.4)';
			chart.data.datasets[3].borderColor = 'rgba(59, 130, 246, 0.7)';
			chart.data.datasets[4].backgroundColor = 'rgba(239, 68, 68, 0.4)';
			chart.data.datasets[4].borderColor = 'rgba(239, 68, 68, 0.7)';
			chart.data.datasets[5].backgroundColor = 'rgba(34, 197, 94, 0.3)';
			chart.data.datasets[5].borderColor = 'rgba(34, 197, 94, 0.5)';
		}

		chart.update();
	}

	onMount(() => {
		Chart.register(...registerables);

		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		// Sample every 12 months for readability
		const sampledData = data.filter((_, index) => index % 12 === 0);
		const labels = sampledData.map((d) => `${t.year} ${Math.ceil(d.maand / 12)}`);

		let datasets;
		if (showBoth) {
			// Show both nominal and real data
			const aflossing = sampledData.map((d) => d.aflossing);
			const renteNetto = sampledData.map((d) => d.renteNetto);
			const hraVoordeel = sampledData.map((d) => d.hraVoordeel);
			const aflossing_reel = sampledData.map((d) => d.aflossing_reel);
			const renteNetto_reel = sampledData.map((d) => d.renteNetto_reel);
			const hraVoordeel_reel = sampledData.map((d) => d.hraVoordeel_reel);

			datasets = [
				{
					label: `${t.repayment} (${t.nominal})`,
					data: aflossing,
					backgroundColor: 'rgba(59, 130, 246, 0.8)',
					borderColor: 'rgba(59, 130, 246, 1)',
					borderWidth: 1
				},
				{
					label: `${t.netInterest} (${t.nominal})`,
					data: renteNetto,
					backgroundColor: 'rgba(239, 68, 68, 0.8)',
					borderColor: 'rgba(239, 68, 68, 1)',
					borderWidth: 1
				},
				{
					label: `${t.hraBenefit} (${t.nominal})`,
					data: hraVoordeel,
					backgroundColor: 'rgba(34, 197, 94, 0.5)',
					borderColor: 'rgba(34, 197, 94, 0.8)',
					borderWidth: 1
				},
				{
					label: `${t.repayment} (${t.real})`,
					data: aflossing_reel,
					backgroundColor: 'rgba(59, 130, 246, 0.4)',
					borderColor: 'rgba(59, 130, 246, 0.7)',
					borderWidth: 1
				},
				{
					label: `${t.netInterest} (${t.real})`,
					data: renteNetto_reel,
					backgroundColor: 'rgba(239, 68, 68, 0.4)',
					borderColor: 'rgba(239, 68, 68, 0.7)',
					borderWidth: 1
				},
				{
					label: `${t.hraBenefit} (${t.real})`,
					data: hraVoordeel_reel,
					backgroundColor: 'rgba(34, 197, 94, 0.3)',
					borderColor: 'rgba(34, 197, 94, 0.5)',
					borderWidth: 1
				}
			];
		} else {
			// Single dataset (original behavior)
			const aflossing = sampledData.map((d) => (isReal ? d.aflossing_reel : d.aflossing));
			const renteNetto = sampledData.map((d) => (isReal ? d.renteNetto_reel : d.renteNetto));
			const hraVoordeel = sampledData.map((d) => (isReal ? d.hraVoordeel_reel : d.hraVoordeel));

			datasets = [
				{
					label: t.repayment,
					data: aflossing,
					backgroundColor: 'rgba(59, 130, 246, 0.8)',
					borderColor: 'rgba(59, 130, 246, 1)',
					borderWidth: 1
				},
				{
					label: t.netInterest,
					data: renteNetto,
					backgroundColor: 'rgba(239, 68, 68, 0.8)',
					borderColor: 'rgba(239, 68, 68, 1)',
					borderWidth: 1
				},
				{
					label: t.hraBenefit,
					data: hraVoordeel,
					backgroundColor: 'rgba(34, 197, 94, 0.5)',
					borderColor: 'rgba(34, 197, 94, 0.8)',
					borderWidth: 1
				}
			];
		}

		chart = new Chart(ctx, {
			type: 'bar',
			data: {
				labels,
				datasets
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				scales: {
					x: {
						stacked: true,
						grid: {
							display: false
						}
					},
					y: {
						stacked: true,
						beginAtZero: true,
						ticks: {
							callback: function (value) {
								return new Intl.NumberFormat(locale, {
									style: 'currency',
									currency: 'EUR',
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
						text: title,
						font: {
							size: 16,
							weight: 'bold'
						}
					},
					legend: {
						display: showLegend,
						position: 'bottom'
					},
					tooltip: {
						callbacks: {
							label: function (context) {
								const label = context.dataset.label || '';
								const value = Math.round(Number(context.parsed.y));
								const formattedValue = new Intl.NumberFormat(locale, {
									style: 'currency',
									currency: 'EUR',
									minimumFractionDigits: 0,
									maximumFractionDigits: 0
								}).format(value);
								return `${label}: ${formattedValue}`;
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
