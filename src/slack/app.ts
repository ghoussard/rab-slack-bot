import { env } from 'process';
import {
  createServer, IncomingMessage, ServerResponse,
} from 'http';
import {
  App, AppOptions, SectionBlock, RespondArguments,
} from '@slack/bolt';
import { ChatPostMessageArguments } from '@slack/web-api';
import {
  AggregatedExchangeWallet, CryptoCurrency, ExchangeWallet, getAggregatedExchangeWallet,
} from '../exchanges/aggregator';

const rabMembersHandles: string[] = JSON.parse(env.SLACK_RAB_MEMBERS_HANDLES || '[]');
const userIsGranted = (user: string): boolean => rabMembersHandles.includes(user);

const getAggregatedWalletRespondArguments = async (): Promise<RespondArguments> => {
  const {
    fiatValue,
    fiatCurrency,
    exchangeWallets,
  }: AggregatedExchangeWallet = await getAggregatedExchangeWallet();

  const exchangeWalletSectionBlocks: SectionBlock[] = exchangeWallets.map(
    ({ exchange, wallet }: ExchangeWallet) => {
      const cryptoCurrenciesList = wallet.cryptoCurrencies.map(
        ({
          symbol, amount, amountFiatValue,
        }: CryptoCurrency) => `- ${amount} ${symbol} (${amountFiatValue.toFixed(3)} ${fiatCurrency})`,
      ).join('\n');

      return {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*${exchange}*\n${cryptoCurrenciesList}\nTotal : ${wallet.fiatValue.toFixed(3)} ${fiatCurrency}`,
        },
      };
    },
  );

  const headerSectionBlock: SectionBlock = {
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: ':raccoon: :moneybag: *RAB Fund Wallet* :moneybag: :raccoon:',
    },
  };

  const footerSectionBlock: SectionBlock = {
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: `*Total : ${fiatValue.toFixed(3)} ${fiatCurrency}*`,
    },
  };

  return {
    blocks: [
      headerSectionBlock,
      ...exchangeWalletSectionBlocks,
      footerSectionBlock,
    ],
  };
};

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

  if (userIsGranted(command.user_name)) {
    const aggregatedWallet: RespondArguments = await getAggregatedWalletRespondArguments();
    await respond(aggregatedWallet);
  } else {
    await respond('Sorry, only RAB members have access to RAB fund wallet!');
  }
});

const startApp = async (): Promise<void> => {
  console.info(`Starting app with ${useSocketMode ? 'socket' : 'http'}`);

  const port: number = env.PORT ? parseInt(env.PORT, 10) : 3000;

  if (useSocketMode) {
    await app.start();
    createServer((req: IncomingMessage, res: ServerResponse) => {
      res.writeHead(200);
      res.end();
    }).listen(port);
    console.info(`⚡️ Bolt app is running and dummy http server listening on port ${port}!`);
  } else {
    await app.start(port);
    console.info(`⚡️ Bolt app is running on port ${port}!`);
  }
};

const postAggregatedWalletInRabChannel = async (): Promise<void> => {
  const channel: string = env.SLACK_RAB_CHANNEL || '';
  const aggregatedWallet: RespondArguments = await getAggregatedWalletRespondArguments();

  const message: ChatPostMessageArguments = {
    channel,
    text: 'RAB Fund Wallet',
    ...aggregatedWallet,
  };

  await app.client.chat.postMessage(message);
};

export {
  postAggregatedWalletInRabChannel,
  startApp,
};
