import { https, scheduler } from "firebase-functions/v2";
import { defineString } from "firebase-functions/params";
import { RabWallet } from "./domain/rabWallet";
import {
  handleGetRabWallet,
  createExchangeWalletsFetcher,
} from "./application/getRabWallet";
import {
  createRabWalletSummaryMessage,
  createSlackApp,
  sendRabWalletSummaryMessageToChannel,
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

const rabMembersHandles = defineString("SLACK_RAB_MEMBERS_HANDLE", {
  default: "[]",
});

const rabChannel = defineString("SLACK_RAB_CHANNEL");

const isRabMember = (
  rabMembers: string[],
  commandAuthorHandle: string
): boolean => rabMembers.includes(commandAuthorHandle);

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
    kucoinApiSecret,
    kucoinApiPassphrase
  );

  const exchangeWalletsFetcher = createExchangeWalletsFetcher([
    ftxWalletFetcher,
    kucoinWalletFetcher,
  ]);

  return handleGetRabWallet(exchangeWalletsFetcher)();
};

export const handleslackcommand = https.onRequest((request, response) => {
  const [app, receiver] = createSlackApp(
    signingSecret.value(),
    botToken.value()
  );

  app.command("/rab-wallet", async ({ ack, command, respond }) => {
    await ack();

    const rabMembers = JSON.parse(rabMembersHandles.value());

    if (!isRabMember(rabMembers, command.user_name)) {
      await respond("Sorry, only RAB members have access to RAB fund wallet!");
    }

    const rabWallet = await getRabWallet(
      ftxApiBaseUrl.value(),
      ftxApiKey.value(),
      ftxApiSecret.value(),
      ftxSubaccount.value(),
      kucoinApiBaseUrl.value(),
      kucoinApiKey.value(),
      kucoinApiSecret.value(),
      kucoinApiPassphrase.value()
    );

    const response = createRabWalletSummaryMessage(rabWallet);

    await respond(response);
  });

  receiver.requestHandler(request, response);
});

export const sendrabwallettoslackrabchannel = scheduler.onSchedule(
  {
    schedule: "55 09 * * *",
    timeZone: "Europe/Paris",
  },
  async () => {
    const [app] = createSlackApp(signingSecret.value(), botToken.value());

    const rabWallet = await getRabWallet(
      ftxApiBaseUrl.value(),
      ftxApiKey.value(),
      ftxApiSecret.value(),
      ftxSubaccount.value(),
      kucoinApiBaseUrl.value(),
      kucoinApiKey.value(),
      kucoinApiSecret.value(),
      kucoinApiPassphrase.value()
    );

    await sendRabWalletSummaryMessageToChannel(
      app,
      rabChannel.value(),
      rabWallet
    );
  }
);
