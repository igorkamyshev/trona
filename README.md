# trona

This library allows you to write migration scenarios using SQL and run them with a simple CLI.

- **Simple**: only plain SQL
- **Lightweight**: only 5.6 kB in node_modules
- **Modern**: ESM support out of the box

## Usage example

```console
foo@bar:~$ yarn trona

Running evolve script

--- 1.sql ---

CREATE TABLE Customers (
    id   INTEGER     NOT NULL,
    name VARCHAR(32) NOT NULL,
    primary key (id)
);

Evolution is successful!

foo@bar:~$
```

## Installation

First you need to install `trona` via package manager:

```console
yarn add trona
```

## Configuration

Then you need to setup simple configuration file named `.trona-config.js` and containing script that exports async function `runQuery`. The function should be rejected in case of failure of said query and in case of SELECT query successfully executed returns array of selected rows in form of an object `{[field]: value}`.

### PostgreSQL example

```javascript
import PG from 'pg';

const client = new PG.Client({
  // ...
});

await client.connect();
console.log(`Connected to database`);

export function runQuery(query) {
  return client.query(query).then((result) => result.rows);
}
```

### MySQL example

```javascript
import mysql from 'mysql';
import { promisify } from 'util';

const connection = mysql.createConnection({
  // ...
});

const connect = promisify(connection.connect).bind(connection);
const runQuery = promisify(connection.query).bind(connection);

await connect();
console.log(`Connected to database`);

export { runQuery };
```

## Write evolutions

Create a folder `evolutions` for your evolutions script and add your first evolution to it. Note the rules which you should follow writing said evolutions:

1. Name file {evolution-number}.sql (e.g. 1.sql)
2. Write up and fallback scripts in file and separate them via "#DOWN" comment as at the example below

Folder content example:

```
- evolutions
    - 1.sql
    - 2.sql
    - 3.sql
    ...
```

Evolution contents example:

```sql
CREATE TABLE Customers (
    id   INTEGER     NOT NULL,
    name VARCHAR(32) NOT NULL,
    primary key (id)
);

#DOWN

DROP TABLE Customers;
```

Run command

```console
yarn trona
```

This command will create table with information about evolutions, if it doesn't exist. After it will execute all your evolutions.

## Usage

After you managed to successfully setup `trona` you can run `yarn trona` command. This command will automatically detect any changed or new files in your evolutions folder, run respected fallback scripts if needed and than evolve your databae schema (e. g. if you have 1.sql, 2.sql, and 3.sql evolutions already in your database, you have changed 2.sql and added 4.sql it will run fallback for 3.sql and 2.sql and then run 2.sql, 3.sql, and 4.sql scripts)

## Options

### Interactivity

By default evolution script will ask for a confirmation to run a degrade script. You can disable this feature by `-y` or `--no-interactive` flag.

```console
yarn trona -y
```

### Config

You can change path to trona config file by providing `-c` or `--config-path` option (by default trona will try to find config file `.trona-config.js` in a root directory).

```console
yarn trona -c config/.trona-my-config.js
```

### Custom evolutions folder

Custom evolutions folder can be choosen by providing `-d` or `--evolutions-dir` option. By default `evolutions` folder is being used.

```console
yarn trona -d migrations
```

### Check down script

By passing `-k` or `--check-down` option you can activate degrade script validation. Trona will try to execute `up->down->up` script sequence vs. just `up` in common case.

```console
yarn trona -k
```

## Maintenance

### Release flow

1. Bump `version` in [package.json](./package.json)
2. Fill [CHANGELOG.md](./CHANGELOG.md)
3. Commit changes by `git commin -m "Release X.X.X"`
4. Create git tag for release by `git tag -a vX.X.X -m "vX.X.X"`
5. Push changes to remote by `git push --follow-tags`
6. Release package to registry by `yarn clean-publish`
7. Fill release page with changelog on GitHub
