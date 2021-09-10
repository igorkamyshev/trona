export function getInconsistentEvolutions(
  evolutions,
  firstInconsistentEvolutionId,
) {
  return evolutions.filter(({ id }) => id >= firstInconsistentEvolutionId);
}

export function findInconsistentEvolutionId({ newEvolutions, oldEvolutions }) {
  const filesChecksumMap = {};
  const evolutionsChecksumMap = {};
  let firstInvalidEvolution = Number.MAX_SAFE_INTEGER;

  const evolutionIdsSet = new Set();
  newEvolutions.forEach(({ id, checksum }) => {
    filesChecksumMap[id] = checksum;
    evolutionIdsSet.add(id);
  });
  oldEvolutions.forEach(({ checksum, id }) => {
    evolutionsChecksumMap[id] = checksum;
    evolutionIdsSet.add(id);
  });

  const evolutionIds = Array.from(evolutionIdsSet).sort((a, b) => a - b);
  evolutionIds.forEach((id) => {
    if (
      id < firstInvalidEvolution &&
      (!filesChecksumMap[id] ||
        !evolutionsChecksumMap[id] ||
        filesChecksumMap[id] !== evolutionsChecksumMap[id])
    ) {
      firstInvalidEvolution = id;
    }
  });

  if (firstInvalidEvolution === Number.MAX_SAFE_INTEGER) {
    return null;
  }

  return firstInvalidEvolution;
}
