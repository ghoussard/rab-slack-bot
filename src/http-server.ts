import { createServer, IncomingMessage, ServerResponse } from 'http';
import { slackClientEventEmitter, SlackClientLifecycleEventName } from './slack-client';

type SlackClientHealthcheckStatus = {
  name: SlackClientLifecycleEventName;
  timestamp: number;
};

type SlackClientHealthcheck = {
  currentStatus: SlackClientHealthcheckStatus | null,
  history: SlackClientHealthcheckStatus[]
};

const getCurrentTimestamp = (): number => Math.floor(Date.now() / 1000);

let slackClientHealthcheck: SlackClientHealthcheck = {
  currentStatus: null,
  history: [],
};

const updateSlackClientHealthcheck = (newStatusName: SlackClientLifecycleEventName): void => {
  const newHistory = slackClientHealthcheck.currentStatus !== null
    ? [...slackClientHealthcheck.history, slackClientHealthcheck.currentStatus] : [];

  slackClientHealthcheck = {
    currentStatus: {
      name: newStatusName,
      timestamp: getCurrentTimestamp(),
    },
    history: newHistory,
  };
};

slackClientEventEmitter.on('lifecycle_event', (lifecycleEventName: SlackClientLifecycleEventName): void => updateSlackClientHealthcheck(lifecycleEventName));

const startHttpServer = async (port: number) => {
  createServer((req: IncomingMessage, res: ServerResponse) => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(slackClientHealthcheck));
  }).listen(port);
  console.info('HTTP server listening on port 3000');
};

export default startHttpServer;
