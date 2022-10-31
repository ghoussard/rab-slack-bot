import { onSchedule } from "firebase-functions/v2/scheduler";
import { getRabWallet } from "./common";
import {
  slackBotToken,
  slackSigningSecret,
  slackRabChannel,
  ftxApiBaseUrl,
  ftxApiKey,
  ftxApiSecret,
  ftxSubaccount,
  kucoinApiBaseUrl,
  kucoinApiKey,
  kucoinApiPassphrase,
  kucoinApiSecret,
} from "./params";
import {
  createSlackApp,
  formatRabWalletToRespondArguments,
  sendMessageToChannel,
} from "../slack";

export const sendrabwallettoslackrabchannel = onSchedule(
  {
    schedule: "55 09 * * *",
    timeZone: "Europe/Paris",
  },
  async () => {
    const [app] = createSlackApp(
      slackSigningSecret.value(),
      slackBotToken.value()
    );

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

    const args = formatRabWalletToRespondArguments(rabWallet);

    await sendMessageToChannel(app)(
      slackRabChannel.value(),
      "RAB Wallet",
      args
    );
  }
);
