import {
  WalletBalance as FtxWalletBalance,
  getWalletBalances as getFtxWalletBalances,
} from './clients/ftx';
import {
  Account as KucoinAccount,
  FiatPrices as KucoinFiatPrices,
  getAggregatedAccounts as getKucoinAccounts,
  getFiatPrices as getKucoinFiatPrices,
} from './clients/kucoin';

type FiatCurrency = 'USD';

type CryptoCurrency = {
  symbol: string;
  amount: number;
  amountFiatValue: number;
};

type Wallet = {
  cryptoCurrencies: CryptoCurrency[];
  fiatValue: number;
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

  const ftxWallet: ExchangeWallet = {
    exchange: 'FTX',
    wallet: {
      cryptoCurrencies: ftxWalletBalances.map(
        ({ coin, total, usdValue }: FtxWalletBalance): CryptoCurrency => ({
          symbol: coin,
          amount: total,
          amountFiatValue: usdValue,
        }),
      ),
      fiatValue: ftxWalletBalances.reduce(
        (acc: number, { usdValue }: FtxWalletBalance) => acc + usdValue,
        0,
      ),
    },
  };

  return ftxWallet;
};

const getKucoinWallet = async (): Promise<ExchangeWallet> => {
  const kucoinAccounts: KucoinAccount[] = await getKucoinAccounts();

  const fiatCurrency: FiatCurrency = 'USD';
  const kucoinFiatPrices: KucoinFiatPrices = await getKucoinFiatPrices(
    kucoinAccounts.map(({ currency }: KucoinAccount) => currency),
    fiatCurrency,
  );

  const kucoinWallet: ExchangeWallet = {
    exchange: 'KuCoin',
    wallet: {
      cryptoCurrencies: kucoinAccounts.map(({ currency, balance }: KucoinAccount) => ({
        symbol: currency,
        amount: balance,
        amountFiatValue: balance * kucoinFiatPrices[currency],
      })),
      fiatValue: kucoinAccounts.reduce(
        (acc: number, { currency, balance }: KucoinAccount) => acc
          + balance * kucoinFiatPrices[currency],
        0,
      ),
    },
  };

  return kucoinWallet;
};

const getAggregatedExchangeWallet = async (): Promise<AggregatedExchangeWallet> => {
  const ftxWallet: ExchangeWallet = await getFtxWallet();
  const kucoinWallet: ExchangeWallet = await getKucoinWallet();

  const exchangeWallets: ExchangeWallet[] = [ftxWallet, kucoinWallet];
  const fiatValue: number = exchangeWallets.reduce(
    (acc: number, { wallet }: ExchangeWallet) => acc + wallet.fiatValue,
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
  CryptoCurrency,
  ExchangeWallet,
};

export {
  getAggregatedExchangeWallet,
};
