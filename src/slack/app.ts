import { env } from 'process';
import { App, AppOptions } from '@slack/bolt';
import { AggregatedExchangeWallet, getAggregatedExchangeWallet } from '../exchanges/aggregator';

const rabMembersSlackHandles: string[] = JSON.parse(env.RAB_MEMBERS_SLACK_HANDLES || '[]');
const userIsGranted = (user: string): boolean => rabMembersSlackHandles.includes(user);

const token: string = env.SLACK_BOT_TOKEN || '';
const signingSecret: string = env.SLACK_SIGNING_SECRET || '';

let appOptions: AppOptions = {
  token,
  signingSecret,
};

const useSocketMode: boolean = env.SLACK_SOCKET_MODE === 'true';
if (useSocketMode) {
  const appToken: string = env.SLACK_APP_TOKEN || '';
  appOptions = {
    ...appOptions,
    socketMode: true,
    appToken,
  };
}

const app: App = new App(appOptions);

app.command('/rab-wallet', async ({ command, ack, respond }) => {
  await ack();

  console.log(command);

  if (userIsGranted(command.user_name)) {
    const aggregatedExchangeWallet: AggregatedExchangeWallet = await getAggregatedExchangeWallet();
    await respond(JSON.stringify(aggregatedExchangeWallet));
  } else {
    await respond('Sorry, only RAB members can access to RAB fund wallet!');
  }
});

const startApp = async (): Promise<void> => {
  console.log('Starting app');

  const port: number = env.PORT ? parseInt(env.PORT, 10) : 3000;
  await app.start(port);

  console.log(`⚡️ Bolt app is running on port ${port}!`);
};

export {
  startApp,
};
