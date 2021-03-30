import { isServer } from './utils';

const createReactotronClient = () => {
  if (isServer) {
    const WebSocket = require('ws');
    const { createClient } = require('reactotron-core-client');

    // setup a reactotron client
    const serverClient = createClient({
      // injected in for compatibility
      createSocket: (path) => {
        const key = `__Reactotron_Client__${path}`;
        const oldSocket = global[key];
        if (oldSocket) {
          oldSocket.close();
        }
        const socket = new WebSocket(path);
        socket.onerror = function (event) {
          console.error('Reactotron WebSocket error observed:', event);
        };
        global[key] = socket;
        return socket;
      },
      host: 'localhost',
      port: 9090,
      name: 'Server',
      client: {
        platform: 'nodejs',
      },

      // fires when we get connected to a server
      onConnect: () => {
        // console.log('hi')
      },

      // fires when we get disconnected from the server
      onDisconnect: () => {
        // console.log('bye')
      },

      // fires when the server is telling us something
      onCommand: ({ type, payload }) => {
        // console.log(`I just received a ${type} command`);
        // console.log(payload);
      },
    });

    return serverClient;
  } else {
    const Reactotron = require('reactotron-react-js').default;
    return Reactotron.configure();
  }
};

const { reactotronRedux } = require('reactotron-redux');
const sagaPlugin = require('reactotron-redux-saga');

const reactotron = createReactotronClient()
  .use(reactotronRedux())
  .use(sagaPlugin())
  .connect();

export default reactotron;
