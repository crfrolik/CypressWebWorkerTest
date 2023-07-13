const webWorkerScript = `
let socket;

function toArgs(event, args) {
  const value = {};
  for (const key of args) {
    value[key] = event[key];
  }
  return value;
}

function create(url) {
  socket = new WebSocket(url);
  socket.onclose = event => postMessage({type: 'onclose', event: toArgs(event, [])});
  socket.onmessage = event => postMessage({type: 'onmessage', event: toArgs(event, ['data'])});
  socket.onopen = event => postMessage({type: 'onopen', event: toArgs(event, [])});
}

addEventListener('message', ({ data }) => {
  switch (data.type) {
    case 'open':
      create(data.url);
      break;
    case 'close':
      socket.close();
      break;
    case 'send':
      socket.send(data.data);
      break;
  }
});
`;

export class WebSocketProxy {
  constructor(url, workerURL) {
    this.worker = new Worker(workerURL);
    this.worker.onmessage = ({ data }) => {
      switch (data.type) {
        case 'onclose':
          this.onclose?.(data.event);
          this.worker.terminate();
          break;
        case 'onopen':
          this.onopen?.(data.event);
          break;
        case 'onmessage':
          this.onmessage?.(data.event);
          break;
        case 'onerror':
          this.onerror?.(data.event);
          break;
      }
    };
    this.worker.postMessage({type: 'open', url});
  }

  close() {
    this.worker.postMessage({type: 'close'});
  }

  onclose(_ev) { /* no-op */ }
  onmessage(_e) { /* no-op */ }
  onopen(_ev) { /* no-op */ }
  onerror(_ev) { /* no-op */ }

  send(data) {
    this.worker.postMessage({type: 'send', data});
  }
}

describe('websocket in webworker', () => {
  let proxy;

  beforeEach(() => {
    cy.visit('http://localhost:3000').then(() => {
      const blob = new Blob([webWorkerScript], {type: 'application/javascript'});
      const workerURL = URL.createObjectURL(blob);
      cy.wrap(new Promise((accept, reject) => {
        proxy = new WebSocketProxy('ws://localhost:3000/api', workerURL);
        proxy.onopen = accept;
        proxy.onerror = reject;
      }));
    });
  });
  it('passes', () => {
    cy.log('ok');
  })
})
