import { PluginConfig } from './config/plugin';
import { error, ErrorTypes } from './utils/error';
import {
  getChannel,
  getNpmAuthIdent,
  getNpmToken,
  getPackage,
  getYarnRc,
} from './utils';
import { Context, PrepareContext } from './types';
import { Yarn } from './utils/yarn';
import readPkg from 'read-pkg';

let verified = false;
let prepared = false;
let packageJson: readPkg.NormalizedPackageJson;
let yarnrc: Record<string, string> = {};
const yarn = new Yarn();

export async function verifyConditions(
  config: PluginConfig,
  ctx: Context,
): Promise<void> {
  config = PluginConfig.normalize(config);

  ctx.logger.log(`read ${ctx.cwd}/package.json`);
  packageJson = await getPackage(ctx.cwd);

  if (!config.npmPublish) {
    ctx.logger.log('skipping registry configuration since npmPublish is false');
    return;
  }

  const registryFromPackage = packageJson?.publishConfig?.registry as string;
  let registryFromYarnrc = '';

  if (!registryFromPackage) {
    ctx.logger.log(`no registry found in package.json, checking .yarnrc.yml`);
    ctx.logger.log(`read ${ctx.cwd}/.yarnrc.yml`);
    yarnrc = await getYarnRc(ctx.cwd);
    registryFromYarnrc = yarnrc?.npmPublishRegistry;
  }

  if (
    packageJson.private === true ||
    yarnrc.npmPublishAccess === 'restricted'
  ) {
    ctx.logger.log('skipping since registry is private');
    return;
  }

  if (config.useNpmToken == config.useNpmAuthIdent) {
    ctx.logger.log('useNpmToken cannot be same value as useNpmAuthIdent');
    return;
  }

  if (registryFromYarnrc || registryFromPackage) {
    ctx.logger.log(
      `set npmRegistry to ${registryFromYarnrc || registryFromPackage}`,
    );
    await yarn.setNpmRegistryServer(registryFromYarnrc || registryFromPackage);
  } else {
    ctx.logger.log('set npmRegistryServer: "https://registry.npmjs.org"');
    await yarn.setNpmRegistryServer('https://registry.npmjs.org');
  }

  if (config.useNpmToken) {
    ctx.logger.log('set NPM_TOKEN to yarn config npmAuthToken');
    await yarn.setNpmAuthToken(getNpmToken(ctx.env));

    ctx.logger.log('verify npm auth');
    if (!(await yarn.authenticated()))
      throw error(ErrorTypes.INVALID_NPM_TOKEN);
  } else {
    ctx.logger.log('set NPM_AUTH_IDENT to yarn config npmAuthIdent');
    await yarn.setNpmAuthIdent(getNpmAuthIdent(ctx.env));

    ctx.logger.log('verify npm auth');
    if (!(await yarn.authenticated()))
      throw error(ErrorTypes.INVALID_NPM_AUTH_IDENT);
  }

  ctx.logger.log('install version plugin');
  await yarn.pluginImportVersion();

  verified = true;
}

export async function prepare(config: PluginConfig, ctx: PrepareContext) {
  config = PluginConfig.normalize(config);

  if (config.changeVersion) {
    ctx.logger.log(`update to "version": ${ctx.nextRelease.version}`);
    await yarn.version(ctx.nextRelease.version);
  }

  if (!verified) {
    ctx.logger.log('skipping since not verified');
    return;
  }

  ctx.logger.log('get tarball directory');
  const tarballDir = config.tarballDir ?? '.';

  if (typeof tarballDir === 'string') {
    const tarballName = tarballDir + '/package.tgz';
    ctx.logger.log(`creating a tarball: ${tarballName}`);
    await yarn.pack(tarballName);
  }

  ctx.logger.log(`package contents:`);
  const tarballContents = await yarn.packDryRun();

  for (const tarballContent of tarballContents) {
    ctx.logger.log(`  ${tarballContent}`);
  }

  prepared = true;
}

export async function publish(config: PluginConfig, ctx: PrepareContext) {
  if (!verified || !prepared) {
    ctx.logger.log('skipping since not verified or prepared');
    return;
  }

  const { version } = ctx.nextRelease;

  ctx.logger.log(`get channel to publish to`);
  const distTag = getChannel(ctx.nextRelease.channel);

  ctx.logger.log(`publishing ${version} to registry on dist-tag ${distTag}`);
  await yarn.publish(distTag);

  ctx.logger.log(`published ${packageJson.name}@${version} to @${distTag}`);
}
