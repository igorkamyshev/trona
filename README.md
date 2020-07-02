# @solid-soda/evolutions

[![Scripts sets up by @solid-soda/scripts v2.1.0](https://img.shields.io/static/v1?label=@solid-soda/scripts&message=2.1.0&color=75ddf4)](https://github.com/solid-soda/scripts)

Often your migration scenarios are as good as ORM you using. Sometimes it leads to inability (without some extra efforts) to use all features of your chosen DB. This library allows you to write migration scenarios using sql and run them with a single console command.

## Usage example

```console
foo@bar:~$ evolutions --init
Initializing evolutions table evolutions
...
Evolutions table successfully created!

foo@bar:~$ evolutions
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

First you need to install `@solid-soda/evolutions` via package manager:

```console
yarn add @solid-soda/evolutions
```

Or if you prefer `npm`:

```console
npm install @solid-soda/evolutions
```

Than you need to setup simple configuration file named .trona-config.js and containing script that
exports object containing fields:
| field | type | description |
| ---------------------- | ---------- | ----------- |
| `runQuery` | MANDATORY | which is rejected in case of failure of said query and in case of SELECT query successfully executed contains array of selected rows in form of an object `{[field]: value}` |
| `tableName` | OPTIONALLY | name of tha table that would contain information about evolutions, it would be created automatically by init script, default - "evolutions" |
| `evolutionsFolderPath` | OPTIONALLY |relative path to folder that contains .sql files of migration scripts if form of a `string` or `string[]`, default - "evolutions". |

Example of a config for mysql database:

```javascript
const mysql = require('mysql');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '123',
  database: 'playground',
});

connection.connect((err) => {
  if (err) throw err;
  console.log('Connected!');
});

module.exports = {
  evolutionsFolderPath: ['db', 'evolutions'],
  tableName: 'my_evolutions',
  runQuery(query) {
    return new Promise((resolve, reject) => {
      connection.query(query, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  },
};
```

After module have been installed run command and .trona-config.js created run

```console
yarn evolutions --init
```

This command will create table with information about evolutions.
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
