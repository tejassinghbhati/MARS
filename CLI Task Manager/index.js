#!/usr/bin/env node

const { Command } = require('commander');
const chalk = require('chalk');
const Table = require('cli-table3');
const db = require('./db');

const program = new Command();

program
  .name('task')
  .description('A simple CLI task manager')
  .version('1.0.0');

// Add Task Command
program
  .command('add <title>')
  .description('Add a new task')
  .action((title) => {
    try {
      const id = db.addTask(title);
      console.log(chalk.green(`\u2714 Task added successfully with ID: ${id}`));
    } catch (error) {
      console.error(chalk.red('Error adding task:', error.message));
    }
  });

// List Tasks Command
program
  .command('list')
  .description('List all tasks (pending by default)')
  .option('-a, --all', 'List all tasks including completed ones')
  .action((options) => {
    try {
      const tasks = db.listTasks(options.all);

      if (tasks.length === 0) {
        console.log(chalk.yellow('No tasks found.'));
        return;
      }

      const table = new Table({
        head: [chalk.cyan('ID'), chalk.cyan('Status'), chalk.cyan('Title'), chalk.cyan('Created')],
        colWidths: [6, 12, 40, 25]
      });

      tasks.forEach(task => {
        const statusStr = task.status === 'done' ? chalk.green('DONE') : chalk.yellow('PENDING');
        table.push([
          task.id,
          statusStr,
          task.title,
          new Date(task.created_at).toLocaleString()
        ]);
      });

      console.log(table.toString());
    } catch (error) {
      console.error(chalk.red('Error listing tasks:', error.message));
    }
  });

// Complete Task Command
program
  .command('done <id>')
  .description('Mark a task as done')
  .action((idStr) => {
    const id = parseInt(idStr, 10);
    if (isNaN(id)) {
      console.error(chalk.red('Error: Task ID must be a number.'));
      return;
    }

    try {
      const task = db.getTask(id);
      if (!task) {
        console.error(chalk.red(`Error: Task with ID ${id} not found.`));
        return;
      }

      if (task.status === 'done') {
        console.log(chalk.yellow(`Task ${id} is already marked as done.`));
        return;
      }

      const success = db.completeTask(id);
      if (success) {
        console.log(chalk.green(`\u2714 Task ${id} marked as done.`));
      } else {
        console.error(chalk.red(`Error: Could not mark task ${id} as done.`));
      }
    } catch (error) {
      console.error(chalk.red('Error completing task:', error.message));
    }
  });

// Delete Task Command
program
  .command('delete <id>')
  .description('Delete a task')
  .action((idStr) => {
    const id = parseInt(idStr, 10);
    if (isNaN(id)) {
      console.error(chalk.red('Error: Task ID must be a number.'));
      return;
    }

    try {
      const task = db.getTask(id);
      if (!task) {
        console.error(chalk.red(`Error: Task with ID ${id} not found.`));
        return;
      }

      const success = db.deleteTask(id);
      if (success) {
        console.log(chalk.green(`\u2714 Task ${id} deleted successfully.`));
      } else {
        console.error(chalk.red(`Error: Could not delete task ${id}.`));
      }
    } catch (error) {
      console.error(chalk.red('Error deleting task:', error.message));
    }
  });

// Parse commands
program.parse(process.argv);

// If no arguments passed, show help
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
