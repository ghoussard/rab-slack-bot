import { onRequest } from "firebase-functions/v2/https";
import { defineString } from "firebase-functions/params";
import {
  handleGetRabWallet,
  createExchangeWalletsFetcher,
} from "./application/getRabWallet";
import {
  createRabWalletSummaryMessage,
  setUpApp,
} from "./infrastructure/slack";
import {
  createKucoinWalletFetcher,
  createFtxWalletFetcher,
} from "./infrastructure/exchangeWalletFetcher";

const signingSecret = defineString("SLACK_SIGNING_SECRET");
const botToken = defineString("SLACK_BOT_TOKEN");

const ftxApiBaseUrl = defineString("FTX_API_BASE_URL");
const ftxApiKey = defineString("FTX_API_KEY");
const ftxApiSecret = defineString("FTX_API_SECRET");
const ftxSubaccount = defineString("FTX_SUBACCOUNT");

const kucoinApiBaseUrl = defineString("KUCOIN_API_BASE_URL");
const kucoinApiKey = defineString("KUCOIN_API_KEY");
const kucoinApiSecret = defineString("KUCOIN_API_SECRET");
const kucoinApiPassphrase = defineString("KUCOIN_API_PASSPHRASE");

export const handleslackcommand = onRequest((request, response) => {
  const [app, receiver] = setUpApp(signingSecret.value(), botToken.value());

  app.command("/rab-wallet", async ({ ack, respond }) => {
    await ack();

    const ftxWalletFetcher = createFtxWalletFetcher(
      ftxApiBaseUrl.value(),
      ftxApiKey.value(),
      ftxApiSecret.value(),
      ftxSubaccount.value()
    );

    const kucoinWalletFetcher = createKucoinWalletFetcher(
      kucoinApiBaseUrl.value(),
      kucoinApiKey.value(),
      kucoinApiSecret.value(),
      kucoinApiPassphrase.value()
    );

    const exchangeWalletsFetcher = createExchangeWalletsFetcher([
      ftxWalletFetcher,
      kucoinWalletFetcher,
    ]);

    const rabWallet = await handleGetRabWallet(exchangeWalletsFetcher)();

    const response = createRabWalletSummaryMessage(rabWallet);

    await respond(response);
  });

  receiver.requestHandler(request, response);
});
