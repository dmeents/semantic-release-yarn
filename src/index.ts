import { PluginConfig } from './config/plugin';
import { Yarn } from './utils/yarn';
import { error, ErrorTypes } from './utils/error';
import { getChannel, getNpmToken, getPackage } from './utils';
import { Context, PrepareContext } from './types';

let verified = false;
let prepared = false;
const yarn = new Yarn();

export async function verifyConditions(
  config: PluginConfig,
  ctx: Context,
): Promise<void> {
  config = PluginConfig.normalize(config);

  ctx.logger.log(`read ${ctx.cwd}/package.json`);
  const packageJson = await getPackage(ctx.cwd);
  const registry = packageJson?.publishConfig?.registry;

  if (packageJson.private === true) {
    ctx.logger.log('skipping since package is private');
    return;
  }

  if (config.npmPublish === false) {
    ctx.logger.log('skipping since npmPublish is false');
    return;
  }

  if (registry) {
    ctx.logger.log(`set npmRegistry to ${registry}`);
    await yarn.setNpmRegistryServer(registry);
  } else {
    ctx.logger.log('set npmRegistryServer: "https://registry.npmjs.org"');
    await yarn.setNpmRegistryServer('https://registry.npmjs.org');
  }

  ctx.logger.log('set NPM_TOKEN to yarn config npmAuthToken');
  await yarn.setNpmAuthToken(getNpmToken(ctx.env));

  ctx.logger.log('verify npm auth');
  if (!(await yarn.authenticated())) throw error(ErrorTypes.INVALID_NPM_TOKEN);

  ctx.logger.log('install version plugin');
  await yarn.pluginImportVersion();

  verified = true;
}

export async function prepare(config: PluginConfig, ctx: PrepareContext) {
  ctx.logger.log(`read ${ctx.cwd}/package.json`);
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
  config = PluginConfig.normalize(config);

  if (!verified || !prepared) {
    ctx.logger.log('skipping since not verified or prepared');
    return;
  }

  ctx.logger.log(`read ${ctx.cwd}/package.json`);
  const packageJson = await getPackage(ctx.cwd);
  const { version } = ctx.nextRelease;

  ctx.logger.log(`get channel to publish to`);
  const distTag = getChannel(ctx.nextRelease.channel);

  ctx.logger.log(`publishing ${version} to registry on dist-tag ${distTag}`);
  await yarn.publish(distTag);

  ctx.logger.log(`published ${packageJson.name}@${version} to @${distTag}`);
}
