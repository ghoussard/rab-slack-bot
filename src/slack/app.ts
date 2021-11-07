import { env } from 'process';
import {
  App, AppOptions, SectionBlock, RespondArguments,
} from '@slack/bolt';
import {
  AggregatedExchangeWallet, CryptoCurrency, ExchangeWallet, getAggregatedExchangeWallet,
} from '../exchanges/aggregator';

const rabMembersSlackHandles: string[] = JSON.parse(env.RAB_MEMBERS_SLACK_HANDLES || '[]');
const userIsGranted = (user: string): boolean => rabMembersSlackHandles.includes(user);

const getRabWalletResponse = async (): Promise<RespondArguments> => {
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
    const response: RespondArguments = await getRabWalletResponse();
    await respond(response);
  } else {
    await respond('Sorry, only RAB members have access to RAB fund wallet!');
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
