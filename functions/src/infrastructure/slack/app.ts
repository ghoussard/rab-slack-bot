import { App, ExpressReceiver } from "@slack/bolt";

const setUpApp = (
  signingSecret: string,
  botToken: string,
  endpoints = "/slack/events"
): [App, ExpressReceiver] => {
  const receiver = new ExpressReceiver({
    endpoints,
    signingSecret,
  });

  const app = new App({
    receiver,
    token: botToken,
    signingSecret,
  });

  return [app, receiver];
};

export { setUpApp };