# trona

Often your migration scenarios are as good as ORM you using. Sometimes it leads to inability (without some extra efforts) to use all features of your chosen DB. This library allows you to write migration scenarios using sql and run them with a single console command.

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

## Installation and configuration

First you need to install `trona` via package manager:

```console
yarn add trona
```

Than you need to setup simple configuration file named .trona-config.js and containing script that
exports object containing fields:
| field | type | description |
| ---------------------- | ---------- | ----------- |
| `runQuery` | MANDATORY | which is rejected in case of failure of said query and in case of SELECT query successfully executed contains array of selected rows in form of an object `{[field]: value}` |

Example of a config for mysql database:

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

Than create a folder with for your evolutions script and add your first evolution to it. Note the
rules which you should follow writing said evolutions:

1. Name file {evolution-number}.sql (e.g. 1.sql)
2. Write up and fallback scripts in file and separate them via "#DOWN" comment as at the
   example below

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
yarn evolutions
```

This command will create table with information about evolutions, if it isn't exist. After it execute all your evolutions.

## Usage

After you managed to successfully setup @solid-soda/evolutions you can run `yarn evolutions` command.
This command will automatically detect any changed or new files in your evolutions folder, run
respected fallback scripts if needed and than evolve your databae schema (e. g. if you have 1.sql,
2.sql, and 3.sql evolutions already in your database, you have changed 2.sql and added 4.sql it will
run fallback for 3.sql and 2.sql and than run 2.sql, 3.sql, and 4.sql scripts)

### Interactivity

By default evolution script will ask for a confirmation to run a degrade script.
But you can disable this feature by `-y` or `--no-interactive` flag.

```console
yarn evolutions -y
```
