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
  });
});
