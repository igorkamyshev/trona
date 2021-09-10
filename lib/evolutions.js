import path from 'path';
import md5 from 'md5';
import { readdir, readFile } from 'fs/promises';

export async function getEvolutions(evolutionsPath) {
  const evolutionFiles = await getEvolutionFiles(evolutionsPath);
  const evolutions = await Promise.all(
    evolutionFiles.map((filePath) => readEvolution(evolutionsPath, filePath)),
  );

  return evolutions;
}

async function getEvolutionFiles(evolutionsPath) {
  const files = await readdir(evolutionsPath);

  return files
    .filter((fileName) => /^\d+\.sql$/.test(fileName))
    .sort((a, b) => fileNameToNumber(a) - fileNameToNumber(b));
}

async function readEvolution(evolutionsPath, filePath) {
  const data = await readFile(path.join(evolutionsPath, filePath), 'utf-8');

  return {
    data,
    file: filePath,
    checksum: md5(data),
    id: fileNameToNumber(filePath),
  };
}

function fileNameToNumber(file) {
  return parseInt(file.split('.').shift(), 10);
}
