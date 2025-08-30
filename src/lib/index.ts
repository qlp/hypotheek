import { Effect } from 'effect';

export interface MortgageInputs {
	lening: number;
	rente: number;
	looptijdJaren: number;
	inflatie: number;
	hraJaren: number;
	belastingtarief: number;
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
}

function normalizeRate(x: number): number {
	return x > 1.0 ? x / 100.0 : x;
}

function formatEuro(bedrag: number): string {
	const afgerond = Math.round(bedrag);
	const s = Math.abs(afgerond).toString();

	let withSep = '';
	for (let i = 0; i < s.length; i++) {
		if (i > 0 && (s.length - i) % 3 === 0) {
			withSep += '.';
		}
		withSep += s[i];
	}

	const sign = bedrag < 0 ? '-' : '';
	return `${sign}€${withSep}`;
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

		const annuiteit = (inputs.lening * renteM) / (1.0 - Math.pow(1.0 + renteM, -nMaanden));

		let schuld = inputs.lening;
		let totaalNominaal = 0.0;
		let totaalReel = 0.0;

		for (let maand = 1; maand <= nMaanden; maand++) {
			const renteBetaling = schuld * renteM;
			const aflossing = annuiteit - renteBetaling;

			let nettoBetaling = annuiteit;
			if (maand <= inputs.hraJaren * 12) {
				const belastingVoordeel = renteBetaling * belastingtarief;
				nettoBetaling -= belastingVoordeel;
			}

			const jaren = maand / 12.0;
			const discountFactor = Math.pow(1.0 + inflatie, jaren);
			const reelBetaling = nettoBetaling / discountFactor;

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
			annuiteit,
			annuiteitReel,
			totaalNominaal,
			totaalReel,
			verschilNominaal,
			verschilReel,
			verschilNominaalPerMaand,
			verschilReelPerMaand
		};
	});

export { formatEuro };
