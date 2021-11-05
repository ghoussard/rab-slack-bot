import { env } from 'process';
import { createHmac, Hmac } from 'crypto';
import axios, { AxiosRequestConfig, AxiosRequestHeaders, AxiosResponse } from 'axios';

type FtxApiMethod = 'GET';

const encryptString = (stringToEncrypt: string): string => {
    const apiSecret: string = env.FTX_API_SECRET || '';
    const hmac: Hmac = createHmac('sha256', apiSecret);
    hmac.update(stringToEncrypt);
    return hmac.digest('hex');
}

const constructHeaders = (path: string, method: FtxApiMethod): AxiosRequestHeaders => {
    const apiKey: string = env.FTX_API_KEY || '';
    const timestamp = (new Date()).getTime();
    const signature = encryptString(`${timestamp}${method}${path}`);
    const subaccount: string = env.FTX_SUBACCOUNT || '';

    return {
        'FTX-KEY': apiKey,
        'FTX-TS': timestamp.toString(),
        'FTX-SIGN': signature,
        'FTX-SUBACCOUNT': subaccount,
    }
}

const get = async (resource: string): Promise<any> => {
    const baseUrl: string = env.FTX_API_BASE_URL || '';
    const path = `/api/${resource}`;
    const url = `${baseUrl}${path}`;
    const method: FtxApiMethod = 'GET';
    const headers: AxiosRequestHeaders = constructHeaders(path, method);

    const requestConfig: AxiosRequestConfig = {
        url,
        method,
        headers,
    }

    try {
        const response: AxiosResponse = await axios.request(requestConfig);
        return response.data.result;
    } catch (e: any) {
        const statusCode = e.response.status;
        const statusText = e.response.statusText;
        const errorMessage = e.response.data.error;

        throw new Error(`[${statusCode} ${statusText}] ${errorMessage}`);
    }
}

type FtxWalletBalance = {
    coin: string;
    total: number;
    usdValue: number;
}

const getFtxWalletBalances = (): Promise<FtxWalletBalance[]> => {
    return get('wallet/balances');
}

export type {
    FtxWalletBalance,
}

export {
    getFtxWalletBalances,
}
