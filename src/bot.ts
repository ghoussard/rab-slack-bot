import { startHttpServer } from './http-server';
import { startSlackClient } from './slack/slack-client';

(async () => {
  await startHttpServer();
  await startSlackClient();
})();
