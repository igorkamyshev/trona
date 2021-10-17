import { suite } from 'uvu';
import * as assert from 'uvu/assert';

import { getEvolutions } from '../lib/evolutions.js';
import referenceThree from './test_evolutions_three/reference.js';

const GetEvolutions = suite('GetEvolutions');

GetEvolutions(
  'should return 5 evolutions list and 3 out of scope files',
  async () => {
    const result = await getEvolutions('tests/test_evolutions_three');
    assert.equal(referenceThree, result);
  },
);

GetEvolutions('should throw an exception (execution conflict)', async () => {
  try {
    await getEvolutions('tests/test_evolutions_four');
  } catch (e) {
    assert.equal(
      e.message,
      `Unable to execute. Evolution conflict found for next files:
- 1-abba.sql
- 1-baab.sql
- 1.sql`,
    );
  }
});

GetEvolutions.run();
