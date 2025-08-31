import { Effect } from 'effect';

export interface MortgageInputs {
	lening: number;
	rente: number;
	looptijdJaren: number;
	inflatie: number;
	hraJaren: number;
	belastingtarief: number;
	hraLinearAfbouw: boolean;
	hraEindPercentage: number;
	hypotheekType: 'annuiteit' | 'lineair';
	beleggingsRendement: number;
	vermogensheffing: number;
	kredietRente: number;
	currency: string;
}

export interface MonthlyData {
	maand: number;
	aflossing: number;
	renteNetto: number;
	hraVoordeel: number;
	aflossing_reel: number;
	renteNetto_reel: number;
	hraVoordeel_reel: number;
	cumulatieveInflatie: number;
	verschilAnnuiteit: number;
	vergelijkingTotal: number;
	vergelijkingTotal_reel: number;
}

export interface MortgageResult {
	annuiteit: number;
	annuiteitReel: number;
	totaalNominaal: number;
	totaalReel: number;
	verschilNominaal: number;
	verschilReel: number;
	verschilNominaalPerMaand: number;
	verschilReelPerMaand: number;
	monthlyData: MonthlyData[];
	hypotheekType: 'annuiteit' | 'lineair';
	savingsBalance: number;
	savingsBalanceReal: number;
	linearExtraCosts: number;
	linearExtraCostsReal: number;
	linearExtraCostsMonthly: number;
	linearExtraCostsRealMonthly: number;
}

function normalizeRate(x: number): number {
	return x / 100.0;
}

export function formatCurrency(
	bedrag: number,
	locale: string = 'nl-NL',
	currency: string = 'EUR'
): string {
	return new Intl.NumberFormat(locale, {
		style: 'currency',
		currency: currency,
		minimumFractionDigits: 0,
		maximumFractionDigits: 0
	}).format(bedrag);
}

export function formatEuro(bedrag: number, locale: string = 'nl-NL'): string {
	return formatCurrency(bedrag, locale, 'EUR');
}

export function formatPercentage(percentage: number): string {
	return percentage.toFixed(1) + '%';
}

function calculateSavingsBalance(
	inputs: MortgageInputs,
	monthlyData: MonthlyData[]
): {
	savingsBalance: number;
	savingsBalanceReal: number;
} {
	let saldo = 0;
	let saldoReal = 0;
	const rendementsPercentage = inputs.beleggingsRendement / 100;
	const belastingPercentage = inputs.vermogensheffing / 100;
	const kredietPercentage = inputs.kredietRente / 100;
	const inflatie = normalizeRate(inputs.inflatie);

	for (let jaar = 1; jaar <= Math.ceil(monthlyData.length / 12); jaar++) {
		const startMaand = (jaar - 1) * 12;
		const eindMaand = Math.min(jaar * 12, monthlyData.length);

		// Som het maandelijkse verschil voor dit jaar
		let jaarVerschil = 0;
		let jaarVerschilReal = 0;
		for (let i = startMaand; i < eindMaand; i++) {
			if (monthlyData[i]) {
				if (inputs.hypotheekType === 'lineair') {
					jaarVerschil += monthlyData[i].verschilAnnuiteit;
				} else {
					const currentTotal = monthlyData[i].aflossing + monthlyData[i].renteNetto;
					const vergelijkingTotal = monthlyData[i].vergelijkingTotal;
					jaarVerschil += vergelijkingTotal - currentTotal;
				}

				// Real version
				const currentTotalReal = monthlyData[i].aflossing_reel + monthlyData[i].renteNetto_reel;
				const vergelijkingTotalReal = monthlyData[i].vergelijkingTotal_reel;
				if (inputs.hypotheekType === 'lineair') {
					jaarVerschilReal += monthlyData[i].verschilAnnuiteit / Math.pow(1 + inflatie, jaar);
				} else {
					jaarVerschilReal += vergelijkingTotalReal - currentTotalReal;
				}
			}
		}

		// Rendement en belasting/kredietkosten over het saldo aan het begin van het jaar
		const rendement = saldo > 0 ? saldo * rendementsPercentage : 0;
		const belasting = saldo > 0 ? saldo * belastingPercentage : 0;
		const kredietKosten = saldo < 0 ? Math.abs(saldo) * kredietPercentage : 0;

		const rendementReal = saldoReal > 0 ? saldoReal * rendementsPercentage : 0;
		const belastingReal = saldoReal > 0 ? saldoReal * belastingPercentage : 0;
		const kredietKostenReal = saldoReal < 0 ? Math.abs(saldoReal) * kredietPercentage : 0;

		// Update saldo
		saldo += jaarVerschil + rendement - belasting - kredietKosten;
		saldoReal += jaarVerschilReal + rendementReal - belastingReal - kredietKostenReal;
	}

	// Het eindssaldo is aan het eind van de looptijd, dus terugrekenen naar reële waarde
	const totalYears = monthlyData.length / 12;
	const inflationFactor = Math.pow(1 + inflatie, totalYears);
	const saldoRealFinal = saldo / inflationFactor;

	return {
		savingsBalance: saldo,
		savingsBalanceReal: saldoRealFinal
	};
}

function calculateLinearComparison(inputs: MortgageInputs): {
	extraCosts: number;
	extraCostsReal: number;
	extraCostsMonthly: number;
	extraCostsRealMonthly: number;
} {
	if (inputs.hypotheekType === 'lineair') {
		// Already linear, no comparison needed
		return {
			extraCosts: 0,
			extraCostsReal: 0,
			extraCostsMonthly: 0,
			extraCostsRealMonthly: 0
		};
	}

	// Calculate what linear would cost if we had that instead
	const linearInputs = { ...inputs, hypotheekType: 'lineair' as const };

	// We need to calculate linear directly here to avoid recursion
	const rente = normalizeRate(linearInputs.rente);
	const inflatie = normalizeRate(linearInputs.inflatie);
	const belastingtarief = normalizeRate(linearInputs.belastingtarief);
	const nMaanden = linearInputs.looptijdJaren * 12;
	const renteM = rente / 12.0;
	const lineaireAflossing = linearInputs.lening / nMaanden;

	let schuld = linearInputs.lening;
	let totaalNominaal = 0.0;
	let totaalReel = 0.0;

	for (let maand = 1; maand <= nMaanden; maand++) {
		const renteBetaling = schuld * renteM;
		const aflossing = lineaireAflossing;
		const maandlast = aflossing + renteBetaling;

		let nettoBetaling = maandlast;
		let hraVoordeel = 0;

		if (linearInputs.hraLinearAfbouw) {
			const afbouwMaanden = linearInputs.hraJaren * 12;
			if (maand <= afbouwMaanden) {
				const startTarief = belastingtarief;
				const eindTarief = normalizeRate(linearInputs.hraEindPercentage);
				const progress = (maand - 1) / (afbouwMaanden - 1);
				const huidigTarief = startTarief - (startTarief - eindTarief) * progress;
				hraVoordeel = renteBetaling * huidigTarief;
				nettoBetaling -= hraVoordeel;
			}
		} else {
			if (maand <= linearInputs.hraJaren * 12) {
				hraVoordeel = renteBetaling * belastingtarief;
				nettoBetaling -= hraVoordeel;
			}
		}

		const jaren = maand / 12.0;
		const discountFactor = Math.pow(1.0 + inflatie, jaren);
		const reelBetaling = nettoBetaling / discountFactor;

		totaalNominaal += nettoBetaling;
		totaalReel += reelBetaling;
		schuld -= aflossing;
	}

	const verschilNominaal = totaalNominaal - linearInputs.lening;
	const verschilReel = totaalReel - linearInputs.lening;

	return {
		extraCosts: verschilNominaal,
		extraCostsReal: verschilReel,
		extraCostsMonthly: verschilNominaal / nMaanden,
		extraCostsRealMonthly: verschilReel / nMaanden
	};
}

export const calculateMortgage = (
	inputs: MortgageInputs
): Effect.Effect<MortgageResult, never, never> =>
	Effect.sync(() => {
		const rente = normalizeRate(inputs.rente);
		const inflatie = normalizeRate(inputs.inflatie);
		const belastingtarief = normalizeRate(inputs.belastingtarief);

		const nMaanden = inputs.looptijdJaren * 12;
		const renteM = rente / 12.0;

		// For annuity: fixed monthly payment, for linear: fixed monthly principal repayment
		const annuiteit =
			inputs.hypotheekType === 'annuiteit'
				? (inputs.lening * renteM) / (1.0 - Math.pow(1.0 + renteM, -nMaanden))
				: 0;
		const lineaireAflossing = inputs.hypotheekType === 'lineair' ? inputs.lening / nMaanden : 0;

		let schuld = inputs.lening;
		let totaalNominaal = 0.0;
		let totaalReel = 0.0;
		const monthlyData: MonthlyData[] = [];

		// Voor vergelijking: bereken altijd annuïteit scenario
		const annuiteitVergelijking =
			(inputs.lening * renteM) / (1.0 - Math.pow(1.0 + renteM, -nMaanden));
		let schuldAnnuiteit = inputs.lening;

		for (let maand = 1; maand <= nMaanden; maand++) {
			const renteBetaling = schuld * renteM;
			const aflossing =
				inputs.hypotheekType === 'annuiteit' ? annuiteit - renteBetaling : lineaireAflossing;
			const maandlast =
				inputs.hypotheekType === 'annuiteit' ? annuiteit : aflossing + renteBetaling;

			let nettoBetaling = maandlast;
			let hraVoordeel = 0;

			if (inputs.hraLinearAfbouw) {
				// Linear afbouw van HRA - gebruik bestaande velden
				const afbouwMaanden = inputs.hraJaren * 12;
				if (maand <= afbouwMaanden) {
					const startTarief = belastingtarief;
					const eindTarief = normalizeRate(inputs.hraEindPercentage);
					const progress = (maand - 1) / (afbouwMaanden - 1);
					const huidigTarief = startTarief - (startTarief - eindTarief) * progress;
					hraVoordeel = renteBetaling * huidigTarief;
					nettoBetaling -= hraVoordeel;
				}
			} else {
				// Traditionele HRA
				if (maand <= inputs.hraJaren * 12) {
					hraVoordeel = renteBetaling * belastingtarief;
					nettoBetaling -= hraVoordeel;
				}
			}

			const renteNetto = renteBetaling - hraVoordeel;

			// Bereken vergelijking met het andere hypotheektype
			let verschilAnnuiteit = 0;
			let vergelijkingTotal = 0;

			if (inputs.hypotheekType === 'lineair') {
				// Bereken annuïteit scenario
				const renteBetalingAnnuiteit = schuldAnnuiteit * renteM;
				const aflossignAnnuiteit = annuiteitVergelijking - renteBetalingAnnuiteit;

				let hraVoordeelAnnuiteit = 0;
				if (inputs.hraLinearAfbouw) {
					const afbouwMaanden = inputs.hraJaren * 12;
					if (maand <= afbouwMaanden) {
						const startTarief = belastingtarief;
						const eindTarief = normalizeRate(inputs.hraEindPercentage);
						const progress = (maand - 1) / (afbouwMaanden - 1);
						const huidigTarief = startTarief - (startTarief - eindTarief) * progress;
						hraVoordeelAnnuiteit = renteBetalingAnnuiteit * huidigTarief;
					}
				} else {
					if (maand <= inputs.hraJaren * 12) {
						hraVoordeelAnnuiteit = renteBetalingAnnuiteit * belastingtarief;
					}
				}

				const renteNettoAnnuiteit = renteBetalingAnnuiteit - hraVoordeelAnnuiteit;
				const totalAnnuiteit = aflossignAnnuiteit + renteNettoAnnuiteit;
				const totalLineair = aflossing + renteNetto;

				verschilAnnuiteit = totalLineair - totalAnnuiteit;
				vergelijkingTotal = totalAnnuiteit; // Toon annuiteit totaal
				schuldAnnuiteit -= aflossignAnnuiteit;
			} else {
				// Voor annuïteit: bereken lineair scenario
				const lineaireAflossignVergelijking = inputs.lening / nMaanden;
				const schuldLineair = inputs.lening - lineaireAflossignVergelijking * (maand - 1);
				const renteBetalingLineair = schuldLineair * renteM;

				let hraVoordeelLineair = 0;
				if (inputs.hraLinearAfbouw) {
					const afbouwMaanden = inputs.hraJaren * 12;
					if (maand <= afbouwMaanden) {
						const startTarief = belastingtarief;
						const eindTarief = normalizeRate(inputs.hraEindPercentage);
						const progress = (maand - 1) / (afbouwMaanden - 1);
						const huidigTarief = startTarief - (startTarief - eindTarief) * progress;
						hraVoordeelLineair = renteBetalingLineair * huidigTarief;
					}
				} else {
					if (maand <= inputs.hraJaren * 12) {
						hraVoordeelLineair = renteBetalingLineair * belastingtarief;
					}
				}

				const renteNettoLineair = renteBetalingLineair - hraVoordeelLineair;
				vergelijkingTotal = lineaireAflossignVergelijking + renteNettoLineair; // Toon lineair totaal
			}

			const jaren = maand / 12.0;
			const discountFactor = Math.pow(1.0 + inflatie, jaren);
			const reelBetaling = nettoBetaling / discountFactor;

			// Reële componenten
			const aflossing_reel = aflossing / discountFactor;
			const renteNetto_reel = renteNetto / discountFactor;
			const hraVoordeel_reel = hraVoordeel / discountFactor;
			const vergelijkingTotal_reel = vergelijkingTotal / discountFactor;

			monthlyData.push({
				maand,
				aflossing,
				renteNetto,
				hraVoordeel,
				aflossing_reel,
				renteNetto_reel,
				hraVoordeel_reel,
				cumulatieveInflatie: (discountFactor - 1) * 100,
				verschilAnnuiteit,
				vergelijkingTotal,
				vergelijkingTotal_reel
			});

			totaalNominaal += nettoBetaling;
			totaalReel += reelBetaling;

			schuld -= aflossing;
		}

		const verschilNominaal = totaalNominaal - inputs.lening;
		const verschilReel = totaalReel - inputs.lening;

		// Bereken gemiddelde reële maandlast (in euro's van vandaag)
		const annuiteitReel = totaalReel / nMaanden;

		// Bereken extra kosten per maand
		const verschilNominaalPerMaand = verschilNominaal / nMaanden;
		const verschilReelPerMaand = verschilReel / nMaanden;

		// Bereken spaarrekening saldo simulatie
		const { savingsBalance, savingsBalanceReal } = calculateSavingsBalance(inputs, monthlyData);

		// Bereken lineair hypotheek kosten voor vergelijking
		const linearComparison = calculateLinearComparison(inputs);

		return {
			annuiteit:
				inputs.hypotheekType === 'annuiteit'
					? annuiteit
					: monthlyData[0]?.aflossing + monthlyData[0]?.renteNetto + monthlyData[0]?.hraVoordeel ||
						0,
			annuiteitReel,
			totaalNominaal,
			totaalReel,
			verschilNominaal,
			verschilReel,
			verschilNominaalPerMaand,
			verschilReelPerMaand,
			monthlyData,
			hypotheekType: inputs.hypotheekType,
			savingsBalance,
			savingsBalanceReal,
			linearExtraCosts: linearComparison.extraCosts,
			linearExtraCostsReal: linearComparison.extraCostsReal,
			linearExtraCostsMonthly: linearComparison.extraCostsMonthly,
			linearExtraCostsRealMonthly: linearComparison.extraCostsRealMonthly
		};
	});
