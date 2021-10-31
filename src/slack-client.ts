import { SocketModeClient } from '@slack/socket-mode';
import { WebClient } from '@slack/web-api';
import { EventEmitter } from 'events';

const CONNECTING_SLACK_CLIENT_LIFECYCLE_EVENT_NAME = 'connecting';
const CONNECTED_SLACK_CLIENT_LIFECYCLE_EVENT_NAME = 'connected';
const AUTHENTICATED_SLACK_CLIENT_LIFECYCLE_EVENT_NAME = 'authenticated';
const READY_SLACK_CLIENT_LIFECYCLE_EVENT_NAME = 'ready';
const DISCONNECTING_SLACK_CLIENT_LIFECYCLE_EVENT_NAME = 'disconnecting';
const RECONNECTING_SLACK_CLIENT_LIFECYCLE_EVENT_NAME = 'reconnecting';
const DISCONNECTED_SLACK_CLIENT_LIFECYCLE_EVENT_NAME = 'disconnected';

const slackClientLifecycleEventNames = [
  CONNECTING_SLACK_CLIENT_LIFECYCLE_EVENT_NAME,
  CONNECTED_SLACK_CLIENT_LIFECYCLE_EVENT_NAME,
  AUTHENTICATED_SLACK_CLIENT_LIFECYCLE_EVENT_NAME,
  READY_SLACK_CLIENT_LIFECYCLE_EVENT_NAME,
  DISCONNECTING_SLACK_CLIENT_LIFECYCLE_EVENT_NAME,
  RECONNECTING_SLACK_CLIENT_LIFECYCLE_EVENT_NAME,
  DISCONNECTED_SLACK_CLIENT_LIFECYCLE_EVENT_NAME,
] as const;

type SlackClientLifecycleEventName = typeof slackClientLifecycleEventNames[number];

class SlackClientEventEmitter extends EventEmitter {}

const slackClientEventEmitter: SlackClientEventEmitter = new SlackClientEventEmitter();

const listenLifecycleEvents = (client: SocketModeClient): void => {
  slackClientLifecycleEventNames.forEach((eventName: SlackClientLifecycleEventName): void => {
    client.on(eventName, (): void => {
      console.info(`Slack client lifecycle event triggered: ${eventName}`);
      slackClientEventEmitter.emit('lifecycle_event', eventName);
    });
  });
};

const startSlackClient = async (appToken: string, botToken: string): Promise<void> => {
  const socketModeClient: SocketModeClient = new SocketModeClient({ appToken });
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

  await socketModeClient.start();
};

export {
  slackClientEventEmitter,
  startSlackClient,
};

export type {
  SlackClientLifecycleEventName,
};
