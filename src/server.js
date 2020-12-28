import http from 'http';
import WebSocket from 'ws';
import { execute, subscribe } from 'graphql';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import chalk from 'chalk';

import apolloServer, { schema } from '~/core/graphql';
import mongoose from '~/core/mongoose';
import sequelize from '~/core/sequelize';
import redis from '~/core/redis';

import { PORT, HOST } from './env';
import app from './app';

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const teal500 = chalk.hex('#009688');

apolloServer.installSubscriptionHandlers(server);

server.listen(Number(PORT), HOST, () => {
  console.log(teal500('🚀  App: Bootstrap Succeeded'));
  console.log(teal500(`🚀  Host: http://${HOST}:${PORT}`));
  console.log(teal500(`🚀  GraphQL: http://${HOST}:${PORT}${apolloServer.graphqlPath}`));

  mongoose.connection
    .once('open', () => console.log(teal500('🚀  MongoDB: Connection Succeeded')))
    .on('error', err => console.error(err));

  sequelize
    .authenticate()
    .then(() => console.log(teal500('🚀  PostgreSQL: Connection Succeeded')))
    .catch(err => console.error(err));

  redis.on('connect', () => {
    console.log(teal500('🚀  Redis: Connection Succeeded'));
  });
});

wss.on('connection', () => {
  console.log(teal500('🚀  WebSocket: Connection Succeeded'));
});

SubscriptionServer.create(
  {
    execute,
    subscribe,
    schema,
    onConnect() {
      console.log(teal500('🚀  GraphQL Subscriptions: Connection Succeeded'));
    },
  },
  { server, path: '/graphql' },
);
