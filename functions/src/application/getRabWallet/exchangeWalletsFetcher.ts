import { ExchangeWalletsFetcherInterface } from "./handleGetRabWallet";
import { ExchangeWallet } from "../../domain/rabWallet";

type ExchangeWalletFetcherInterface = {
  fetch: () => Promise<ExchangeWallet>;
};

class ExchangeWalletsFetcher implements ExchangeWalletsFetcherInterface {
  private readonly fetchers: ExchangeWalletFetcherInterface[];

  public constructor(fetchers: ExchangeWalletFetcherInterface[]) {
    this.fetchers = fetchers;
  }

  public async fetch(): Promise<ExchangeWallet[]> {
    const wallets = [];
    for (const fetcher of this.fetchers) {
      try {
        wallets.push(await fetcher.fetch());
        /* eslint-disable no-empty */
      } catch (e) {}
    }
    return wallets;
  }
}

const createExchangeWalletsFetcher = (
  fetchers: ExchangeWalletFetcherInterface[]
) => new ExchangeWalletsFetcher(fetchers);

export type { ExchangeWalletFetcherInterface };
export { createExchangeWalletsFetcher };
