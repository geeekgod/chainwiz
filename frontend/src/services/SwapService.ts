export class SwapService {
  private ZRX_API_URL = 'https://api.0x.org';
  
  async getSwapQuote(fromToken: string, toToken: string, amount: string) {
    try {
      const response = await fetch(
        `${this.ZRX_API_URL}/swap/v1/quote?` + new URLSearchParams({
          sellToken: fromToken,
          buyToken: toToken,
          sellAmount: amount,
        })
      );

      if (!response.ok) {
        throw new Error(`0x API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting swap quote:', error);
      throw error;
    }
  }

  getTokenSymbol(symbol: string): string {
    const tokens = {
      'ETH': 'ETH',
      'USDT': 'USDT',
      'USDC': 'USDC',
    };
    return tokens[symbol as keyof typeof tokens] || symbol;
  }
} 