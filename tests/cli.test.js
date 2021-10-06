import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { execSync } from 'child_process';

import { runQuery, cleanDb } from './test.trona_config.js';

const CLI = suite('CLI');

CLI.after.each(cleanDb);

CLI('should create evolutions table', async () => {
  execSync(
    'node bin.js -c tests/test.trona_config.js -d tests/test_evolutions_one',
  );

  const tables = await runQuery(
    "SELECT name FROM sqlite_master WHERE type ='table' AND name='evolutions';",
  );

  assert.is(tables.length, 1);
});

CLI('should apply first evolution', async () => {
  execSync(
    'node bin.js -c tests/test.trona_config.js -d tests/test_evolutions_one',
  );

  const evolutions = await runQuery('SELECT * FROM evolutions;');

  assert.is(evolutions.length, 1);
  assert.is(evolutions[0].id, 1);
});

CLI('should downgrade first evolution and apply second', async () => {
  execSync(
    'node bin.js -c tests/test.trona_config.js -d tests/test_evolutions_one -y',
  );

  const evolutionsOld = await runQuery('SELECT * FROM evolutions;');

  execSync(
    'node bin.js -c tests/test.trona_config.js -d tests/test_evolutions_two -y',
  );

  const evolutionsNew = await runQuery('SELECT * FROM evolutions;');

  assert.is(evolutionsNew.length, 2);
  assert.is(evolutionsNew[0].id, 1);
  assert.is(evolutionsNew[1].id, 2);

  assert.is.not(evolutionsOld[0].checksum, evolutionsNew[0].checksum);
});

CLI.run();
