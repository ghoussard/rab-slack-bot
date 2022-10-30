import { createHmac } from "crypto";
import axios, {
  AxiosRequestConfig,
  AxiosResponse,
  RawAxiosRequestHeaders,
} from "axios";
import { CryptoCurrency, ExchangeWallet } from "../../domain/rabWallet";
import { ExchangeWalletFetcherInterface } from "../../application/getRabWallet";

type WalletBalance = {
  coin: string;
  total: number;
  usdValue: number;
};

class FtxWalletFetcher implements ExchangeWalletFetcherInterface {
  private readonly apiBaseUrl: string;
  private readonly apiKey: string;
  private readonly apiSecret: string;
  private readonly subaccount: string;

  public constructor(
    apiBaseUrl: string,
    apiKey: string,
    apiSecret: string,
    subaccount: string
  ) {
    this.apiBaseUrl = apiBaseUrl;
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.subaccount = subaccount;
  }

  public async fetch(): Promise<ExchangeWallet> {
    let walletBalances = await this.getWalletBalances();
    walletBalances = this.removeNullWalletBalances(walletBalances);

    const exchangeName = "FTX";
    const cryptoCurrencies = walletBalances.map(
      ({ coin, total, usdValue }): CryptoCurrency => ({
        symbol: coin,
        amount: total,
        amountFiatValue: usdValue,
      })
    );
    const totalFiatValue = walletBalances.reduce(
      (acc: number, { usdValue }) => acc + usdValue,
      0
    );

    return {
      exchangeName,
      wallet: {
        cryptoCurrencies,
        totalFiatValue,
      },
    };
  }

  private async getWalletBalances(): Promise<WalletBalance[]> {
    const path = "/api/wallet/balances";
    const url = `${this.apiBaseUrl}${path}`;
    const method = "GET";
    const headers = this.getRequestHeaders(method, path);

    const requestConfig: AxiosRequestConfig = {
      url,
      method,
      headers,
    };

    try {
      const response: AxiosResponse = await axios.request(requestConfig);
      return response.data.result;
      /* eslint-disable @typescript-eslint/no-explicit-any */
    } catch (e: any) {
      const statusCode = e.response.status;
      const statusText = e.response.statusText;
      const errorMessage = e.response.data.error;

      throw new Error(`[${statusCode} ${statusText}] ${errorMessage}`);
    }
  }

  private removeNullWalletBalances(
    walletBalances: WalletBalance[]
  ): WalletBalance[] {
    return walletBalances.filter(({ total }) => 0 < total);
  }

  private getRequestHeaders(
    method: string,
    path: string
  ): RawAxiosRequestHeaders {
    const timestamp = new Date().getTime();
    const signature = this.encryptString(`${timestamp}${method}${path}`);

    return {
      "FTX-KEY": this.apiKey,
      "FTX-TS": timestamp.toString(),
      "FTX-SIGN": signature,
      "FTX-SUBACCOUNT": this.subaccount,
    };
  }

  private encryptString(stringToEncrypt: string): string {
    const hmac = createHmac("sha256", this.apiSecret);
    hmac.update(stringToEncrypt);
    return hmac.digest("hex");
  }
}

const createFtxWalletFetcher = (
  apiBaseUrl: string,
  apiKey: string,
  apiSecret: string,
  subaccount: string
): FtxWalletFetcher =>
  new FtxWalletFetcher(apiBaseUrl, apiKey, apiSecret, subaccount);

export { createFtxWalletFetcher };
