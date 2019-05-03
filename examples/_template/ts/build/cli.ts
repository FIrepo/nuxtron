import { resolve } from 'path';
import spawn from 'cross-spawn';
import chalk from 'chalk';

export function run() {
  // const { resolve } = require('path');
  // const { spawn } = require('cross-spawn');
  // const chalk = require('chalk');

  const defaultCommand = 'dev';
  const commands = new Set(['build', defaultCommand]);

  let cmd = process.argv[2];
  let args: string[] = [];
  let nodeArgs: string[] = [];

  const inspectArg = process.argv.find(arg => arg.includes('--inspect'));
  if (inspectArg) {
    nodeArgs.push(inspectArg);
  }

  if (new Set(['--help', '-h']).has(cmd)) {
    console.log(chalk`
    {bold.cyan nuxtron} - Build an Electron + Nuxt.js app for speed ⚡

    {bold USAGE}

      {bold $} nuxtron <command>

    {bold AVAILABLE COMMANDS}

      ${Array.from(commands).join(', ')}

    For more information run a command with the --help flag

      {bold $} nuxtron build --help
  `);
    process.exit(0);
  }

  if (commands.has(cmd)) {
    args = process.argv.slice(3);
  } else {
    cmd = defaultCommand;
    args = process.argv.slice(2);
  }

  const defaultEnv = cmd === 'dev' ? 'development' : 'production';
  process.env.NODE_ENV = process.env.NODE_ENV || defaultEnv;

  const cli = resolve(__dirname, `nuxtron-${cmd}`);

  const startProcess = () => {
    const proc = spawn('ts-node', [...nodeArgs, ...[cli], ...args], {
      stdio: 'inherit',
      // customFds: [0, 1, 2],
    });
    proc.on('close', (code: number, signal: string) => {
      if (code !== null) {
        process.exit(code);
      }
      if (signal) {
        if (signal === 'SIGKILL') {
          process.exit(137);
        }
        console.log(`got signal ${signal}, exiting`);
        process.exit(1);
      }
      process.exit(0);
    });
    proc.on('error', (err: Error) => {
      console.error(err);
      process.exit(1);
    });
    return proc;
  };

  const proc = startProcess();

  const wrapper = () => {
    if (proc) {
      proc.kill();
    }
  };
  process.on('SIGINT', wrapper);
  process.on('SIGTERM', wrapper);
  process.on('exit', wrapper);
}