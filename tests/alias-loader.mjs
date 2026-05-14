import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const projectRoot = process.cwd();

function resolveAlias(specifier) {
  if (!specifier.startsWith('@/')) {
    return null;
  }

  const basePath = path.join(projectRoot, 'src', specifier.slice(2));
  const candidates = [
    basePath,
    `${basePath}.ts`,
    `${basePath}.tsx`,
    `${basePath}.js`,
    `${basePath}.mjs`,
    path.join(basePath, 'index.ts'),
    path.join(basePath, 'index.tsx'),
    path.join(basePath, 'index.js'),
    path.join(basePath, 'index.mjs'),
  ];

  const resolved = candidates.find((candidate) => {
    if (!fs.existsSync(candidate)) {
      return false;
    }
    return fs.statSync(candidate).isFile();
  });
  return resolved ? pathToFileURL(resolved).href : null;
}

export async function resolve(specifier, context, defaultResolve) {
  const alias = resolveAlias(specifier);
  if (alias) {
    return {
      shortCircuit: true,
      url: alias,
    };
  }

  return defaultResolve(specifier, context, defaultResolve);
}
