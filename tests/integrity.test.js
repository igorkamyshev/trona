import { suite } from 'uvu';
import * as assert from 'uvu/assert';

import {
  findInconsistentEvolutionId,
  getInconsistentEvolutions,
} from '../lib/integrity.js';

const GetInconsistentEvolutions = suite('getInconsistentEvolutions');

GetInconsistentEvolutions('should return empty array for larger id', () =>
  assert.equal(getInconsistentEvolutions([{ id: 12 }], 13), []),
);

GetInconsistentEvolutions('should return full array for smaller id', () =>
  assert.equal(getInconsistentEvolutions([{ id: 12 }], 11), [{ id: 12 }]),
);

GetInconsistentEvolutions('should return half of array for median id', () =>
  assert.equal(getInconsistentEvolutions([{ id: 12 }, { id: 14 }], 13), [
    { id: 14 },
  ]),
);

GetInconsistentEvolutions.run();

const FindInconsistentEvolutionId = suite('findInconsistentEvolutionId');

FindInconsistentEvolutionId(
  'should return null for consistent evolutions',
  () => {
    const set = [
      { id: 1, checksum: '1' },
      { id: 2, checksum: '2' },
    ];

    assert.equal(
      findInconsistentEvolutionId({ oldEvolutions: set, newEvolutions: set }),
      null,
    );
  },
);

FindInconsistentEvolutionId(
  'should return first id for completly iconsistent evolutions',
  () => {
    const newSet = [
      { id: 1, checksum: '1' },
      { id: 2, checksum: '2' },
    ];

    const oldSet = [{ id: 1, checksum: 'WRONG' }];

    assert.equal(
      findInconsistentEvolutionId({
        oldEvolutions: newSet,
        newEvolutions: oldSet,
      }),
      1,
    );
  },
);

FindInconsistentEvolutionId(
  'should return second id for partialy iconsistent evolutions',
  () => {
    const newSet = [
      { id: 1, checksum: '1' },
      { id: 2, checksum: '2' },
    ];

    const oldSet = [
      { id: 1, checksum: '1' },
      { id: 2, checksum: 'WRONG' },
    ];

    assert.equal(
      findInconsistentEvolutionId({
        oldEvolutions: newSet,
        newEvolutions: oldSet,
      }),
      2,
    );
  },
);

FindInconsistentEvolutionId.run();
