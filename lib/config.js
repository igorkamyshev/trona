import path from 'path';

export async function getConfig({ configPath, evolutionsDirPath }) {
  const { runQuery } = await loadConfig(configPath);

  validateConfig({ runQuery });

  const tableName = 'evolutions';

  const evolutionsPath = path.join(
    process.cwd(),
    evolutionsDirPath ?? 'evolutions',
  );

  return { tableName, runQuery, evolutionsPath };
}

async function loadConfig(configPath) {
  const config = await import(
    path.join(process.cwd(), configPath ?? '.trona-config.js')
  );

  return config;
}

function validateConfig({ runQuery }) {
  if (typeof runQuery !== 'function') {
    throw new TypeError('Invalid config: runQuery should be a function');
  }
}
