# RAB Slack Bot

<p align="center">
  <img width="400px" height="400px" src="documentation/slack/icon.png" alt="RAB Slack Bot Icon">
</p>

## Creating Slack App

First, you need to create a Slack App on [api.slack.com](https://api.slack.com).

You can find examples of Slack App Manifest to bootstrap your RAB Slack Bot App :
- [Slack App Manifest using HTTP](documentation/slack/http_app_manifest.yml)
- [Slack App Manifest using Socket](documentation/slack/socket_app_manifest.yml)

For a deployed app on web, it can be better to use HTTP. However, that means your app must be called from outside. So you need to use Socket Mode if you plan to develop on local.

Don't forget to install it to your workspace to get a Slack Bot Token.

## Setting environnement variables

You can configure the app through some environnements variables :
- `SLACK_SIGNING_SECRET` (required) Slack App secret signing
- `SLACK_BOT_TOKEN` (required) Slack App Bot token
- `SLACK_SOCKET_MODE` (optionnal, default: `false`) set it to `true` if you want to use Socket Mode
- `SLACK_APP_TOKEN` (optionnal, default: `''`) Slack App token (required for Socket Mode)
- `SLACK_RAB_MEMBERS_HANDLES` (optionnal, default: `"[]"`) JSON array of Slack handles (= users who are allowed to use Slash Commands)
- `SLACK_RAB_CHANNEL` (optionnal, default: `''`) Name of Slack channel (required for frequent reporting)
- `FREQUENT_REPORTING` (optionnal, default: `false`) set it to `true` if you want enable frequent reporting
- `FREQUENT_REPORTING_CRON_TIME` (optionnal, default: `''`) CRON syntax which define frequency of frequent reporting (see [node-cron](https://github.com/node-cron/node-cron#cron-syntax))
- `CRON_TIMEZONE` (optionnal, default: `''`) timezone used by node-cron (e.g. `Europe/Paris`) (see supported timezones [here](https://momentjs.com/timezone/))
- `KUCOIN_API_BASE_URL` (required) KuCoin API Base URL (without /api)
- `KUCOIN_API_KEY` (required) KuCoin API Key
- `KUCOIN_API_SECRET` (required) KuCoin API Secret
- `KUCOIN_API_PASSPHRASE` (required) KuCoin API Passphrase
- `FTX_API_BASE_URL` (required) FTX API Base URL (without /api)
- `FTX_API_KEY` (required) FTX API Key
- `FTX_API_SECRET` (required) FTX API Secret
- `FTX_SUBACCOUNT` (required) FTX Subaccount of RAB

## Start app

For production :

`$ yarn build`

`$ yarn start`

For development :

`$ yarn dev`

## Features

### Slash Commands

These commands are available :
- `/rab-wallet` Show a report of RAB Fund Wallet (only visible by user who typed command)

### Frequent reporting

Frequent reporting post a report of RAB Fund Wallet in channel corresponding to `SLACK_RAB_CHANNEL`. If you have enable that feature, don't forget to add your app to that channel.
