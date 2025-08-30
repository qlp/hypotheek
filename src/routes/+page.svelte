<script lang="ts">
	import { Effect } from 'effect';
	import { calculateMortgage, formatEuro, type MortgageInputs, type MortgageResult } from '$lib';
	import { onMount } from 'svelte';

	let inputs: MortgageInputs = {
		lening: 670000,
		rente: 4.32,
		looptijdJaren: 30,
		inflatie: 2,
		hraJaren: 10,
		belastingtarief: 36.93
	};

	let result: MortgageResult | null = null;
	let calculating = false;

	function calculate() {
		calculating = true;

		const program = Effect.gen(function* () {
			yield* Effect.sleep('50 millis');
			return yield* calculateMortgage(inputs);
		});

		Effect.runPromise(program).then((res) => {
			result = res;
			calculating = false;
		});
	}

	onMount(() => {
		calculate();
	});
</script>

<div class="max-w-4xl mx-auto p-6 space-y-6">
	<h1 class="text-3xl font-bold text-gray-900">Hypotheek Calculator</h1>

	<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
		<div class="space-y-4">
			<h2 class="text-xl font-semibold text-gray-800">Parameters</h2>

			<div class="space-y-3">
				<div>
					<label for="lening" class="block text-sm font-medium text-gray-700 mb-1"
						>Lening bedrag (€)</label
					>
					<input
						id="lening"
						bind:value={inputs.lening}
						type="number"
						class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						oninput={calculate}
					/>
				</div>

				<div>
					<label for="rente" class="block text-sm font-medium text-gray-700 mb-1">Rente (%)</label>
					<input
						id="rente"
						bind:value={inputs.rente}
						type="number"
						step="0.01"
						class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						oninput={calculate}
					/>
				</div>

				<div>
					<label for="looptijd" class="block text-sm font-medium text-gray-700 mb-1"
						>Looptijd (jaren)</label
					>
					<input
						id="looptijd"
						bind:value={inputs.looptijdJaren}
						type="number"
						class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						oninput={calculate}
					/>
				</div>

				<div>
					<label for="inflatie" class="block text-sm font-medium text-gray-700 mb-1"
						>Inflatie (%)</label
					>
					<input
						id="inflatie"
						bind:value={inputs.inflatie}
						type="number"
						step="0.01"
						class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						oninput={calculate}
					/>
				</div>

				<div>
					<label for="hra" class="block text-sm font-medium text-gray-700 mb-1">HRA jaren</label>
					<input
						id="hra"
						bind:value={inputs.hraJaren}
						type="number"
						class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						oninput={calculate}
					/>
				</div>

				<div>
					<label for="belasting" class="block text-sm font-medium text-gray-700 mb-1"
						>Belastingtarief (%)</label
					>
					<input
						id="belasting"
						bind:value={inputs.belastingtarief}
						type="number"
						step="0.01"
						class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						oninput={calculate}
					/>
				</div>
			</div>
		</div>

		<div class="space-y-4">
			<h2 class="text-xl font-semibold text-gray-800">Resultaat</h2>

			{#if calculating}
				<div class="text-blue-600">Berekenen...</div>
			{:else if result}
				<div class="overflow-x-auto">
					<table class="w-full bg-white border border-gray-200 rounded-lg">
						<thead class="bg-gray-50">
							<tr>
								<th
									class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
									>Metric</th
								>
								<th
									class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
									>Nominaal</th
								>
								<th
									class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
									>Reëel</th
								>
							</tr>
						</thead>
						<tbody class="divide-y divide-gray-200">
							<tr>
								<td class="px-4 py-3 text-sm font-medium text-gray-900">Maandlast</td>
								<td class="px-4 py-3 text-sm text-right">{formatEuro(result.annuiteit)}</td>
								<td class="px-4 py-3 text-sm text-right">{formatEuro(result.annuiteitReel)}</td>
							</tr>
							<tr>
								<td class="px-4 py-3 text-sm font-medium text-gray-900">Totaal betaald</td>
								<td class="px-4 py-3 text-sm text-right">{formatEuro(result.totaalNominaal)}</td>
								<td class="px-4 py-3 text-sm text-right">{formatEuro(result.totaalReel)}</td>
							</tr>
							<tr class="bg-red-50">
								<td class="px-4 py-3 text-sm font-medium text-gray-900">Extra kosten totaal</td>
								<td class="px-4 py-3 text-sm text-right text-red-600"
									>{formatEuro(result.verschilNominaal)}</td
								>
								<td class="px-4 py-3 text-sm text-right text-red-600"
									>{formatEuro(result.verschilReel)}</td
								>
							</tr>
							<tr class="bg-red-50">
								<td class="px-4 py-3 text-sm font-medium text-gray-900">Extra kosten per maand</td>
								<td class="px-4 py-3 text-sm text-right text-red-600"
									>{formatEuro(result.verschilNominaalPerMaand)}</td
								>
								<td class="px-4 py-3 text-sm text-right text-red-600"
									>{formatEuro(result.verschilReelPerMaand)}</td
								>
							</tr>
						</tbody>
					</table>
				</div>
			{/if}
		</div>
	</div>

	<div class="text-xs text-gray-500 mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
		<strong>DISCLAIMER:</strong> Dit is geen financieel advies. Deze berekening is uitsluitend bedoeld
		voor educatieve en informatieve doeleinden. De resultaten zijn hypothetisch en de nauwkeurigheid
		wordt niet gegarandeerd. Raadpleeg altijd een financieel adviseur of hypotheekspecialist voor persoonlijk
		advies. De maker neemt geen verantwoordelijkheid voor beslissingen gebaseerd op deze tool.
	</div>
</div>
