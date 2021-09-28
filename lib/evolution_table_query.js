const initTableQuery = `CREATE TABLE IF NOT EXISTS $EVOLUTIONS (
    id INTEGER NOT NULL,
    checksum VARCHAR(32) NOT NULL,
    down_script TEXT NOT NULL,
    primary key (id)
);`;

const initTableExistsQuery = `SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE  table_schema = 'public'
  AND    table_name   = '$EVOLUTIONS'
);`;

export function createInitTableQuery(tableName) {
  return initTableQuery.replace('$EVOLUTIONS', tableName);
}

export function createInitTableExistsQuery(tableName) {
  return initTableExistsQuery.replace('$EVOLUTIONS', tableName);
}
