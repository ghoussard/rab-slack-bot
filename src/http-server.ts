import { createServer, IncomingMessage, ServerResponse } from 'http';
import { env } from 'process';
import { SlackClientLifecycleEvent, slackClientEventEmitter, SLACK_CLIENT_EVENT_EMITTER_LIFECYCLE_EVENT } from './slack/slack-client-event-emitter';

type SlackClientHealthcheckStatus = {
  name: SlackClientLifecycleEvent;
  timestamp: number;
};

type SlackClientHealthcheck = {
  currentStatus: SlackClientHealthcheckStatus | null,
  history: SlackClientHealthcheckStatus[]
};

let slackClientHealthcheck: SlackClientHealthcheck = {
  currentStatus: null,
  history: [],
};

const updateSlackClientHealthcheck = (newStatusName: SlackClientLifecycleEvent): void => {
  const newHistory = slackClientHealthcheck.currentStatus !== null
    ? [...slackClientHealthcheck.history, slackClientHealthcheck.currentStatus] : [];

  slackClientHealthcheck = {
    currentStatus: {
      name: newStatusName,
      timestamp: (new Date()).getTime(),
    },
    history: newHistory,
  };
};

slackClientEventEmitter.on(SLACK_CLIENT_EVENT_EMITTER_LIFECYCLE_EVENT, (lifecycleEvent: SlackClientLifecycleEvent): void => updateSlackClientHealthcheck(lifecycleEvent));

const startHttpServer = async () => {
  const port: number = env.PORT !== undefined ? parseInt(env.PORT, 10) : 3000;
  createServer((req: IncomingMessage, res: ServerResponse) => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(slackClientHealthcheck));
  }).listen(port);
  console.info(`HTTP server listening on port ${port}`);
};

export {
  startHttpServer,
};
