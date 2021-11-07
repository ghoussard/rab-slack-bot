import { env } from 'process';
import { App } from '@slack/bolt';

const token: string = env.SLACK_BOT_TOKEN || '';
const signingSecret: string = env.SLACK_SIGNING_SECRET || '';

const app: App = new App({
  token,
  signingSecret,
});

const startApp = async () => {
  const port: number = env.PORT ? parseInt(env.PORT, 10) : 3000;

  await app.start(port);

  console.log(`⚡️ Bolt app is running on port ${port}!`);
};

export {
  startApp,
};
