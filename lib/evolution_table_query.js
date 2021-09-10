const initTableQuery = `CREATE TABLE IF NOT EXISTS $EVOLUTIONS (
    id INTEGER NOT NULL,
    checksum VARCHAR(32) NOT NULL,
    down_script TEXT NOT NULL,
    primary key (id)
);`;

export function createInitTableQuery(tableName) {
  return initTableQuery.replace('$EVOLUTIONS', tableName);
}
