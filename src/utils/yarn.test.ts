/* eslint-disable jest/no-commented-out-tests */
import * as fs from 'fs';
import {Yarn} from './yarn';
import tempy from 'tempy';

const HOME = tempy.directory();
const YARN_RC_FILENAME = 'yarnrc.test.yaml';
const yarn = new Yarn({ HOME, YARN_RC_FILENAME });

describe('Yarn', () => {
  it('setNpmRegistryServer', async () => {
    await yarn.setNpmRegistryServer('https://registry.npmjs.org');
    expect(await yarn.getNpmRegistryServer()).toBe(
      'https://registry.npmjs.org',
    );
  });

  it('setNpmAuthToken', async () => {
    const token = '__dummy_token__';
    await yarn.setNpmAuthToken(token);
    expect(await yarn.getNpmAuthToken()).toBe(token);
  });

  it('with real NPM_TOKEN', async () => {
    const NPM_TOKEN = process.env['NPM_TOKEN'] as string;
    expect(NPM_TOKEN).toBeDefined();

    await yarn.setNpmAuthToken(NPM_TOKEN);
    expect(await yarn.authenticated()).toBe(true);
  });

  it('invalid NPM_TOKEN', async () => {
    await yarn.setNpmAuthToken('invalid');
    expect(await yarn.authenticated()).toBe(false);
  });

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
      JSON.stringify({ version: '1.0.0', packageManager: 'yarn@3.1.0' }),
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
        packageManager: 'yarn@3.1.0',
      }),
    );

    const yarn = new Yarn({ HOME, YARN_RC_FILENAME, cwd });
    await yarn.pack('%s-%v.tgz');
    expect(fs.readdirSync(cwd)).toContain('mypkg-1.0.0.tgz');
  });
});
