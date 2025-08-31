export interface Translations {
	title: string;
	parameters: string;
	results: string;
	loanAmount: string;
	interestRate: string;
	duration: string;
	inflation: string;
	hraYears: string;
	taxRate: string;
	hraLinearReduction: string;
	hraEndPercentage: string;
	calculating: string;
	metric: string;
	nominal: string;
	real: string;
	monthlyPayment: string;
	totalPaid: string;
	extraCostsTotal: string;
	extraCostsMonthly: string;
	monthlyCostsOverTime: string;
	nominalAmounts: string;
	realAmounts: string;
	yearlyOverview: string;
	expandAll: string;
	collapseAll: string;
	year: string;
	repayment: string;
	netInterest: string;
	hraBenefit: string;
	cumulativeInflation: string;
	disclaimer: string;
	hraYearsLabel: string;
	hraReductionPeriodLabel: string;
	taxRateLabel: string;
	hraStartPercentageLabel: string;
	month: string;
	hraTooltip: string;
	mortgageType: string;
	annuity: string;
	linear: string;
	firstMonthlyPayment: string;
	investmentAccount: string;
	investmentAccountComparison: string;
	investmentAccountBalance: string;
	investmentAccountBalanceOverTime: string;
	investmentReturn: string;
	wealthTax: string;
	creditInterest: string;
	difference: string;
	return: string;
	tax: string;
	balance: string;
	comparisonWithLinear: string;
	investmentAccountSimulation: string;
	netDifference: string;
	netDifferenceTotal: string;
	netDifferenceMonthly: string;
	netDifferenceAnnuity: string;
	netDifferenceLinear: string;
	finalNetDifference: string;
	currency: string;
	comparison: string;
	differenceCostComparison: string;
	differenceMonthlyComparison: string;
}

export const dutch: Translations = {
	title: 'Hypotheek Calculator',
	parameters: 'Parameters',
	results: 'Resultaat',
	loanAmount: 'Lening bedrag (€)',
	interestRate: 'Rente (%)',
	duration: 'Looptijd (jaren)',
	inflation: 'Inflatie (%)',
	hraYears: 'HRA jaren',
	taxRate: 'Belastingtarief (%)',
	hraLinearReduction: 'HRA lineair afbouwen',
	hraEndPercentage: 'HRA eind percentage (%)',
	calculating: 'Berekenen...',
	metric: 'Metric',
	nominal: 'Nominaal',
	real: 'Reëel',
	monthlyPayment: 'Maandlast',
	totalPaid: 'Totaal betaald',
	extraCostsTotal: 'Extra kosten totaal',
	extraCostsMonthly: 'Extra kosten per maand',
	monthlyCostsOverTime: 'Maandelijkse kosten over tijd',
	nominalAmounts: 'Nominale bedragen',
	realAmounts: 'Reële bedragen (inflatie-gecorrigeerd)',
	yearlyOverview: 'Jaarlijkse overzicht',
	expandAll: 'Alles uitklappen',
	collapseAll: 'Alles inklappen',
	year: 'Jaar',
	repayment: 'Aflossing',
	netInterest: 'Rente netto',
	hraBenefit: 'HRA voordeel',
	cumulativeInflation: 'Cumulatieve inflatie',
	disclaimer:
		'DISCLAIMER: Dit is geen financieel advies. Deze berekening is uitsluitend bedoeld voor educatieve en informatieve doeleinden. De resultaten zijn hypothetisch en de nauwkeurigheid wordt niet gegarandeerd. Raadpleeg altijd een financieel adviseur of hypotheekspecialist voor persoonlijk advies. De maker neemt geen verantwoordelijkheid voor beslissingen gebaseerd op deze tool. Deze calculator is 100% vibe coded - een klein meesterwerk!',
	hraYearsLabel: 'HRA jaren',
	hraReductionPeriodLabel: 'HRA afbouw periode (jaren)',
	taxRateLabel: 'HRA percentage (%)',
	hraStartPercentageLabel: 'HRA start percentage (%)',
	month: 'maand',
	hraTooltip: 'Hypotheekrenteaftrek: belastingvoordeel op hypotheekrente',
	mortgageType: 'Hypotheektype',
	annuity: 'Annuïteit',
	linear: 'Lineair',
	firstMonthlyPayment: 'Eerste maandlast',
	investmentAccount: 'Beleggingsrekening',
	investmentAccountComparison: 'Beleggingsrekening vergelijking',
	investmentAccountBalance: 'Beleggingsrekening saldo',
	investmentAccountBalanceOverTime: 'Beleggingsrekening saldoverloop',
	investmentReturn: 'Beleggingsrendement (%)',
	wealthTax: 'Vermogensheffing (%)',
	creditInterest: 'Kredietrente (%)',
	difference: 'Verschil',
	return: 'Rendement',
	tax: 'Belasting',
	balance: 'Saldo',
	comparisonWithLinear: 'Vergelijking met lineaire hypotheek',
	investmentAccountSimulation: 'Beleggingsrekening simulatie',
	netDifference: 'Netto verschil (extra kosten minus beleggingsrekening voordeel)',
	netDifferenceTotal: 'Netto verschil totaal',
	netDifferenceMonthly: 'Netto verschil per maand',
	netDifferenceAnnuity: 'Netto verschil totaal (annuiteit)',
	netDifferenceLinear: 'Netto verschil totaal (lineair)',
	finalNetDifference: 'Verschil netto totaal (lineair - annuiteit)',
	currency: 'Valuta',
	comparison: 'Vergelijking',
	differenceCostComparison: 'Verschil extra kosten (lineair - annuiteit)',
	differenceMonthlyComparison: 'Verschil per maand (lineair - annuiteit)'
};

export const english: Translations = {
	title: 'Mortgage Calculator',
	parameters: 'Parameters',
	results: 'Results',
	loanAmount: 'Loan amount (€)',
	interestRate: 'Interest rate (%)',
	duration: 'Duration (years)',
	inflation: 'Inflation (%)',
	hraYears: 'MID years',
	taxRate: 'Tax rate (%)',
	hraLinearReduction: 'Linear MID reduction',
	hraEndPercentage: 'MID end percentage (%)',
	calculating: 'Calculating...',
	metric: 'Metric',
	nominal: 'Nominal',
	real: 'Real',
	monthlyPayment: 'Monthly payment',
	totalPaid: 'Total paid',
	extraCostsTotal: 'Extra costs total',
	extraCostsMonthly: 'Extra costs monthly',
	monthlyCostsOverTime: 'Monthly costs over time',
	nominalAmounts: 'Nominal amounts',
	realAmounts: 'Real amounts (inflation-corrected)',
	yearlyOverview: 'Yearly overview',
	expandAll: 'Expand all',
	collapseAll: 'Collapse all',
	year: 'Year',
	repayment: 'Repayment',
	netInterest: 'Net interest',
	hraBenefit: 'MID benefit',
	cumulativeInflation: 'Cumulative inflation',
	disclaimer:
		'DISCLAIMER: This is not financial advice. This calculation is intended solely for educational and informational purposes. The results are hypothetical and accuracy is not guaranteed. Always consult a financial advisor or mortgage specialist for personal advice. The creator takes no responsibility for decisions based on this tool. This calculator is 100% vibe coded - a small masterpiece!',
	hraYearsLabel: 'MID years',
	hraReductionPeriodLabel: 'MID reduction period (years)',
	taxRateLabel: 'MID percentage (%)',
	hraStartPercentageLabel: 'MID start percentage (%)',
	month: 'month',
	hraTooltip: 'Mortgage Interest Deduction: tax benefit on mortgage interest',
	mortgageType: 'Mortgage type',
	annuity: 'Annuity',
	linear: 'Linear',
	firstMonthlyPayment: 'First monthly payment',
	investmentAccount: 'Investment account',
	investmentAccountComparison: 'Investment account comparison',
	investmentAccountBalance: 'Investment account balance',
	investmentAccountBalanceOverTime: 'Investment account balance over time',
	investmentReturn: 'Investment return (%)',
	wealthTax: 'Wealth tax (%)',
	creditInterest: 'Credit interest (%)',
	difference: 'Difference',
	return: 'Return',
	tax: 'Tax',
	balance: 'Balance',
	comparisonWithLinear: 'Comparison with linear mortgage',
	investmentAccountSimulation: 'Investment account simulation',
	netDifference: 'Net difference (extra costs minus investment account benefit)',
	netDifferenceTotal: 'Net difference total',
	netDifferenceMonthly: 'Net difference monthly',
	netDifferenceAnnuity: 'Net difference total (annuity)',
	netDifferenceLinear: 'Net difference total (linear)',
	finalNetDifference: 'Final net difference (linear - annuity)',
	currency: 'Currency',
	comparison: 'Comparison',
	differenceCostComparison: 'Cost difference (linear - annuity)',
	differenceMonthlyComparison: 'Monthly difference (linear - annuity)'
};
