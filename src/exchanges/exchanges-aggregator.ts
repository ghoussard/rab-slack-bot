import { FtxWalletBalance, getFtxWalletBalances } from './clients/ftx-client';
import {
  KucoinAccount, KucoinFiatPrices, getKucoinAccounts, getKucoinFiatPrices,
} from './clients/kucoin-client';

type FiatCurrency = 'USD';

type CryptoCurrency = {
  symbol: string;
  amount: number;
  amountFiatValue: number;
  fiatCurrency: FiatCurrency;
};

type Wallet = {
  cryptoCurrencies: CryptoCurrency[];
  fiatValue: number;
  fiatCurrency: FiatCurrency;
};

type Exchange = 'FTX' | 'KuCoin';

type ExchangeWallet = {
  exchange: Exchange;
  wallet: Wallet;
};

type AggregatedExchangeWallet = {
  exchangeWallets: ExchangeWallet[];
  fiatValue: number;
  fiatCurrency: FiatCurrency;
};

const getFtxWallet = async (): Promise<ExchangeWallet> => {
  const ftxWalletBalances: FtxWalletBalance[] = await getFtxWalletBalances();

  const notEmptyFtxWalletBalances: FtxWalletBalance[] = ftxWalletBalances.filter(
    ({ total }: FtxWalletBalance) => total > 0,
  );
  const fiatCurrency: FiatCurrency = 'USD';

  const ftxWallet: ExchangeWallet = {
    exchange: 'FTX',
    wallet: {
      cryptoCurrencies: notEmptyFtxWalletBalances.map(
        ({ coin, total, usdValue }: FtxWalletBalance): CryptoCurrency => ({
          symbol: coin,
          amount: total,
          amountFiatValue: usdValue,
          fiatCurrency,
        }),
      ),
      fiatValue: notEmptyFtxWalletBalances.reduce(
        (fiatValueAcc: number, { usdValue }: FtxWalletBalance) => fiatValueAcc + usdValue,
        0,
      ),
      fiatCurrency,
    },
  };

  return ftxWallet;
};

const getKucoinWallet = async (): Promise<ExchangeWallet> => {
  const kucoinAccounts: KucoinAccount[] = await getKucoinAccounts();

  const aggregedKucoinAccounts: { [index: string]: KucoinAccount } = {};
  kucoinAccounts.forEach(({ currency, balance }: KucoinAccount) => {
    if (Object.keys(aggregedKucoinAccounts).includes(currency)) {
      aggregedKucoinAccounts[currency].balance += balance;
    } else {
      aggregedKucoinAccounts[currency] = {
        currency,
        balance,
      };
    }
  });

  const fiatCurrency: FiatCurrency = 'USD';
  const kucoinFiatPrices: KucoinFiatPrices = await getKucoinFiatPrices(
    Object.keys(aggregedKucoinAccounts),
    fiatCurrency,
  );
  const computeFiatValue = (aggregedKucoinAccountCurrency: string): number => {
    const { balance } = aggregedKucoinAccounts[aggregedKucoinAccountCurrency];
    const price = kucoinFiatPrices[aggregedKucoinAccountCurrency];

    return balance * price;
  };

  const kucoinWallet: ExchangeWallet = {
    exchange: 'KuCoin',
    wallet: {
      cryptoCurrencies: Object.keys(aggregedKucoinAccounts).map(
        (aggregedKucoinAccountCurrency: string): CryptoCurrency => ({
          symbol: aggregedKucoinAccountCurrency,
          amount: aggregedKucoinAccounts[aggregedKucoinAccountCurrency].balance,
          amountFiatValue: computeFiatValue(aggregedKucoinAccountCurrency),
          fiatCurrency,
        }),
      ),
      fiatValue: Object.keys(aggregedKucoinAccounts).reduce(
        (fiatValueAcc: number, aggregedKucoinAccountCurrency: string) => fiatValueAcc
          + computeFiatValue(aggregedKucoinAccountCurrency),
        0,
      ),
      fiatCurrency,
    },
  };

  return kucoinWallet;
};

const getAggregatedExchangeWallet = async (): Promise<AggregatedExchangeWallet> => {
  const ftxWallet: ExchangeWallet = await getFtxWallet();
  const kucoinWallet: ExchangeWallet = await getKucoinWallet();

  const exchangeWallets: ExchangeWallet[] = [ftxWallet, kucoinWallet];
  const fiatValue: number = exchangeWallets.reduce(
    (fiatValueAcc: number, { wallet }: ExchangeWallet) => fiatValueAcc + wallet.fiatValue,
    0,
  );

  const fiatCurrency: FiatCurrency = 'USD';

  const aggregatedExchangeWallet: AggregatedExchangeWallet = {
    exchangeWallets,
    fiatValue,
    fiatCurrency,
  };

  return aggregatedExchangeWallet;
};

export type {
  AggregatedExchangeWallet,
};

export {
  getAggregatedExchangeWallet,
};
