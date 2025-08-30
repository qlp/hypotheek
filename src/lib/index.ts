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
}

function normalizeRate(x: number): number {
	return x / 100.0;
}

export function formatEuro(bedrag: number, locale: string = 'nl-NL'): string {
	return new Intl.NumberFormat(locale, {
		style: 'currency',
		currency: 'EUR',
		minimumFractionDigits: 0,
		maximumFractionDigits: 0
	}).format(bedrag);
}

export function formatPercentage(percentage: number): string {
	return percentage.toFixed(1) + '%';
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

			const jaren = maand / 12.0;
			const discountFactor = Math.pow(1.0 + inflatie, jaren);
			const reelBetaling = nettoBetaling / discountFactor;

			// Reële componenten
			const aflossing_reel = aflossing / discountFactor;
			const renteNetto_reel = renteNetto / discountFactor;
			const hraVoordeel_reel = hraVoordeel / discountFactor;

			monthlyData.push({
				maand,
				aflossing,
				renteNetto,
				hraVoordeel,
				aflossing_reel,
				renteNetto_reel,
				hraVoordeel_reel,
				cumulatieveInflatie: (discountFactor - 1) * 100
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
			hypotheekType: inputs.hypotheekType
		};
	});
