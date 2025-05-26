#!/usr/bin/env node

import * as p from "@clack/prompts";
import color from "picocolors";
import process from "node:process";
import commands from "./commands.js";
import { getPackageName, getVersion, sleep } from "./utils.js";

async function showHelp() {
  p.log.message(color.bold("Available commands:"));
  for (const command of Object.values(commands)) {
    p.log.info(
      `${color.cyanBright(
        color.bold(command.name) +
          (command.alias
            ? ` or ${color.italic(command.alias.join(" | "))}`
            : "")
      )} - ${command.description}${
        command.usage
          ? color.italic(`\nUsage: npx ${getPackageName()} ${command.usage}`)
          : ""
      }`
    );
  }
  console.log();
}

function getCommand(commandKey) {
  const command =
    commands[commandKey] ||
    Object.values(commands).find(
      (cmd) => cmd.alias && cmd.alias.includes(commandKey)
    );

  if (command && command.name === "help") {
    command.action = async () => {
      await showHelp();
    };
  }
  return command;
}

async function main() {
  console.clear();

  await sleep(1000);

  p.intro(
    [
      color.bgCyan(color.black(` ${getPackageName()} `)),
      color.bgWhite(color.black(` v${getVersion()} `)),
    ].join("")
  );

  const args = process.argv.slice(2);

  if (args.length === 0) {
    await showHelp();
    return;
  }

  const [key, ...rest] = args;

  const command = getCommand(key);

  if (!command) {
    console.log();

    p.log.error(`Command "${key}" not found.`);

    return;
  }

  await command.action(rest);
}

main().catch(console.log);
