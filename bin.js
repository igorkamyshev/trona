#!/usr/bin/env node
import sade from 'sade';
import kleur from 'kleur';

import { version } from './lib/current_version.js';
import { getConfig } from './lib/config.js';
import { print } from './lib/printer.js';
import {
  createInitTableExistsQuery,
  createInitTableQuery,
} from './lib/evolution_table_query.js';
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
  .option('-c, --config-path', 'Custom path to config', null)
  .option('-d, --evolutions-dir', 'Custom evolutions directory', null)
  .action(async ({ y: noInteractive, c: configPath, d: evolutionsDirPath }) => {
    try {
      const { tableName, runQuery, evolutionsPath } = await getConfig({
        configPath,
        evolutionsDirPath,
      });

      try {
        const modifiedExistsQuery = createInitTableExistsQuery(tableName);
        const modifiedInitQuery = createInitTableQuery(tableName);

        const initTableIsExists = await runQuery(modifiedExistsQuery);

        if (initTableIsExists[0].exists) {
          print(kleur.green(`Evolution's table '${tableName}' found`));
        } else {
          print(
            kleur.yellow(`Evolution's table '${tableName}' init started`),
            kleur.yellow(modifiedInitQuery),
          );

          await runQuery(modifiedInitQuery);

          print(kleur.green('Evolutions table created'));
        }
      } catch (error) {
        print(
          kleur.red('An error occured during initialization:'),
          kleur.red(error.message),
        );

        throw error;
      }

      const evolutions = await getEvolutions(evolutionsPath);

      const executedEvolutionInfo = await runQuery(
        `SELECT id, file, checksum, down_script FROM ${tableName} ORDER BY id ASC;`,
      );

      const firstInconsistentEvolutionId = findInconsistentEvolutionId({
        newEvolutions: evolutions,
        oldEvolutions: executedEvolutionInfo,
      });

      if (firstInconsistentEvolutionId == null) {
        print(kleur.green('All your database evolutions already consistent'));
        process.exit(0);
      }

      const firstInconsistentEvolutionFileName = evolutions.find(
        (a) => a.id === firstInconsistentEvolutionId,
      ).file;

      print(
        kleur.yellow(
          `Your first inconsistent evolution is ${firstInconsistentEvolutionFileName}`,
        ),
      );

      const evolutionsToDegrade = getInconsistentEvolutions(
        executedEvolutionInfo,
        firstInconsistentEvolutionId,
      );

      if (evolutionsToDegrade.length !== 0) {
        print(
          kleur.yellow(
            `There are ${evolutionsToDegrade.length} inconsistent evolutions`,
          ),
        );
      }

      for (const { down_script: downScript, id, file } of evolutionsToDegrade) {
        print(kleur.yellow(`--- ${file} ---`), kleur.yellow(downScript));

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

      if (evolutionsToExecute.length !== 0) {
        print(kleur.blue('Running evolve scripts'));
      }

      for (const { data, id, file, checksum } of evolutionsToExecute) {
        const [upScript, downScript] = data.split('#DOWN');

        print(kleur.blue(`--- ${file} ---`), kleur.blue(upScript));

        await runQuery(upScript);

        await runQuery(
          `INSERT INTO ${tableName} (id, file, checksum, down_script) VALUES (${id}, '${file}', '${checksum}', ${
            downScript ? `'${downScript.replace(/'/g, "''").trim()}'` : 'NULL'
          });`,
        );
      }

      print(kleur.green('Evolution is successful!'));

      process.exit(0);
    } catch (error) {
      print(kleur.red('Fatal error:'), kleur.red(error.message));
      process.exit(1);
    }
  })
  .parse(process.argv);
