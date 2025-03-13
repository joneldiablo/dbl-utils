#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

/**
 * Reads a directory recursively and returns a list of all files with their relative paths.
 * @param {string} dir - The directory path.
 * @param {string} baseDir - The base directory for relative paths.
 * @returns {string[]} - A list of relative file paths.
 */
const getFilesRecursively = (dir, baseDir) => {
  let results = [];
  const list = fs.readdirSync(dir, { withFileTypes: true });

  list.forEach((file) => {
    const fullPath = path.join(dir, file.name);
    const relativePath = path.relative(baseDir, fullPath);

    if (file.isDirectory()) {
      results = results.concat(getFilesRecursively(fullPath, baseDir));
    } else {
      results.push(relativePath);
    }
  });

  return results;
};

/**
 * Removes the file extension from a path.
 * @param {string} filePath - The file path.
 * @returns {string} - The path without extension.
 */
const removeExtension = (filePath) => {
  return filePath.replace(/\.[^/.]+$/, ''); // Removes last file extension
};

/**
 * Generates the exports and directories fields dynamically based on dist folder structure.
 */
const generateExportsAndDirectories = () => {
  const packagePath = path.join(process.cwd(), 'package.json');
  if (!fs.existsSync(packagePath)) {
    console.error('Error: package.json not found in the current directory.');
    process.exit(1);
  }

  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));

  const srcDir = path.join(process.cwd(), 'src');
  const distDir = path.join(process.cwd(), 'dist');

  if (!fs.existsSync(distDir)) {
    console.error('Error: dist directory not found.');
    process.exit(1);
  }

  const esmDir = path.join(distDir, 'esm');
  const cjsDir = path.join(distDir, 'cjs');
  const typesDir = path.join(distDir, 'types');

  const exportsConfig = {
    '.': {
      import: './dist/esm/index.js',
      require: './dist/cjs/index.js',
      types: './dist/types/index.d.ts',
      source: './src/index.ts'
    },
    './ts/*': {
      types: './dist/types/index.d.ts',
      source: './src'
    },
    './esm/*': './dist/esm/*',
    './cjs/*': './dist/cjs/*'
  };

  const directoriesConfig = {};

  // Ensure directories exist before adding them
  if (fs.existsSync(srcDir)) directoriesConfig.ts = 'src';
  if (fs.existsSync(esmDir)) directoriesConfig.esm = 'dist/esm';
  if (fs.existsSync(cjsDir)) directoriesConfig.cjs = 'dist/cjs';

  // Read the contents of dist/esm and dist/cjs to add dynamic exports
  if (fs.existsSync(esmDir)) {
    const esmFiles = getFilesRecursively(esmDir, esmDir);
    esmFiles.forEach(file => {
      const key = `./esm/${removeExtension(file).replace(/\\/g, '/')}`;
      const value = `./dist/esm/${file.replace(/\\/g, '/')}`;
      exportsConfig[key] = value;
    });
  }

  if (fs.existsSync(cjsDir)) {
    const cjsFiles = getFilesRecursively(cjsDir, cjsDir);
    cjsFiles.forEach(file => {
      const key = `./cjs/${removeExtension(file).replace(/\\/g, '/')}`;
      const value = `./dist/cjs/${file.replace(/\\/g, '/')}`;
      exportsConfig[key] = value;
    });
  }

  packageJson.exports = exportsConfig;
  packageJson.directories = directoriesConfig;

  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
  console.log('✅ package.json updated successfully');
};

generateExportsAndDirectories();
