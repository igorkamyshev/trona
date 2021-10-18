import path from 'path';
import md5 from 'md5';
import { readdir, readFile } from 'fs/promises';

export async function getEvolutions(evolutionsPath) {
  const evolutionFiles = await getEvolutionFiles(evolutionsPath);

  // Conflicts
  const numbers = evolutionFiles.inScope.map((e) => fileNameToNumber(e));
  const conflictNumbers = numbers.filter((el, i) => numbers.indexOf(el) !== i);
  if (conflictNumbers.length > 0) {
    const uniqueConflictNumbers = conflictNumbers.filter(
      (el, i) => conflictNumbers.indexOf(el) === i,
    );
    const conflictFiles = evolutionFiles.inScope
      .filter((el) => uniqueConflictNumbers.includes(fileNameToNumber(el)))
      .map((x) => `- ${x}`)
      .join('\n');
    throw new Error(
      `Unable to execute. Evolution conflict found for next files:\n${conflictFiles}`,
    );
  }

  const evolutions = await Promise.all(
    evolutionFiles.inScope.map((filePath) =>
      readEvolution(evolutionsPath, filePath),
    ),
  );

  return { evolutions, outOfScopeFiles: evolutionFiles.outOfScope };
}

async function getEvolutionFiles(evolutionsPath) {
  const files = await readdir(evolutionsPath);

  const inScope = files
    .filter((fileName) => /^\d+(-[\w,\s]+)*\.sql$/.test(fileName))
    .sort((a, b) => fileNameToNumber(a) - fileNameToNumber(b));
  const outOfScope = files.filter((fileName) => !inScope.includes(fileName));

  return { inScope, outOfScope };
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
  return parseInt(file.match(/^\d+/g)[0], 10);
}
