import { readFile } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const { version } = await readFile(
  join(dirname(fileURLToPath(import.meta.url)), '..', 'package.json'),
).then((file) => JSON.parse(file.toString()));

export { version };
