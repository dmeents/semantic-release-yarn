import tempy from 'tempy';
import * as fs from 'fs';
import {
  getChannel,
  getNpmAuthIdent,
  getNpmToken,
  getPackage,
  getYarnRc,
} from './index';

describe('utils', () => {
  describe('getPackage', () => {
    it('should return the package.json if it exists', async () => {
      const cwd = tempy.directory();

      const mockPackage = {
        name: 'mypkg',
        version: '1.0.0',
        packageManager: 'yarn@3.4.1',
        license: 'MIT',
      };

      fs.writeFileSync(`${cwd}/package.json`, JSON.stringify(mockPackage));
      const result = await getPackage(cwd);

      expect(result.name).toEqual(mockPackage.name);
    });

    it('should throw an error if the package.json does not exist', async () => {
      const cwd = tempy.directory();
      await expect(getPackage(cwd)).rejects.toThrow();
    });

    it('should throw an error if the package.json does not include a name', async () => {
      const cwd = tempy.directory();
      fs.writeFileSync(`${cwd}/package.json`, JSON.stringify({}));
      await expect(getPackage(cwd)).rejects.toThrow();
    });
  });

  describe('getYarnRc', () => {
    it('should return the .yarnrc.yml if it exists', async () => {
      const cwd = tempy.directory();

      const mockYarnRc = {
        npmPublishRegistry: 'https://registry.npmjs.org',
      };

      fs.writeFileSync(`${cwd}/.yarnrc.yml`, JSON.stringify(mockYarnRc));
      const result = await getYarnRc(cwd);

      expect(result.npmPublishRegistry).toEqual(mockYarnRc.npmPublishRegistry);
    });
  });

  describe('getNpmToken', () => {
    it('should return the npm token if it exists in the environment', () => {
      const mockEnv = { NPM_TOKEN: '1234567890' };
      const result = getNpmToken(mockEnv);
      expect(result).toEqual(mockEnv.NPM_TOKEN);
    });
  });

  describe('getNpmAuthIdent', () => {
    it('should return the npm auth ident if it exists in the environment', () => {
      const mockEnv = { NPM_AUTH_IDENT: '1234567890' };
      const result = getNpmAuthIdent(mockEnv);
      expect(result).toEqual(mockEnv.NPM_AUTH_IDENT);
    });
  });

  describe('getChannel', () => {
    it('should return "latest" if there is no channel set', () => {
      const result = getChannel();
      expect(result).toEqual('latest');
    });

    it('should return a channel preceded by "release-" if there is a valid channel set', () => {
      const result = getChannel('1.0.1');
      expect(result).toEqual('release-1.0.1');
    });

    // TODO: this seems like weird behavior, if it's not a valid semver range, it should throw
    it('should return the provided channel if it is not a valid semver range', () => {
      const channel = '-';
      const result = getChannel(channel);
      expect(result).toEqual(channel);
    });
  });
});
