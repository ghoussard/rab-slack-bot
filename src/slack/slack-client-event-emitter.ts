import { EventEmitter } from 'events';

const CONNECTING_SLACK_CLIENT_LIFECYCLE_EVENT = 'connecting';
const CONNECTED_SLACK_CLIENT_LIFECYCLE_EVENT = 'connected';
const AUTHENTICATED_SLACK_CLIENT_LIFECYCLE_EVENT = 'authenticated';
const READY_SLACK_CLIENT_LIFECYCLE_EVENT = 'ready';
const DISCONNECTING_SLACK_CLIENT_LIFECYCLE_EVENT = 'disconnecting';
const RECONNECTING_SLACK_CLIENT_LIFECYCLE_EVENT = 'reconnecting';
const DISCONNECTED_SLACK_CLIENT_LIFECYCLE_EVENT = 'disconnected';

const slackClientLifecycleEvents = [
  CONNECTING_SLACK_CLIENT_LIFECYCLE_EVENT,
  CONNECTED_SLACK_CLIENT_LIFECYCLE_EVENT,
  AUTHENTICATED_SLACK_CLIENT_LIFECYCLE_EVENT,
  READY_SLACK_CLIENT_LIFECYCLE_EVENT,
  DISCONNECTING_SLACK_CLIENT_LIFECYCLE_EVENT,
  RECONNECTING_SLACK_CLIENT_LIFECYCLE_EVENT,
  DISCONNECTED_SLACK_CLIENT_LIFECYCLE_EVENT,
] as const;

type SlackClientLifecycleEvent = typeof slackClientLifecycleEvents[number];

class SlackClientEventEmitter extends EventEmitter {}

const slackClientEventEmitter: SlackClientEventEmitter = new SlackClientEventEmitter();

const SLACK_CLIENT_EVENT_EMITTER_LIFECYCLE_EVENT = 'lifecycle_event';

export type {
  SlackClientLifecycleEvent,
};

export {
  slackClientLifecycleEvents,
  slackClientEventEmitter,
  SLACK_CLIENT_EVENT_EMITTER_LIFECYCLE_EVENT,
};
