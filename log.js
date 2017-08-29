const chalk = require('chalk');

module.exports = {
  info(...args) {
    console.log(chalk.white(...args)); // eslint-disable-line no-console
  },
  error(...args) {
    console.error(chalk.red(...args)); // eslint-disable-line no-console
  },
};
