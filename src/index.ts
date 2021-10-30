import { SocketModeClient } from '@slack/socket-mode';
import { WebClient } from '@slack/web-api';

const appToken: string|undefined = process.env.SLACK_APP_TOKEN;
if (undefined === appToken) {
  throw new Error('You must provide a Slack App Token through SLACK_APP_TOKEN env var');
}

const botToken: string|undefined = process.env.SLACK_BOT_TOKEN;
if (undefined === botToken) {
  throw new Error('You must provide a Slack Bot Token through SLACK_BOT_TOKEN env var');
}

const socketModeClient: SocketModeClient = new SocketModeClient({ appToken });
const webClient: WebClient = new WebClient(botToken);

socketModeClient.on('ready', () => {
  console.info('RAB Slack Bot are connected and ready!');
});

socketModeClient.on('slash_commands', async ({ ack, body }) => {
  await ack();
  console.info(`Command received: ${body.command}`);
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

(async () => {
  try {
    await socketModeClient.start();
  } catch (e: any) {
    console.error(`Error occured when trying to begin socket session: ${e.message}`);
  }
})();
