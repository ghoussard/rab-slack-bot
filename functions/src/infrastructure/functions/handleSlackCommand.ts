import { onRequest } from "firebase-functions/v2/https";
import { getRabWallet, isRabMember } from "./common";
import {
  slackBotToken,
  slackRabMembersHandles,
  slackSigningSecret,
  ftxApiBaseUrl,
  ftxApiKey,
  ftxApiSecret,
  ftxSubaccount,
  kucoinApiBaseUrl,
  kucoinApiKey,
  kucoinApiPassphrase,
  kucoinApiSecret,
} from "./params";
import { createSlackApp, formatRabWalletToRespondArguments } from "../slack";

export const handleslackcommand = onRequest((request, response) => {
  const [app, receiver] = createSlackApp(
    slackSigningSecret.value(),
    slackBotToken.value()
  );

  app.command("/rab-wallet", async ({ ack, command, respond }) => {
    await ack();

    const rabMembers = JSON.parse(slackRabMembersHandles.value());

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

    const response = formatRabWalletToRespondArguments(rabWallet);

    await respond(response);
  });

  receiver.requestHandler(request, response);
});
