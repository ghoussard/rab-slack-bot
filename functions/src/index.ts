import { onRequest } from "firebase-functions/v2/https";
import { logger } from "firebase-functions/v2";
import { defineString } from "firebase-functions/params";
import { App, ExpressReceiver } from "@slack/bolt";

const signingSecret = defineString("SLACK_SIGNING_SECRET");
const botToken = defineString("SLACK_BOT_TOKEN");

export const handleslackcommand = onRequest((request, response) => {
  logger.info("Slack event received");

  const receiver = new ExpressReceiver({
    endpoints: "/slack/events",
    signingSecret: signingSecret.value(),
  });

  const app = new App({
    receiver,
    token: botToken.value(),
    signingSecret: signingSecret.value(),
  });

  app.command("/rab-wallet", async ({ ack, respond }) => {
    await ack();

    await respond("RAB Wallet is not available for now! :(");
  });

  receiver.requestHandler(request, response);
});
