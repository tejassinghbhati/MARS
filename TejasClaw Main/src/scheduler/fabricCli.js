#!/usr/bin/env node
'use strict';

/**
 * Job CLI for the Reactive Execution Fabric (invoked as: mars jobs …)
 */

const path = require('path');
const pkgRoot = path.join(__dirname, '..', '..');
try {
  process.chdir(pkgRoot);
} catch (_) {}
require('dotenv').config({ path: path.join(pkgRoot, '.env') });

const { program } = require('commander');
const chalk = require('chalk');
const jobStore = require('./jobStore');
const { listProbes } = require('./probeLoader');

function fmtDate(ts) {
  if (!ts) return chalk.gray('—');
  return new Date(ts).toLocaleString('en-IN', { timeZone: process.env.TZ || 'Asia/Kolkata' });
}

function fmtBool(v) {
  return v ? chalk.green('✔ enabled') : chalk.red('✘ disabled');
}

function printJobRow(job) {
  console.log(`
${chalk.bold.cyan('Job:')}       ${job.name}
${chalk.bold('ID:')}        ${chalk.gray(job.id)}
${chalk.bold('Status:')}    ${fmtBool(job.enabled)}
${chalk.bold('Cron:')}      ${chalk.yellow(job.cron_expr)}
${chalk.bold('Condition:')} ${job.condition || 'always'}
${chalk.bold('Platform:')}  ${chalk.magenta(job.target)}${job.target_id ? chalk.gray(` → ${job.target_id}`) : ''}
${chalk.bold('Prompt:')}    ${job.prompt.slice(0, 80)}${job.prompt.length > 80 ? '…' : ''}
${chalk.bold('Created:')}   ${fmtDate(job.created_at)}
${'─'.repeat(60)}`);
}

program.name('mars jobs').description('Manage scheduled Reactive Fabric jobs');

program
  .command('schedule')
  .description('Create a new scheduled job')
  .requiredOption('-n, --name <name>', 'Human-readable job name')
  .requiredOption('-c, --cron <expr>', 'Cron expression (e.g. "0 8 * * *")')
  .requiredOption('-p, --prompt <prompt>', 'Natural language prompt for the agent')
  .option('-d, --description <desc>', 'Optional description')
  .option('--condition <cond>', 'always | probe:<name> | memory:<key> | time:<HH:MM>', 'always')
  .option('--platform <platform>', 'console | discord | telegram', process.env.NOTIFY_PLATFORM || 'console')
  .option('--target-id <id>', 'Channel/chat ID override')
  .action((opts) => {
    const id = jobStore.createJob({
      name:        opts.name,
      description: opts.description,
      cron_expr:   opts.cron,
      condition:   opts.condition,
      prompt:      opts.prompt,
      target:      opts.platform,
      target_id:   opts.targetId || null,
    });

    console.log(chalk.green(`\n✅ Job created.`));
    console.log(`   ${chalk.bold('ID:')} ${chalk.gray(id)}`);
    console.log(chalk.dim(`\n   Activate with: ${chalk.white('mars fabric')}\n`));
  });

program
  .command('list')
  .description('List all scheduled jobs')
  .option('--enabled-only', 'Show only enabled jobs')
  .action((opts) => {
    const jobs = opts.enabledOnly
      ? jobStore.listJobs().filter((j) => j.enabled === 1)
      : jobStore.listJobs();

    if (jobs.length === 0) {
      console.log(chalk.yellow('\nNo jobs. Try: mars jobs schedule --help\n'));
      return;
    }

    console.log(chalk.bold.cyan(`\n${'═'.repeat(60)}`));
    console.log(chalk.bold.cyan(`  Jobs (${jobs.length})`));
    console.log(chalk.bold.cyan(`${'═'.repeat(60)}`));
    jobs.forEach(printJobRow);
  });

program
  .command('remove <id>')
  .description('Delete a job and its run history')
  .action((id) => {
    const job = jobStore.getJob(id);
    if (!job) {
      console.error(chalk.red(`\n❌ Job not found: ${id}\n`));
      process.exit(1);
    }
    jobStore.deleteJob(id);
    console.log(chalk.green(`\n✅ Deleted "${job.name}" [${id}].\n`));
  });

program
  .command('enable <id>')
  .description('Enable a disabled job')
  .action((id) => {
    jobStore.enableJob(id);
    console.log(chalk.green(`\n✅ Enabled [${id}]. In a running fabric: mars jobs reload\n`));
  });

program
  .command('disable <id>')
  .description('Disable a job')
  .action((id) => {
    jobStore.disableJob(id);
    console.log(chalk.yellow(`\n⏸  Disabled [${id}].\n`));
  });

program
  .command('run <id>')
  .description('Fire a job immediately')
  .action(async (id) => {
    const job = jobStore.getJob(id);
    if (!job) {
      console.error(chalk.red(`\n❌ Job not found: ${id}\n`));
      process.exit(1);
    }

    console.log(chalk.cyan(`\n🔥 Triggering "${job.name}"…\n`));
    const scheduler = require('./scheduler');
    await scheduler.triggerNow(id);
    console.log(chalk.green(`\n✅ Done. History: mars jobs history ${id}\n`));
    process.exit(0);
  });

program
  .command('history <id>')
  .description('Show run history for a job')
  .option('-l, --limit <n>', 'Max runs', '10')
  .action((id, opts) => {
    const job = jobStore.getJob(id);
    if (!job) {
      console.error(chalk.red(`\n❌ Job not found: ${id}\n`));
      process.exit(1);
    }

    const runs = jobStore.getRunHistory(id, parseInt(opts.limit, 10));

    console.log(chalk.bold.cyan(`\n${'═'.repeat(60)}`));
    console.log(chalk.bold.cyan(`  History — "${job.name}" (${runs.length})`));
    console.log(chalk.bold.cyan(`${'═'.repeat(60)}\n`));

    if (runs.length === 0) {
      console.log(chalk.yellow('  No runs yet.\n'));
      return;
    }

    for (const run of runs) {
      const status = run.error
        ? chalk.red('✘ error')
        : run.delivered
          ? chalk.green('✔ delivered')
          : chalk.yellow('⚠ skipped');

      console.log(`${chalk.bold(fmtDate(run.fired_at))}  ${status}`);
      console.log(`  Condition: ${run.condition_result || '—'}`);
      if (run.agent_response) {
        const preview = run.agent_response.slice(0, 120);
        console.log(`  Response:  ${chalk.gray(preview)}${run.agent_response.length > 120 ? '…' : ''}`);
      }
      if (run.error) console.log(`  ${chalk.red('Error:')} ${run.error}`);
      console.log();
    }
  });

program
  .command('reload')
  .description('Hot-reload jobs in a running fabric process')
  .action(() => {
    console.log(chalk.cyan('\n♻️  Reloading jobs in-process…\n'));
    const scheduler = require('./scheduler');
    scheduler.reloadJobs();
    console.log(chalk.green('✅ Reload complete.\n'));
    process.exit(0);
  });

program
  .command('probes')
  .description('List probe modules')
  .action(() => {
    const probes = listProbes();
    console.log(chalk.bold.cyan(`\n${'═'.repeat(60)}`));
    console.log(chalk.bold.cyan(`  Probes (${probes.length})`));
    console.log(chalk.bold.cyan(`${'═'.repeat(60)}\n`));

    if (probes.length === 0) {
      console.log(chalk.yellow('  No probes.\n'));
      return;
    }

    for (const p of probes) {
      console.log(`  ${chalk.bold.green(p.name)}`);
      console.log(`  ${chalk.gray(p.description || '')}`);
      console.log(`  ${chalk.yellow(`--condition "probe:${p.name}"`)}\n`);
    }
  });

program
  .command('stats')
  .description('Job and run statistics')
  .action(() => {
    const counts = jobStore.countJobs();
    const recent = jobStore.getAllRunHistory(5);

    console.log(chalk.bold.cyan(`\n${'═'.repeat(60)}`));
    console.log(chalk.bold.cyan('  Statistics'));
    console.log(chalk.bold.cyan(`${'═'.repeat(60)}\n`));

    console.log(`  ${chalk.bold('Jobs total:')}    ${counts.total}`);
    console.log(`  ${chalk.bold('Enabled:')}      ${chalk.green(counts.enabled)}`);
    console.log(`  ${chalk.bold('Disabled:')}     ${chalk.red(counts.disabled)}`);

    console.log(`\n  ${chalk.bold('Recent runs:')}`);
    if (recent.length === 0) {
      console.log(chalk.gray('  (none)'));
    } else {
      for (const r of recent) {
        const job = jobStore.getJob(r.job_id);
        const name = job ? job.name : chalk.gray('[deleted]');
        const status = r.error ? chalk.red('error') : r.delivered ? chalk.green('ok') : chalk.yellow('skipped');
        console.log(`  ${fmtDate(r.fired_at)}  ${name}  ${status}`);
      }
    }
    console.log();
  });

program.parse(process.argv);
