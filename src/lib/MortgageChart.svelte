<script lang="ts">
	import { onMount } from 'svelte';
	import { Chart, registerables } from 'chart.js';
	import type { MonthlyData } from '$lib';

	export let data: MonthlyData[];
	export let title: string;
	export let isReal: boolean = false;

	let canvas: HTMLCanvasElement;
	let chart: Chart;

	function updateChart() {
		if (!chart) return;

		// Sample every 12 months for readability
		const sampledData = data.filter((_, index) => index % 12 === 0);
		const labels = sampledData.map((d) => `Jaar ${Math.ceil(d.maand / 12)}`);

		const aflossing = sampledData.map((d) => (isReal ? d.aflossing_reel : d.aflossing));
		const renteNetto = sampledData.map((d) => (isReal ? d.renteNetto_reel : d.renteNetto));
		const hraVoordeel = sampledData.map((d) => (isReal ? d.hraVoordeel_reel : d.hraVoordeel));

		chart.data.labels = labels;
		chart.data.datasets[0].data = aflossing;
		chart.data.datasets[1].data = renteNetto;
		chart.data.datasets[2].data = hraVoordeel;

		// Update colors for Safari compatibility
		chart.data.datasets[0].backgroundColor = 'rgba(59, 130, 246, 0.8)';
		chart.data.datasets[0].borderColor = 'rgba(59, 130, 246, 1)';
		chart.data.datasets[1].backgroundColor = 'rgba(239, 68, 68, 0.8)';
		chart.data.datasets[1].borderColor = 'rgba(239, 68, 68, 1)';
		chart.data.datasets[2].backgroundColor = 'rgba(34, 197, 94, 0.5)';
		chart.data.datasets[2].borderColor = 'rgba(34, 197, 94, 0.8)';
		chart.update();
	}

	onMount(() => {
		Chart.register(...registerables);

		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		// Sample every 12 months for readability
		const sampledData = data.filter((_, index) => index % 12 === 0);
		const labels = sampledData.map((d) => `Jaar ${Math.ceil(d.maand / 12)}`);

		const aflossing = sampledData.map((d) => (isReal ? d.aflossing_reel : d.aflossing));
		const renteNetto = sampledData.map((d) => (isReal ? d.renteNetto_reel : d.renteNetto));
		const hraVoordeel = sampledData.map((d) => (isReal ? d.hraVoordeel_reel : d.hraVoordeel));

		chart = new Chart(ctx, {
			type: 'bar',
			data: {
				labels,
				datasets: [
					{
						label: 'Aflossing',
						data: aflossing,
						backgroundColor: 'rgba(59, 130, 246, 0.8)',
						borderColor: 'rgba(59, 130, 246, 1)',
						borderWidth: 1
					},
					{
						label: 'Rente (netto)',
						data: renteNetto,
						backgroundColor: 'rgba(239, 68, 68, 0.8)',
						borderColor: 'rgba(239, 68, 68, 1)',
						borderWidth: 1
					},
					{
						label: 'HRA voordeel',
						data: hraVoordeel,
						backgroundColor: 'rgba(34, 197, 94, 0.5)',
						borderColor: 'rgba(34, 197, 94, 0.8)',
						borderWidth: 1
					}
				]
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
								return '€' + Math.round(Number(value)).toLocaleString('nl-NL');
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
						position: 'bottom'
					},
					tooltip: {
						callbacks: {
							label: function (context) {
								const label = context.dataset.label || '';
								const value = Math.round(Number(context.parsed.y));
								return `${label}: €${value.toLocaleString('nl-NL')}`;
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

	$: if (data && chart) {
		updateChart();
	}
</script>

<div class="h-80">
	<canvas bind:this={canvas}></canvas>
</div>
