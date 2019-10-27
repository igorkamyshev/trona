const { getFiles, getFileContent } = require('../../lib/fs')
const fs = require('fs')

describe('lib/fs', () => {
  it('gets files', async () => {
    fs.readdir = (path, callback) => {
      if (path === 'path') {
        callback(null, ['file1.txt', '..'])
      }
    }

    const files = await getFiles('path')
    expect(files).toStrictEqual(['file1.txt', '..'])
  })

  it('rejects if files get failed', () => {
    fs.readdir = (path, callback) => {
      if (path === 'path') {
        callback('some error', ['file1.txt', '..'])
      }
    }

    expect(getFiles('path')).rejects.toEqual('some error')
  })

  it('gets file content', async () => {
    fs.readFile = (file, encoding, callback) => {
      if (file === 'file.txt' && encoding === 'utf8') {
        callback(null, 'this is my file')
      }
    }

    const data = await getFileContent('file.txt')
    expect(data).toBe('this is my file')
  })

  it('rejects if files content get failed', () => {
    fs.readFile = (file, encoding, callback) => {
      if (file === 'file.txt' && encoding === 'utf8') {
        callback('some error', 'this is my file')
      }
    }

    const data = getFileContent('file.txt')
    expect(data).rejects.toBe('some error')
  })
})
