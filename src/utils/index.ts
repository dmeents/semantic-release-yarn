import { error, ErrorTypes } from './error';
import semver from 'semver';
import * as path from 'path';
import * as fs from 'fs';
import { PackageResults } from '../types';
import { fileURLToPath } from 'node:url';

const toPath = (urlOrPath: URL | string): string =>
  urlOrPath instanceof URL ? fileURLToPath(urlOrPath) : urlOrPath;

export async function readPackage(cwd: string): Promise<PackageResults> {
  cwd = toPath(cwd) || process.cwd();
  const filePath = path.resolve(cwd, 'package.json');

  return JSON.parse(
    await fs.promises.readFile(filePath, 'utf8'),
  ) as PackageResults;
}

export async function getPackage(cwd: string) {
  let packageJson: PackageResults;

  try {
    packageJson = await readPackage(cwd);
  } catch (err) {
    const { code } = err as { code?: string };
    if (code === 'ENOENT') throw error(ErrorTypes.MISSING_PACKAGE);
    throw new AggregateError([err]);
  }

  if (!packageJson.name) throw error(ErrorTypes.MISSING_PACKAGE_NAME);
  return packageJson;
}

export function getNpmToken(env: NodeJS.ProcessEnv): string {
  const token = env['NPM_TOKEN'];
  if (typeof token !== 'string') throw error(ErrorTypes.INVALID_NPM_TOKEN);
  return token;
}

export const getChannel = (channel: string) => {
  if (!channel) return 'latest';
  return semver.validRange(channel) ? `release-${channel}` : channel;
};
