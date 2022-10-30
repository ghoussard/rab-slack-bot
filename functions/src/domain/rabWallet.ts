type CryptoCurrency = {
  symbol: string;
  amount: number;
  amountFiatValue: number;
};

type Wallet = {
  cryptoCurrencies: CryptoCurrency[];
  totalFiatValue: number;
};

type ExchangeWallet = {
  exchangeName: string;
  wallet: Wallet;
};

type RabWallet = {
  exchangeWallets: ExchangeWallet[];
  totalFiatValue: number;
};

const createFromExchangeWallets = (
  exchangeWallets: ExchangeWallet[]
): RabWallet => {
  const totalFiatValue = exchangeWallets.reduce(
    (acc: number, { wallet }: ExchangeWallet) => acc + wallet.totalFiatValue,
    0
  );

  return {
    exchangeWallets,
    totalFiatValue,
  };
};

export type { CryptoCurrency, ExchangeWallet, RabWallet, Wallet };
export { createFromExchangeWallets };
