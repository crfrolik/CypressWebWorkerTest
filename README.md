# Reproduction

1. `yarn install` or `npm install`
2. `node start-server`
3. In a different terminal, run the tests (via `cypress open` or `cypress run`); the tests will fail
4. Downgrade to cypress 12.14
5. Run the tests again; the tests will pass

# start-server.js

This runs a simple HTTP + WebSocket server on port 3000. The server is extremely minimal.

# Details

Our tests run a Web Worker via:

```javascript
const blob = new Blob([webWorkerScript], {type: 'application/javascript'});
const workerURL = URL.createObjectURL(blob);
```

(We run a WebSocket inside that worker, but I do not believe that is relevant to this issue. I have
preserved that in this replication, just in case it *is* relevant. However, a lot of irrelevant details
about our specific system have been stripped out.)

Note that the web worker runs *in the tests*, not *in the application under test*.

Prior to cypress 12.15 this worked fine.
In cypress 12.15 or later, it does not work.

Note that there is an error in the console log that may be illluminating:

> spec.cy.js:36 Refused to create a worker from 'blob:http://localhost:3000/164681fb-cb4d-414b-8d35-2821c8805feb' because it violates the following Content Security Policy directive: "script-src 'unsafe-eval'". Note that 'worker-src' was not explicitly set, so 'script-src' is used as a fallback.

Our assumption is that the changes made related to https://github.com/cypress-io/cypress/issues/1030 are what caused this.

Note that we have tried using the `experimentalCspAllowList` option and that has not addressed the issue, e.g.:

```
  "experimentalCspAllowList": ['script-src-elem', 'script-src', 'default-src', 'form-action', 'child-src', 'frame-src']
```
