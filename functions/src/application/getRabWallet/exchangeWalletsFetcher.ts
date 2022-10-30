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

  public fetch(): Promise<ExchangeWallet[]> {
    const fetchPromises = this.fetchers.map((fetcher) => fetcher.fetch());
    return Promise.all(fetchPromises);
  }
}

const createExchangeWalletsFetcher = (
  fetchers: ExchangeWalletFetcherInterface[]
) => new ExchangeWalletsFetcher(fetchers);

export type { ExchangeWalletFetcherInterface };
export { createExchangeWalletsFetcher };
