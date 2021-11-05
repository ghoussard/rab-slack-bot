import { env } from 'process';
import { createHmac, Hmac } from 'crypto';
import axios, { AxiosRequestConfig, AxiosRequestHeaders, AxiosResponse } from 'axios';

type KucoinApiMethod = 'GET';
type KucoinApiRequestParams = {[param: string]: string};

const encryptString = (stringToEncrypt: string): string => {
    const apiSecret: string = env.KUCOIN_API_SECRET || '';
    const hmac: Hmac = createHmac('sha256', apiSecret);
    hmac.update(stringToEncrypt);
    return hmac.digest('base64');
}

const constructHeaders = (path: string, method: KucoinApiMethod): AxiosRequestHeaders => {
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

const get = async (resource: string, params?: KucoinApiRequestParams): Promise<any> => {
    const baseUrl: string = env.KUCOIN_API_BASE_URL || '';
    const path: string = `/api/v1/${resource}`;
    const url: string = `${baseUrl}${path}`;
    const method: KucoinApiMethod = 'GET';
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

type KucoinAccount = {
    currency: string;
    balance: number;
}

const getKucoinAccounts = async (): Promise<KucoinAccount[]> => {
    const rawAccounts: any = await get('accounts');

    return rawAccounts.map(({currency, balance}: any) => ({
        currency,
        balance: parseFloat(balance),
    }));
}

type KucoinFiatCurrency = 'USD';

type KucoinFiatPrices = { 
    [currency: string]: number; 
};

const getKucoinFiatPrices = async (cryptoCurrencySymbols: string[] = [], fiatCurrency: KucoinFiatCurrency = 'USD'): Promise<KucoinFiatPrices> => {
    const params: KucoinApiRequestParams = {
        base: fiatCurrency,
    };

    if(cryptoCurrencySymbols.length > 0) {
        params.currencies = cryptoCurrencySymbols.join(',');
    }

    const rawFiatPrices: any = await get('prices', params);

    const fiatPrices: KucoinFiatPrices = {};
    Object.keys(rawFiatPrices).forEach((symbol: string) => {
        fiatPrices[symbol] = parseFloat(rawFiatPrices[symbol]);
    });
    return fiatPrices;
}

export type {
    KucoinAccount,
    KucoinFiatPrices,
}

export {
    getKucoinAccounts,
    getKucoinFiatPrices,
}
