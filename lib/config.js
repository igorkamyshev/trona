import path from 'path';

export async function getConfig() {
  const { runQuery } = await loadConfig();

  validateConfig({ runQuery });

  const tableName = 'evolutions';

  const evolutionsPath = path.join(process.cwd(), 'evolutions');

  return { tableName, runQuery, evolutionsPath };
}

async function loadConfig() {
  const config = await import(path.join(process.cwd(), '.trona-config.js'));

  return config;
}

function validateConfig({ runQuery }) {
  if (typeof runQuery !== 'function') {
    throw new TypeError('Invalid config: runQuery should be a function');
  }
}
