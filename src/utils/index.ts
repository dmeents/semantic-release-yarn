import { error, ErrorTypes } from './error';
import semver from 'semver';
import readPackage, { NormalizedPackageJson } from 'read-pkg';
import yaml from 'js-yaml';
import fs from 'fs';

export async function getPackage(cwd: string) {
  let packageJson: NormalizedPackageJson;

  try {
    packageJson = await readPackage({ cwd });
  } catch (err) {
    const { code } = err as { code?: string };
    if (code === 'ENOENT') throw error(ErrorTypes.MISSING_PACKAGE);
    throw new AggregateError([err]);
  }

  if (!packageJson.name) throw error(ErrorTypes.MISSING_PACKAGE_NAME);
  return packageJson;
}

export async function getYarnRc(cwd: string) {
  let yarnRc: Record<string, string>;

  try {
    yarnRc = (await yaml.load(
      fs.readFileSync(`${cwd}/.yarnrc.yml`, 'utf8'),
    )) as Record<string, string>;
  } catch (err) {
    const { code } = err as { code?: string };
    if (code === 'ENOENT') throw error(ErrorTypes.MISSING_YARNRC);
    throw new AggregateError([err]);
  }

  return yarnRc;
}

export function getNpmToken(env: NodeJS.ProcessEnv): string {
  const token = env['NPM_TOKEN'];
  if (typeof token !== 'string') throw error(ErrorTypes.INVALID_NPM_TOKEN);
  return token;
}

export function getNpmAuthIdent(env: NodeJS.ProcessEnv): string {
  const authIdent = env['NPM_AUTH_IDENT'];

  if (typeof authIdent !== 'string') {
    throw error(ErrorTypes.INVALID_NPM_AUTH_IDENT);
  }

  return authIdent;
}

export const getChannel = (channel?: string) => {
  if (!channel) return 'latest';
  return semver.validRange(channel) ? `release-${channel}` : channel;
};
