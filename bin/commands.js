import { addSnippet, getPackageName, sleep } from "./utils.js";
import path from "node:path";
import fs from "node:fs/promises";
import * as p from "@clack/prompts";
import color from "picocolors";
import { console } from "node:inspector";

const SNIPPETS_DIR = path.join(import.meta.dirname, "../snippets");

const CODE_SNIPPETS_EXT = ".code-snippets";

/**
 * @typedef  {Object} Command
 * @property {string} name - The name of the command
 * @property {string[]} [alias] - An optional alias for the command
 * @property {string} description - The description of the command
 * @property {Function} action - The function to execute when the command is called
 * @property {string} [usage] - The usage of the command
 */

/**
 * @type {Object<string, Command>}
 */
export default {
  add: {
    name: "add",
    description: "Add a new snippet",
    usage: "add <snippet-name>",
    action: async (args = []) => {
      if (args.length === 0) {
        p.log.error("No snippet name provided.");
        p.log.info(
          `Usage: npx ${getPackageName()} ${color.yellow("add <snippet-name>")}`
        );
        console.log();
        process.exit(1);
      }

      const allArgs = [
        ...args,
        ...args
          .filter((arg) => !arg.endsWith(CODE_SNIPPETS_EXT))
          .map((arg) => `${arg}${CODE_SNIPPETS_EXT}`),
      ];

      const snippets = (await fs.readdir(SNIPPETS_DIR)).filter((file) =>
        allArgs.includes(file)
      );

      if (snippets.length === 0) {
        p.log.info("No snippets found.");
        process.exit(0);
      }

      snippets.forEach(async (snippet) => {
        await addSnippet(path.join(SNIPPETS_DIR, snippet));

        p.log.success(`Added snippet: ${color.green(snippet)}`);
        await sleep(1000);
      });

      console.log();
    },
  },
  list: {
    name: "list",
    description: "Lists all snippets for you to pick",
    usage: "list",
    action: async () => {
      const snippets = (await fs.readdir(SNIPPETS_DIR)).filter((file) =>
        file.endsWith(CODE_SNIPPETS_EXT)
      );

      if (snippets.length === 0) {
        p.log.info("No snippets found.");
        process.exit(0);
      }

      p.note(
        `
${color.cyan("Select multiple snippets in a single interface:")}
- Use ${color.yellow("up/down arrows")} to navigate with improved stability
- Press ${color.yellow("Space")} to select/deselect the highlighted item
- Press ${color.yellow("Enter")} when done selecting all items
- Press ${color.yellow("Ctrl+C")} to cancel
  `,
        "Selection instructions"
      );

      const result = await p.multiselect({
        message: "Select snippets to add:",
        options: snippets.map((snippet) => ({
          value: path.join(SNIPPETS_DIR, snippet),
          label: snippet.replace(CODE_SNIPPETS_EXT, ""),
        })),
      });

      if (p.isCancel(result)) {
        p.cancel("Operation cancelled.");
        process.exit(0);
      }

      if (result.length === 0) {
        p.note("No snippets selected", "Empty Selection");
        process.exit(0);
      }

      p.note(
        `You selected ${color.green(result.length)} snippet(s):`,
        "Selection Complete"
      );

      result.forEach(async (snippet) => {
        await addSnippet(snippet);
      });

      p.outro(`Done!`);
    },
  },
  help: {
    name: "help",
    description: "Show help",
    usage: "help",
    alias: ["--help", "-h"],
    action: async () => {},
  },
};
