import { NormalizedPackageJson, readPackage } from 'read-pkg';
import { error, ErrorTypes } from './error';
import semver from 'semver';

export async function getPackage(cwd: string) {
  let pkg: NormalizedPackageJson;

  try {
    pkg = await readPackage({ cwd });
  } catch (err) {
    const { code } = err as { code?: string };
    if (code === 'ENOENT') throw error(ErrorTypes.MISSING_PACKAGE);
    throw new AggregateError([err]);
  }

  if (!pkg.name) throw error(ErrorTypes.MISSING_PACKAGE_NAME);
  return pkg;
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
