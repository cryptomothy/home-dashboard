// Types pour l'API CoinGecko
interface CoinGeckoResponse {
	[key: string]: {
		cad: number;
		cad_24h_change: number;
	};
}

interface CryptoData {
	symbol: string;
	name: string;
	price: number;
	change24h: number;
	isUp: boolean;
}

class CryptoService {
	private baseUrl = 'https://api.coingecko.com/api/v3';
	
	async getCryptoPrices(): Promise<CryptoData[]> {
		try {
			console.log('💰 Récupération des prix des cryptomonnaies...');
			
			// Récupérer BTC et ETH en CAD
			const response = await fetch(
				`${this.baseUrl}/simple/price?ids=bitcoin,ethereum&vs_currencies=cad&include_24hr_change=true`
			);
			
			if (!response.ok) {
				throw new Error(`Erreur API CoinGecko: ${response.status}`);
			}
			
			const data: CoinGeckoResponse = await response.json();
			console.log('✅ Prix des cryptomonnaies récupérés avec succès');
			
			// Traiter les données
			const cryptos: CryptoData[] = [];
			
			// Bitcoin
			if (data.bitcoin) {
				cryptos.push({
					symbol: 'BTC',
					name: 'Bitcoin',
					price: data.bitcoin.cad,
					change24h: data.bitcoin.cad_24h_change,
					isUp: data.bitcoin.cad_24h_change > 0
				});
			}
			
			// Ethereum
			if (data.ethereum) {
				cryptos.push({
					symbol: 'ETH',
					name: 'Ethereum',
					price: data.ethereum.cad,
					change24h: data.ethereum.cad_24h_change,
					isUp: data.ethereum.cad_24h_change > 0
				});
			}
			
			return cryptos;
			
		} catch (error) {
			console.error('Erreur lors de la récupération des prix crypto:', error);
			console.log('🔄 Utilisation des données mockées en fallback');
			return this.getMockCryptoData();
		}
	}
	
	private getMockCryptoData(): CryptoData[] {
		return [
			{
				symbol: 'BTC',
				name: 'Bitcoin',
				price: 58750.67,
				change24h: 2.34,
				isUp: true
			},
			{
				symbol: 'ETH',
				name: 'Ethereum',
				price: 2856.89,
				change24h: -1.23,
				isUp: false
			}
		];
	}
	
	formatPrice(price: number): string {
		return new Intl.NumberFormat('fr-CA', {
			style: 'currency',
			currency: 'CAD',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		}).format(price);
	}
	
	formatChange(change: number): string {
		const sign = change > 0 ? '+' : '';
		return `${sign}${change.toFixed(2)}%`;
	}
}

export const cryptoService = new CryptoService();
export type { CryptoData }; 