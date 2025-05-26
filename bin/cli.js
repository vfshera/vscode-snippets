#!/usr/bin/env node

import path from "node:path";
const SNIPPETS_DIR = path.join(import.meta.dirname, "../snippets");

console.log(
  `Welcome to the CLI! The snippets directory is located at: ${SNIPPETS_DIR}`
);
