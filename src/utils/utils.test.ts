import tempy from 'tempy';
import * as fs from 'fs';
import { getPackage } from './index';

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
});
