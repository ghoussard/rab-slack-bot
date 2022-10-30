import {
  ExchangeWallet,
  RabWallet,
  createFromExchangeWallets,
} from "../../domain/rabWallet";

type ExchangeWalletsFetcherInterface = {
  fetch: () => Promise<ExchangeWallet[]>;
};

const handleGetRabWallet = (
  exchangeWalletsFetcher: ExchangeWalletsFetcherInterface
): (() => Promise<RabWallet>) => {
  return async () => {
    const exchangeWallets = await exchangeWalletsFetcher.fetch();
    return createFromExchangeWallets(exchangeWallets);
  };
};

export type { ExchangeWalletsFetcherInterface };
export { handleGetRabWallet };
