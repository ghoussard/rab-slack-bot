import { App, ExpressReceiver, RespondArguments } from "@slack/bolt";

const createSlackApp = (
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

const sendMessageToChannel = (
  app: App
): ((
  channel: string,
  text: string,
  args: RespondArguments
) => Promise<void>) => {
  return async (channel: string, text: string, args: RespondArguments) => {
    const message = {
      channel,
      text,
      ...args,
    };

    await app.client.chat.postMessage(message);
  };
};

export { createSlackApp, sendMessageToChannel };
