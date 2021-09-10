import kleur from 'kleur';

import { print } from './printer.js';

export class OperationDeclinedError extends Error {}
process.stdin.setEncoding('utf-8');

const MAX_INPUT_TIMEOUT = 30000;

export async function confirmOperation({
  noInteractive,
  question = 'Do you want to continue?',
}) {
  if (noInteractive) {
    return Promise.resolve();
  }

  print(kleur.yellow(question), kleur.yellow('Press Y/N'));

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
}
