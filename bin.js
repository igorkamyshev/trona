#!/usr/bin/env node
import sade from 'sade';
import kleur from 'kleur';

import { version } from './lib/current_version.js';
import { getConfig } from './lib/config.js';
import { print } from './lib/printer.js';
import { createInitTableQuery } from './lib/evolution_table_query.js';
import { getEvolutions } from './lib/evolutions.js';
import {
  findInconsistentEvolutionId,
  getInconsistentEvolutions,
} from './lib/integrity.js';
import { confirmOperation } from './lib/intractivity.js';

sade('trona', true)
  .version(version)
  .describe('Apply evolutions to database')
  .option('-y, --no-interactive', 'Skip interactive questions', false)
  .option('-s, --silent', 'Minimize logs output', false)
  .option('-c, --config-path', 'Custom path to config', null)
  .option('-d, --evolutions-dir', 'Custom evolutions directory', null)
  .action(
    async ({
      y: noInteractive,
      s: silent,
      c: configPath,
      d: evolutionsDirPath,
    }) => {
      try {
        const { tableName, runQuery, evolutionsPath } = await getConfig({
          configPath,
          evolutionsDirPath,
        });

        try {
          const modifiedQuery = createInitTableQuery(tableName);

          if (!silent)
            print(
              kleur.yellow(`Evolution's table '${tableName}' init started`),
            );

          await runQuery(modifiedQuery);

          if (!silent) print(kleur.green('Evolutions table is OK'));
        } catch (error) {
          print(
            kleur.red('An error occured during initialization:'),
            kleur.red(error.message),
          );

          throw error;
        }

        const evolutions = await getEvolutions(evolutionsPath);

        const executedEvolutionInfo = await runQuery(
          `SELECT id, checksum, down_script FROM ${tableName} ORDER BY id ASC;`,
        );

        const firstInconsistentEvolutionId = findInconsistentEvolutionId({
          newEvolutions: evolutions,
          oldEvolutions: executedEvolutionInfo,
        });

        if (firstInconsistentEvolutionId == null) {
          if (!silent)
            print(
              kleur.green('All your database evolutions already consistent'),
            );
          process.exit(0);
        }

        if (!silent)
          print(
            kleur.yellow(
              `Your first inconsistent evolution is ${firstInconsistentEvolutionId}.sql`,
            ),
          );

        const evolutionsToDegrade = getInconsistentEvolutions(
          executedEvolutionInfo,
          firstInconsistentEvolutionId,
        );

        if (evolutionsToDegrade.length !== 0 && !silent) {
          print(
            kleur.yellow(
              `There are ${evolutionsToDegrade.length} inconsistent evolutions`,
            ),
          );
        }

        for (const { down_script: downScript, id } of evolutionsToDegrade) {
          print(kleur.yellow(`--- ${id}.sql ---`), kleur.yellow(downScript));

          await confirmOperation({
            question: 'Do you wish to run this degrade script?',
            noInteractive,
          });

          await runQuery(downScript);
          await runQuery(`DELETE FROM ${tableName} WHERE id = ${id};`);
        }

        const evolutionsToExecute = getInconsistentEvolutions(
          evolutions,
          firstInconsistentEvolutionId,
        );

        if (evolutionsToExecute.length !== 0 && !silent) {
          print(kleur.blue('Running evolve scripts'));
        }

        for (const { data, id, checksum } of evolutionsToExecute) {
          const [upScript, downScript] = data.split('#DOWN');

          if (!silent)
            print(kleur.blue(`--- ${id}.sql ---`), kleur.blue(upScript));

          await runQuery(upScript);

          await runQuery(
            `INSERT INTO ${tableName} (id, checksum, down_script) VALUES (${id}, '${checksum}', ${
              downScript ? `'${downScript.replace(/'/g, "''").trim()}'` : 'NULL'
            });`,
          );
        }

        if (!silent) print(kleur.green('Evolution is successful!'));

        process.exit(0);
      } catch (error) {
        print(kleur.red('Fatal error:'), kleur.red(error.message));
        process.exit(1);
      }
    },
  )
  .parse(process.argv);
