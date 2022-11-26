import { error, ErrorTypes } from './error';
import semver from 'semver';
import { ReadPackageResults } from '../types';

export async function getPackage(cwd: string) {
  const { readPackage } = await import('read-pkg');
  let packageJson: ReadPackageResults;

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

export function getNpmToken(env: NodeJS.ProcessEnv): string {
  const token = env['NPM_TOKEN'];
  if (typeof token !== 'string') throw error(ErrorTypes.INVALID_NPM_TOKEN);
  return token;
}

export const getChannel = (channel: string) => {
  if (!channel) return 'latest';
  return semver.validRange(channel) ? `release-${channel}` : channel;
};
