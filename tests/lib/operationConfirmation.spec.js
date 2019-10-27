const {
  OperationDeclinedError,
  confirmOperation,
} = require('../../lib/operationConfirmation')

describe('lib/operationConfirmation', () => {
  let rawMode,
    resumeCalled,
    pauseCalled,
    onKeyPressCallback,
    offCalled,
    timeoutCallback
  console.log = () => {}
  process.stdin.setRawMode = mode => {
    rawMode = false
  }

  process.stdin.pause = () => {
    resumeCalled = true
  }

  process.stdin.resume = () => {
    pauseCalled = true
  }

  process.stdin.off = (event, callback) => {
    if (event === 'data' && onKeyPressCallback === callback) {
      offCalled = true
    }
  }

  process.stdin.on = (event, callback) => {
    if (event === 'data') {
      onKeyPressCallback = callback
    }
  }

  setTimeout = callback => {
    timeoutCallback = callback
  }

  beforeEach(() => {
    rawMode = false
    resumeCalled = false
    pauseCalled = false
    onKeyPressCallback = null
    timeoutCallback = null
  })

  const pressKey = key => {
    onKeyPressCallback(key)
  }

  it('Confirms operation on Y', () => {
    const confirmation = confirmOperation()
    pressKey('Y')
    expect(confirmation).resolves.toBe()
    expect(rawMode).toBe(false)
    expect(offCalled).toBe(true)
    expect(pauseCalled).toBe(true)
    expect(resumeCalled).toBe(true)
  })

  it('Rejects on N', () => {
    const confirmation = confirmOperation()
    pressKey('N')
    expect(confirmation).rejects.toStrictEqual(
      new OperationDeclinedError('declined'),
    )
    expect(rawMode).toBe(false)
    expect(offCalled).toBe(true)
    expect(pauseCalled).toBe(true)
    expect(resumeCalled).toBe(true)
  })

  it('Rejects on ctl+c', () => {
    const confirmation = confirmOperation()
    pressKey('^C')
    expect(confirmation).rejects.toStrictEqual(
      new OperationDeclinedError('declined'),
    )
    expect(rawMode).toBe(false)
    expect(offCalled).toBe(true)
    expect(pauseCalled).toBe(true)
    expect(resumeCalled).toBe(true)
  })

  it('Rejects on timeout', () => {
    const confirmation = confirmOperation()
    timeoutCallback()
    expect(confirmation).rejects.toStrictEqual(
      new OperationDeclinedError('timeout'),
    )
    expect(rawMode).toBe(false)
    expect(offCalled).toBe(true)
    expect(pauseCalled).toBe(true)
    expect(resumeCalled).toBe(true)
  })
})
