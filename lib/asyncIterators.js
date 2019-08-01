module.exports = {
  forEach: async (callback, array) => {
    for (let i = 0; i < array.length; i++) {
      await callback(array[i], i, array)
    }
  },

  map: (callback, array) => {
    const result = []
    for (let i = 0; i < array.length; i++) {
      result.push(callback(array[i], i, array))
    }

    return Promise.all(result)
  },

  reduce: async (callback, carry, array) => {
    let result = carry
    for (let i = 0; i < array.length; i++) {
      result = await callback(result, array[i], i, array)
    }

    return result
  },

  reduceRight: async (callback, carry, array) => {
    let result = carry
    for (let i = array.length - 1; i >= 0; i--) {
      result = await callback(result, array[i], i, array)
    }

    return result
  },
}
