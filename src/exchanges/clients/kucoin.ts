import { env } from 'process';
import { createHmac, Hmac } from 'crypto';
import axios, { AxiosRequestConfig, AxiosRequestHeaders, AxiosResponse } from 'axios';

type ApiMethod = 'GET';
type ApiRequestParams = {[param: string]: string};

const encryptString = (stringToEncrypt: string): string => {
    const apiSecret: string = env.KUCOIN_API_SECRET || '';
    const hmac: Hmac = createHmac('sha256', apiSecret);
    hmac.update(stringToEncrypt);
    return hmac.digest('base64');
}

const constructHeaders = (path: string, method: ApiMethod): AxiosRequestHeaders => {
    const timestamp: number = (new Date()).getTime();
    const signature: string = encryptString(`${timestamp}${method}${path}`);
    const apiKey: string = env.KUCOIN_API_KEY || '';
    const apiPassphrase: string = env.KUCOIN_API_PASSPHRASE || '';
    const encryptedApiPassphrase: string = encryptString(apiPassphrase);

    return {
        'KC-API-SIGN': signature,
        'KC-API-TIMESTAMP': timestamp.toString(),
        'KC-API-KEY': apiKey,
        'KC-API-PASSPHRASE': encryptedApiPassphrase,
        'KC-API-KEY-VERSION': '2',
    }
}

const get = async (resource: string, params?: ApiRequestParams): Promise<any> => {
    const baseUrl: string = env.KUCOIN_API_BASE_URL || '';
    const path: string = `/api/v1/${resource}`;
    const url: string = `${baseUrl}${path}`;
    const method: ApiMethod = 'GET';
    const headers: AxiosRequestHeaders = constructHeaders(path, method);

    const requestConfig: AxiosRequestConfig = {
        url,
        method,
        headers,
        params,
    };

    try {
        const response: AxiosResponse = await axios.request(requestConfig);
        return response.data.data;
    } catch (e: any) {
        const statusCode = e.response.status;
        const statusText = e.response.statusText;
        const errorCode = e.response.data.code;
        const errorMessage = e.response.data.msg;

        throw new Error(`[${statusCode} ${statusText}] ${errorCode} ${errorMessage}`);
    }
}

type Account = {
    currency: string;
    balance: number;
}

const getAccounts = async (): Promise<Account[]> => {
    const rawAccounts: any = await get('accounts');

    return rawAccounts.map(({currency, balance}: any) => ({
        currency,
        balance: parseFloat(balance),
    }));
}

const getAggregatedAccounts = async (): Promise<Account[]> => {
    const accounts: Account[] = await getAccounts();

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


type FiatCurrency = 'USD';

type FiatPrices = { 
    [currency: string]: number; 
};

const getFiatPrices = async (cryptoCurrencySymbols: string[] = [], FiatCurrency: FiatCurrency = 'USD'): Promise<FiatPrices> => {
    const params: ApiRequestParams = {
        base: FiatCurrency,
    };

    if(cryptoCurrencySymbols.length > 0) {
        params.currencies = cryptoCurrencySymbols.join(',');
    }

    const rawFiatPrices: any = await get('prices', params);

    const fiatPrices: FiatPrices = {};
    Object.keys(rawFiatPrices).forEach((symbol: string) => {
        fiatPrices[symbol] = parseFloat(rawFiatPrices[symbol]);
    });
    
    return fiatPrices;
}

export type {
    Account,
    FiatPrices,
}

export {
    getAggregatedAccounts,
    getFiatPrices,
}
