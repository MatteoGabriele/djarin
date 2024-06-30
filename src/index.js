#!/usr/bin/env node
import fs from "fs-extra";
import inquirer from "inquirer";
import path from "path";
import { fileURLToPath } from "url";
import mustache from "mustache";
import {
  uniqueNamesGenerator,
  adjectives,
  colors,
  animals
} from "unique-names-generator";
import { exec } from "child_process";
import ora from "ora";
import { blue, green } from "colorette";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const installDependencies = (context) => {
  return new Promise((resolve, reject) => {
    exec("pnpm install", { cwd: context }, (error, stdout, stderr) => {
      if (error) {
        console.log("[djarin] Error installing dependencies.");
        return reject(error);
      }

      if (stderr) {
        console.error(`stderr: ${stderr}`);
        return reject(new Error(stderr));
      }

      resolve(stdout);
    });
  });
};

inquirer
  .prompt([
    {
      type: "input",
      name: "name",
      message: "Enter the name of the project",
      default: uniqueNamesGenerator({
        separator: "-",
        dictionaries: [adjectives, colors, animals]
      })
    }
  ])
  .then(async (response) => {
    const folder = process.cwd();
    const fullPath = `${folder}/${response.name}`;

    await fs.copy(path.resolve(__dirname, "templates/default"), fullPath);

    const applyTemplating = [
      "package.json",
      "src/pages/home.tsx",
      "index.html"
    ];

    applyTemplating.forEach(async (templateRelativePath) => {
      const templateFilePath = path.join(fullPath, templateRelativePath);
      const templateFile = await fs.readFile(templateFilePath, "utf-8");

      const rendered = mustache.render(templateFile, {
        project: {
          name: response.name
        }
      });

      const packageJsonPath = path.join(fullPath, templateRelativePath);
      await fs.writeFile(packageJsonPath, rendered);
    });

    const spinner = ora("Installing dependencies").start();

    await installDependencies(fullPath);

    spinner.stop();

    console.log(`
    ${blue("Start working on your project:")}

    ${green("cd")} ${response.name}
    ${green("pnpm")} dev

    ${blue("This is the way!")}
    `);

    process.exit(0);
  });
