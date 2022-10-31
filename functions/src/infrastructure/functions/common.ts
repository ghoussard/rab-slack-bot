import { RabWallet } from "../../domain/rabWallet";
import {
  handleGetRabWallet,
  createExchangeWalletsFetcher,
} from "../../application/getRabWallet";
import {
  createKucoinWalletFetcher,
  createFtxWalletFetcher,
} from "../exchangeWalletFetcher";

const getRabWallet = async (
  ftxApiBaseUrl: string,
  ftxApiKey: string,
  ftxApiSecret: string,
  ftxSubaccount: string,
  kucoinApiBaseUrl: string,
  kucoinApiKey: string,
  kucoinApiSecret: string,
  kucoinApiPassphrase: string
): Promise<RabWallet> => {
  const ftxWalletFetcher = createFtxWalletFetcher(
    ftxApiBaseUrl,
    ftxApiKey,
    ftxApiSecret,
    ftxSubaccount
  );

  const kucoinWalletFetcher = createKucoinWalletFetcher(
    kucoinApiBaseUrl,
    kucoinApiKey,
    kucoinApiPassphrase,
    kucoinApiSecret
  );

  const exchangeWalletsFetcher = createExchangeWalletsFetcher([
    ftxWalletFetcher,
    kucoinWalletFetcher,
  ]);

  return handleGetRabWallet(exchangeWalletsFetcher)();
};

const isRabMember = (
  rabMembers: string[],
  commandAuthorHandle: string
): boolean => rabMembers.includes(commandAuthorHandle);

export { getRabWallet, isRabMember };
