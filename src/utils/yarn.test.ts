/* eslint-disable jest/no-commented-out-tests */
import * as fs from 'fs';
import {Yarn} from './yarn';
import tempy from 'tempy';

const HOME = tempy.directory();
const YARN_RC_FILENAME = 'yarnrc.test.yaml';
const yarn = new Yarn({ HOME, YARN_RC_FILENAME });

describe('Yarn', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  it('setNpmRegistryServer', async () => {
    await yarn.setNpmRegistryServer('https://registry.npmjs.org');
    expect(await yarn.getNpmRegistryServer()).toBe(
      'https://registry.npmjs.org',
    );
  });

  it('setNpmAuthToken', async () => {
    await yarn.setNpmRegistryServer('https://registry.npmjs.org');
    const token = '__dummy_token__';
    await yarn.setNpmAuthToken(token);
    expect(await yarn.getNpmAuthToken()).toBe(token);
  });

  it('with real NPM_TOKEN', async () => {
    await yarn.setNpmRegistryServer('https://registry.npmjs.org');
    const NPM_TOKEN = process.env['NPM_TOKEN'] as string;
    expect(NPM_TOKEN).toBeDefined();

    await yarn.setNpmAuthToken(NPM_TOKEN);
    expect(await yarn.authenticated()).toBe(true);
  });

  it('invalid NPM_TOKEN', async () => {
    await yarn.setNpmRegistryServer('https://registry.npmjs.org');
    await yarn.setNpmAuthToken('invalid');
    expect(await yarn.authenticated()).toBe(false);
  });

  it('setNpmAuthIdent', async () => {
    const authIdent = '__dummy_auth_ident__';
    await yarn.setNpmAuthIdent(authIdent);
    expect(await yarn.getNpmAuthIdent()).toBe(authIdent);
  });

  // TODO: azure registry doesn't have a /whoami route, need to find a better way to verify that \
  //  authentication worked for the token
  // it('with real NPM_AUTH_IDENT', async () => {
  //   await yarn.setNpmRegistryServer(
  //     'https://pkgs.dev.azure.com/allido/allido/_packaging/semantic-release-yarn/npm/registry/',
  //   );
  //   const NPM_AUTH_IDENT = process.env['NPM_AUTH_IDENT'] as string;
  //   expect(NPM_AUTH_IDENT).toBeDefined();
  //
  //   await yarn.setNpmAuthIdent(NPM_AUTH_IDENT);
  //   expect(await yarn.authenticated()).toBe(true);
  // });
  //
  // it('invalid NPM_AUTH_IDENT', async () => {
  //   await yarn.setNpmRegistryServer(
  //     'https://pkgs.dev.azure.com/allido/allido/_packaging/semantic-release-yarn/npm/registry/',
  //   );
  //   await yarn.setNpmAuthIdent('invalid');
  //   expect(await yarn.authenticated()).toBe(false);
  // });

  // TODO: can't run berry installs in tests because it would modify the yarn.lock in CI/CD
  // it('version', async () => {
  //   const cwd = tempy.directory();
  //   const packageJson = `${cwd}/package.json`;
  //
  //   fs.writeFileSync(
  //     packageJson,
  //     JSON.stringify({ version: '1.0.0', packageManager: 'yarn@3.3.0' }),
  //   );
  //
  //   function getVersion(): string {
  //     // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  //     return JSON.parse(fs.readFileSync(packageJson, 'utf8')).version as string;
  //   }
  //
  //   const yarn = new Yarn({ HOME, YARN_RC_FILENAME, cwd });
  //   await yarn.install();
  //   await yarn.pluginImportVersion();
  //   await yarn.version('1.0.1');
  //   expect(getVersion()).toBe('1.0.1');
  // });

  it('yarnPackDryRun', async () => {
    const cwd = tempy.directory();
    const packageJson = `${cwd}/package.json`;

    fs.writeFileSync(
      packageJson,
      JSON.stringify({
        name: 'mypkg',
        version: '1.0.0',
        packageManager: 'yarn@3.4.1',
        license: 'MIT',
      }),
    );

    fs.mkdirSync(`${cwd}/lib`);
    fs.writeFileSync(`${cwd}/lib/index.js`, '');
    const yarn = new Yarn({ HOME, YARN_RC_FILENAME, cwd });

    const files = await yarn.packDryRun();
    expect(files).toMatchInlineSnapshot(`
      [
        "lib/index.js",
        "package.json",
      ]
    `);
  });

  it('yarnPack', async () => {
    const cwd = tempy.directory();
    const packageJson = `${cwd}/package.json`;

    fs.writeFileSync(
      packageJson,
      JSON.stringify({
        name: 'mypkg',
        version: '1.0.0',
        packageManager: 'yarn@3.4.1',
        license: 'MIT',
      }),
    );

    const yarn = new Yarn({ HOME, YARN_RC_FILENAME, cwd });
    await yarn.pack('%s-%v.tgz');
    expect(fs.readdirSync(cwd)).toContain('mypkg-1.0.0.tgz');
  });
});
