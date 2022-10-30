import { createHmac } from "crypto";
import axios, {
  AxiosRequestConfig,
  AxiosResponse,
  RawAxiosRequestHeaders,
} from "axios";
import { ExchangeWallet } from "../../domain/rabWallet";
import { ExchangeWalletFetcherInterface } from "../../application/getRabWallet";

type ApiGetParams = { [param: string]: string };

type Account = {
  currency: string;
  balance: number;
};

type FiatPrices = {
  [currency: string]: number;
};

class KucoinWalletFetcher implements ExchangeWalletFetcherInterface {
  private readonly apiBaseUrl: string;
  private readonly apiKey: string;
  private readonly apiSecret: string;
  private readonly apiPassphrase: string;

  public constructor(
    apiBaseUrl: string,
    apiKey: string,
    apiSecret: string,
    apiPassphrase: string
  ) {
    this.apiBaseUrl = apiBaseUrl;
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.apiPassphrase = apiPassphrase;
  }

  public async fetch(): Promise<ExchangeWallet> {
    let accounts = await this.getAccounts();
    accounts = this.removeNullAccounts(accounts);
    accounts = this.aggregateAccounts(accounts);

    const ownedCryptoCurrencies = accounts.map(({ currency }) => currency);
    const fiatPrices = await this.getFiatPrices(ownedCryptoCurrencies);

    const exchangeName = "KuCoin";
    const cryptoCurrencies = accounts.map(({ currency, balance }) => ({
      symbol: currency,
      amount: balance,
      amountFiatValue: balance * fiatPrices[currency],
    }));
    const totalFiatValue = accounts.reduce(
      (acc: number, { currency, balance }) =>
        acc + balance * fiatPrices[currency],
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

  private async getFiatPrices(
    cryptoCurrencySymbols: string[] = []
  ): Promise<FiatPrices> {
    const params: ApiGetParams = {
      base: "USD",
    };

    if (cryptoCurrencySymbols.length > 0) {
      params.currencies = cryptoCurrencySymbols.join(",");
    }

    const rawFiatPrices = await this.get("prices", params);

    const fiatPrices: FiatPrices = {};
    Object.keys(rawFiatPrices).forEach((symbol: string) => {
      fiatPrices[symbol] = parseFloat(rawFiatPrices[symbol]);
    });

    return fiatPrices;
  }

  private getAccounts = async (): Promise<Account[]> => {
    const rawAccounts = await this.get("accounts");
    return rawAccounts.map(
      ({ currency, balance }: { [key: string]: string }) => ({
        currency,
        balance: parseFloat(balance),
      })
    );
  };

  private removeNullAccounts(accounts: Account[]): Account[] {
    return accounts.filter(({ balance }) => 0 < balance);
  }

  private aggregateAccounts(accounts: Account[]): Account[] {
    const indexedByCurencyAccounts: { [index: string]: Account } = {};
    accounts.forEach(({ currency, balance }: Account) => {
      if (Object.keys(indexedByCurencyAccounts).includes(currency)) {
        indexedByCurencyAccounts[currency].balance += balance;
      } else {
        indexedByCurencyAccounts[currency] = {
          currency,
          balance,
        };
      }
    });

    return Object.values(indexedByCurencyAccounts);
  }

  /* eslint-disable @typescript-eslint/no-explicit-any */
  private async get(resource: string, params?: ApiGetParams): Promise<any> {
    const path = `/api/v1/${resource}`;
    const url = `${this.apiBaseUrl}${path}`;
    const method = "GET";
    const headers: RawAxiosRequestHeaders = this.getHeaders(method, path);

    const requestConfig: AxiosRequestConfig = {
      url,
      method,
      headers,
      params,
    };

    try {
      const response: AxiosResponse = await axios.request(requestConfig);
      return response.data.data;
      /* eslint-disable @typescript-eslint/no-explicit-any */
    } catch (e: any) {
      const statusCode = e.response.status;
      const statusText = e.response.statusText;
      const errorCode = e.response.data.code;
      const errorMessage = e.response.data.msg;

      throw new Error(
        `[${statusCode} ${statusText}] ${errorCode} ${errorMessage}`
      );
    }
  }

  private getHeaders(method: string, path: string): RawAxiosRequestHeaders {
    const timestamp = new Date().getTime();
    const signature = this.encryptString(`${timestamp}${method}${path}`);
    const encryptedApiPassphrase = this.encryptString(this.apiPassphrase);

    return {
      "KC-API-SIGN": signature,
      "KC-API-TIMESTAMP": timestamp.toString(),
      "KC-API-KEY": this.apiKey,
      "KC-API-PASSPHRASE": encryptedApiPassphrase,
      "KC-API-KEY-VERSION": "2",
    };
  }

  private encryptString(stringToEncrypt: string): string {
    const hmac = createHmac("sha256", this.apiSecret);
    hmac.update(stringToEncrypt);
    return hmac.digest("base64");
  }
}

const createKucoinWalletFetcher = (
  apiBaseUrl: string,
  apiKey: string,
  apiSecret: string,
  apiPassphrase: string
) => new KucoinWalletFetcher(apiBaseUrl, apiKey, apiSecret, apiPassphrase);

export { createKucoinWalletFetcher };
