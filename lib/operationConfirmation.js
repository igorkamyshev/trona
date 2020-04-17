const { Yellow } = require('./colors');

class OperationDeclinedError extends Error {}
process.stdin.setEncoding('utf-8');

const MAX_INPUT_TIMEOUT = 30000;

module.exports = {
  OperationDeclinedError,
  confirmOperation: (questionMessage = 'Do you want to continue?') => {
    console.log('');
    console.log(Yellow, questionMessage);
    console.log(Yellow, 'Press Y/N');
    console.log('');

    process.stdin.setRawMode(true);
    process.stdin.resume();

    return new Promise((resolve, reject) => {
      let timeoutId = 0;
      const removeCallback = (cb) => {
        process.stdin.off('data', cb);
        process.stdin.pause();
        process.stdin.setRawMode(false);
        clearTimeout(timeoutId);
      };

      const callback = (chunk) => {
        if (chunk === '^C') {
          process.exit(1);
        }

        const keypress = chunk.toLowerCase();
        if (['y', 'n'].includes(keypress)) {
          removeCallback(callback);
          if (keypress === 'y') {
            resolve();
          } else {
            reject(new OperationDeclinedError('declined'));
          }
        }
      };

      timeoutId = setTimeout(() => {
        removeCallback(callback);
        reject(new OperationDeclinedError('timout'));
      }, MAX_INPUT_TIMEOUT);

      process.stdin.on('data', callback);
    });
  },
};
