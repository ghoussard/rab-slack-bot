import { exit, env } from 'process';
import startHttpServer from './http-server';
import { startSlackClient } from './slack-client';

const slackAppToken: string | undefined = env.SLACK_APP_TOKEN;
if (undefined === slackAppToken) {
  console.error('Error: You must provide a Slack App Token through SLACK_APP_TOKEN env var');
  exit(1);
}

const botToken: string | undefined = env.SLACK_BOT_TOKEN;
if (undefined === botToken) {
  console.error('Error: You must provide a Slack Bot Token through SLACK_BOT_TOKEN env var');
  exit(1);
}

const httpServerPort: number = env.PORT !== undefined ? parseInt(env.PORT, 10) : 3000;

(async () => {
  await startHttpServer(httpServerPort);
  await startSlackClient(slackAppToken, botToken);
})();
