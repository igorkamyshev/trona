const {
  map,
  forEach,
  reduceRight,
  reduce,
} = require('../../lib/asyncIterators')

const toPromises = collection => collection.map(val => Promise.resolve(val))
describe('asyncIterators', () => {
  it('maps collection', async () => {
    const callbackArgs = []
    const collection = toPromises([1, 2, 3])
    const result = await map(async (promise, i, array) => {
      const val = await promise
      callbackArgs.push([val, i, array])
      return val + i
    }, collection)

    expect(result).toStrictEqual([1, 3, 5])
    expect(callbackArgs).toStrictEqual([
      [1, 0, collection],
      [2, 1, collection],
      [3, 2, collection],
    ])
  })

  it('iterates with forEach collection', async () => {
    const callbackArgs = []
    const collection = toPromises([1, 2, 3])
    await forEach(async (promise, i, array) => {
      const val = await promise
      callbackArgs.push([val, i, array])
      return val + i
    }, collection)

    expect(callbackArgs).toStrictEqual([
      [1, 0, collection],
      [2, 1, collection],
      [3, 2, collection],
    ])
  })

  it('reduces collection', async () => {
    const collection = toPromises(['a', 'b', 'c'])
    const result = await reduce(
      async (carry, val) => carry + (await val),
      '',
      collection,
    )
    expect(result).toBe('abc')
  })

  it('reducesRight collection', async () => {
    const collection = toPromises(['a', 'b', 'c'])
    const result = await reduceRight(
      async (carry, val) => carry + (await val),
      '',
      collection,
    )
    expect(result).toBe('cba')
  })
})
