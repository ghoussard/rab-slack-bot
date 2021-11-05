import { env } from 'process';
import { SocketModeClient } from '@slack/socket-mode';
import { WebClient } from '@slack/web-api';
import {
  slackClientLifecycleEvents,
  SlackClientLifecycleEvent,
  slackClientEventEmitter,
  SLACK_CLIENT_EVENT_EMITTER_LIFECYCLE_EVENT,
} from './slack-client-event-emitter';

const listenLifecycleEvents = (client: SocketModeClient): void => {
  slackClientLifecycleEvents.forEach((event: SlackClientLifecycleEvent): void => {
    client.on(event, (): void => {
      console.info(`Slack client lifecycle event triggered: ${event}`);
      slackClientEventEmitter.emit(SLACK_CLIENT_EVENT_EMITTER_LIFECYCLE_EVENT, event);
    });
  });
};

const startSlackClient = async (): Promise<void> => {
  const appToken: string = env.SLACK_APP_TOKEN || '';
  const socketModeClient: SocketModeClient = new SocketModeClient({ appToken });

  const botToken: string = env.SLACK_BOT_TOKEN || '';
  const webClient: WebClient = new WebClient(botToken);

  listenLifecycleEvents(socketModeClient);

  socketModeClient.on('slash_commands', async ({ ack, body }): Promise<void> => {
    await ack();
    console.info(`Slack slash command received: ${body.command}`);
    try {
      await webClient.chat.postMessage({
        text: ':poken:',
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: ':poken:',
            },
          },
        ],
        channel: body.channel_id,
      });
    } catch (e: any) {
      console.error(`Error occured when trying to reply: ${e.message}`);
    }
  });

  try {
    await socketModeClient.start();
  } catch (e: any) {
    console.error(`Error occured when trying to start slack client: ${e.message}`);
  }
};

export {
  startSlackClient,
};
