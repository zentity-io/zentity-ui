// Executed by "yarn dev"
// Passes command-line arguments to concurrently.
//   https://github.com/kimmobrunfeldt/concurrently/issues/33#issuecomment-433084589

const concurrently = require('concurrently');
const args = process.argv.slice(2).join(' ');

concurrently(
  [
    { command: 'yarn build-watch' },
    { command: 'yarn start-watch -- ' + args }
  ],
  {
    killOthers: ['failure', 'success']
  }
);
