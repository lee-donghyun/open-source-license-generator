#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

try {
  const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));

  const licensesHtml = generateLicensesHtml(packageJson);

  fs.writeFileSync("licenses.html", licensesHtml, "utf8");

  console.log("licenses.html generated successfully.");
} catch (error) {
  console.error("Error reading or parsing package.json:", error.message);
}

function generateLicensesHtml(packageJson) {
  const licenses = [];

  if (packageJson.dependencies) {
    licenses.push(
      "<h2>Dependencies</h2>",
      generateLicenseList(packageJson.dependencies)
    );
  }

  if (packageJson.devDependencies) {
    licenses.push(
      "<h2>Dev Dependencies</h2>",
      generateLicenseList(packageJson.devDependencies)
    );
  }

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Package Licenses</title>
    </head>
    <body>
      <h1>Package Licenses</h1>
      ${licenses.join("\n")}
    </body>
    </html>
  `;
}

function findLicenseFile(packagePath) {
  const licenseFileNames = ["LICENSE", "LICENSE.txt", "LICENSE.md"];

  for (const fileName of licenseFileNames) {
    const filePath = path.join(packagePath, fileName);
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, "utf8");
    }
  }

  return null;
}

function generateLicenseList(dependencies) {
  const projectRoot = process.cwd();
  const licenseItems = [];

  for (const packageName in dependencies) {
    const packagePath = path.join(projectRoot, "node_modules", packageName);
    const licenseContent = findLicenseFile(packagePath);

    if (licenseContent) {
      const escapedLicenseContent = escapeHtml(licenseContent);
      licenseItems.push(
        `<h3>${packageName}</h3><pre>${escapedLicenseContent}</pre>`
      );
    } else {
      licenseItems.push(`<h3>${packageName}</h3><p>License file not found</p>`);
    }
  }

  return licenseItems.join("\n");
}

function escapeHtml(text) {
  return text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
