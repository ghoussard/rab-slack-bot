import { defineString } from "firebase-functions/params";

const slackBotToken = defineString("SLACK_BOT_TOKEN");
const slackRabChannel = defineString("SLACK_RAB_CHANNEL");
const slackRabMemberHandles = defineString("SLACK_RAB_MEMBER_HANDLES", {
  default: "[]",
});
const slackSigningSecret = defineString("SLACK_SIGNING_SECRET");

const ftxApiBaseUrl = defineString("FTX_API_BASE_URL");
const ftxApiKey = defineString("FTX_API_KEY");
const ftxApiSecret = defineString("FTX_API_SECRET");
const ftxSubaccount = defineString("FTX_SUBACCOUNT");

const kucoinApiBaseUrl = defineString("KUCOIN_API_BASE_URL");
const kucoinApiKey = defineString("KUCOIN_API_KEY");
const kucoinApiSecret = defineString("KUCOIN_API_SECRET");
const kucoinApiPassphrase = defineString("KUCOIN_API_PASSPHRASE");

export {
  slackBotToken,
  slackRabChannel,
  slackRabMemberHandles,
  slackSigningSecret,
  ftxApiBaseUrl,
  ftxApiKey,
  ftxApiSecret,
  ftxSubaccount,
  kucoinApiBaseUrl,
  kucoinApiKey,
  kucoinApiPassphrase,
  kucoinApiSecret,
};
