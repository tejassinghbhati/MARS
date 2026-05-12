#!/usr/bin/env node
'use strict';

const path = require('path');

const root = path.join(__dirname, '..');
process.chdir(root);
require('dotenv').config({ path: path.join(root, '.env') });

const { Command } = require('commander');
const program = new Command();

program
  .name('mars')
  .description(
    'MARS — Modular Agent Runtime System (agent, bots, fabric, tasks, extensions).\n' +
    'Scheduled jobs: mars jobs list | mars jobs schedule --help'
  )
  .version('1.0.0');

program
  .command('chat')
  .description('Interactive terminal chat with Claude + tools + memory')
  .action(() => {
    require('../src/entries/chat.js')();
  });

program
  .command('bot')
  .description('Start Discord + Telegram adapters (/ping, /echo, /ask …)')
  .action(() => {
    require('../src/messaging/startBot.js')();
  });

program
  .command('fabric')
  .description('Start Reactive Execution Fabric (cron jobs + notifier)')
  .action(() => {
    require('../src/entries/fabric.js')();
  });

program
  .command('extensions')
  .alias('ext')
  .description('Hot-reload skills from ./skills')
  .action(() => {
    require('../src/entries/extensions.js')();
  });

if (process.argv[2] === 'jobs') {
  process.argv = [process.argv[0], path.join(root, 'src', 'scheduler', 'fabricCli.js'), ...process.argv.slice(3)];
  require(path.join(root, 'src', 'scheduler', 'fabricCli.js'));
} else {
  const chalk = require('chalk');
  const Table = require('cli-table3');
  const db = require('../src/tasks/db');

  const task = program.command('task').description('Local SQLite task list');

  task
    .command('add <title>')
    .description('Add a task')
    .action((title) => {
      try {
        const id = db.addTask(title);
        console.log(chalk.green(`✔ Task added with ID: ${id}`));
      } catch (e) {
        console.error(chalk.red(e.message));
        process.exit(1);
      }
    });

  task
    .command('list')
    .description('List tasks')
    .option('-a, --all', 'Include completed')
    .action((opts) => {
      try {
        const tasks = db.listTasks(opts.all);
        if (tasks.length === 0) {
          console.log(chalk.yellow('No tasks.'));
          return;
        }
        const table = new Table({
          head: [chalk.cyan('ID'), chalk.cyan('Status'), chalk.cyan('Title'), chalk.cyan('Created')],
          colWidths: [6, 12, 40, 22],
        });
        tasks.forEach((t) => {
          const statusStr = t.status === 'done' ? chalk.green('DONE') : chalk.yellow('PENDING');
          table.push([t.id, statusStr, t.title, new Date(t.created_at).toLocaleString()]);
        });
        console.log(table.toString());
      } catch (e) {
        console.error(chalk.red(e.message));
        process.exit(1);
      }
    });

  task
    .command('done <id>')
    .description('Mark task done')
    .action((idStr) => {
      const id = parseInt(idStr, 10);
      if (Number.isNaN(id)) {
        console.error(chalk.red('ID must be a number'));
        process.exit(1);
      }
      if (!db.getTask(id)) {
        console.error(chalk.red(`No task ${id}`));
        process.exit(1);
      }
      db.completeTask(id);
      console.log(chalk.green(`✔ Task ${id} done.`));
    });

  task
    .command('delete <id>')
    .description('Delete a task')
    .action((idStr) => {
      const id = parseInt(idStr, 10);
      if (Number.isNaN(id)) {
        console.error(chalk.red('ID must be a number'));
        process.exit(1);
      }
      if (!db.getTask(id)) {
        console.error(chalk.red(`No task ${id}`));
        process.exit(1);
      }
      db.deleteTask(id);
      console.log(chalk.green(`✔ Task ${id} deleted.`));
    });

  if (process.argv.length <= 2) {
    program.outputHelp();
    process.exit(0);
  }

  program.parse(process.argv);
}
