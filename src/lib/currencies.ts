export interface Currency {
	code: string;
	symbol: string;
	name: string;
}

export const currencies: Currency[] = [
	{ code: 'EUR', symbol: '€', name: 'Euro' },
	{ code: 'USD', symbol: '$', name: 'US Dollar' },
	{ code: 'GBP', symbol: '£', name: 'British Pound' },
	{ code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
	{ code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
	{ code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
	{ code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
	{ code: 'SEK', symbol: 'kr', name: 'Swedish Krona' },
	{ code: 'NOK', symbol: 'kr', name: 'Norwegian Krone' },
	{ code: 'DKK', symbol: 'kr', name: 'Danish Krone' },
	{ code: 'PLN', symbol: 'zł', name: 'Polish Zloty' },
	{ code: 'CZK', symbol: 'Kč', name: 'Czech Koruna' },
	{ code: 'HUF', symbol: 'Ft', name: 'Hungarian Forint' },
	{ code: 'RUB', symbol: '₽', name: 'Russian Ruble' },
	{ code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
	{ code: 'INR', symbol: '₹', name: 'Indian Rupee' },
	{ code: 'KRW', symbol: '₩', name: 'South Korean Won' },
	{ code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
	{ code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar' },
	{ code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar' },
	{ code: 'MXN', symbol: '$', name: 'Mexican Peso' },
	{ code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
	{ code: 'ZAR', symbol: 'R', name: 'South African Rand' },
	{ code: 'TRY', symbol: '₺', name: 'Turkish Lira' },
	{ code: 'ILS', symbol: '₪', name: 'Israeli Shekel' },
	{ code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
	{ code: 'SAR', symbol: '﷼', name: 'Saudi Riyal' },
	{ code: 'THB', symbol: '฿', name: 'Thai Baht' },
	{ code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit' },
	{ code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah' },
	{ code: 'PHP', symbol: '₱', name: 'Philippine Peso' },
	{ code: 'VND', symbol: '₫', name: 'Vietnamese Dong' }
];
