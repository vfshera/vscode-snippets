import path from "node:path";
import process from "node:process";
import { setTimeout } from "node:timers/promises";
import fs from "node:fs/promises";
import { constants as fsConstants } from "node:fs";
import * as p from "@clack/prompts";
import pkg from "../package.json" with { type: "json" };

export const getVersion = () => {
  return pkg.version;
};

export const getPackageName = () => {
  return pkg.name;
};

export const sleep = async (ms) => setTimeout(ms);
 
export async function addSnippet(snippetPath) {
   
    const destinationDir = path.join(process.cwd(), ".vscode");
 
     try {
    await fs.access(destinationDir, fsConstants.F_OK);
  } catch {
    await fs.mkdir(destinationDir, { recursive: true });
  }

    try {
    await fs.access(snippetPath, fsConstants.F_OK);
  } catch {
    p.cancel("Snippet file not found");
    process.exit(0);
  }

    const snippetName = path.basename(snippetPath);
    const destinationPath = path.join(destinationDir, snippetName);
    
    try{

        await fs.copyFile(snippetPath, destinationPath);
     
    } catch (error) { 
        p.log.error(`Error adding snippet`);
        process.exit(1);
    }
}