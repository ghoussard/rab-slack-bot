import { App, RespondArguments, SectionBlock } from "@slack/bolt";
import { RabWallet } from "../../domain/rabWallet";

const createRabWalletSummaryMessage = ({
  exchangeWallets,
  totalFiatValue,
}: RabWallet): RespondArguments => {
  const fiatCurrency = "USD";

  const exchangeWalletSectionBlocks: SectionBlock[] = exchangeWallets.map(
    ({ exchangeName, wallet }) => {
      const cryptoCurrenciesList = wallet.cryptoCurrencies
        .map(
          ({ symbol, amount, amountFiatValue }) =>
            `- ${amount} ${symbol} (${amountFiatValue.toFixed(
              3
            )} ${fiatCurrency})`
        )
        .join("\n");

      return {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*${exchangeName}*\n${cryptoCurrenciesList}\nTotal : ${wallet.totalFiatValue.toFixed(
            3
          )} ${fiatCurrency}`,
        },
      };
    }
  );

  const headerSectionBlock: SectionBlock = {
    type: "section",
    text: {
      type: "mrkdwn",
      text: ":raccoon: :moneybag: *RAB Fund Wallet* :moneybag: :raccoon:",
    },
  };

  const footerSectionBlock: SectionBlock = {
    type: "section",
    text: {
      type: "mrkdwn",
      text: `*Total : ${totalFiatValue.toFixed(3)} ${fiatCurrency}*`,
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

const sendRabWalletSummaryMessageToChannel = async (
  app: App,
  channel: string,
  rabWallet: RabWallet
): Promise<void> => {
  const message = {
    channel,
    text: "RAB Fund Wallet",
    ...createRabWalletSummaryMessage(rabWallet),
  };

  await app.client.chat.postMessage(message);
};

export { createRabWalletSummaryMessage, sendRabWalletSummaryMessageToChannel };
