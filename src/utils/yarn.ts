import { LineJson } from '../types';

interface ConstructorProps {
  readonly HOME?: string;
  readonly YARN_RC_FILENAME?: string;
  readonly cwd?: string;
}

export class Yarn {
  readonly home?: string | undefined;
  readonly yarnRcFileName?: string | undefined;
  readonly cwd?: string | undefined;

  constructor({ HOME, YARN_RC_FILENAME, cwd }: ConstructorProps = {}) {
    this.home = HOME;
    this.yarnRcFileName = YARN_RC_FILENAME;
    this.cwd = cwd;
  }

  async setNpmRegistryServer(registryServer: string): Promise<void> {
    await this.useExeca(
      `config set npmRegistryServer ${registryServer} --home`,
    );
  }

  async getNpmRegistryServer(): Promise<string> {
    const response = await this.useExeca('config get npmRegistryServer --json');
    return JSON.parse(response.stdout) as string;
  }

  async setNpmAuthToken(npmAuthToken: string): Promise<void> {
    await this.useExeca(`config set npmAuthToken ${npmAuthToken} --home`);
  }

  async getNpmAuthToken(): Promise<string | null> {
    const response = await this.useExeca(
      'config get npmAuthToken --json --no-redacted',
    );

    return JSON.parse(response.stdout) as string;
  }

  async authenticated(): Promise<boolean> {
    try {
      await this.useExeca('npm whoami');
      return true;
    } catch (e) {
      return false;
    }
  }

  async install(): Promise<void> {
    await this.useExeca('install');
  }

  async pluginImportVersion(): Promise<void> {
    await this.useExeca('plugin import version');
  }

  async version(version: string): Promise<void> {
    await this.useExeca(`version ${version}`);
  }

  async packDryRun(): Promise<ReadonlyArray<string>> {
    const response = (await this.useExeca('pack --dry-run --json')).stdout;

    return response
      .split('\n')
      .map(line => JSON.parse(line) as LineJson)
      .flatMap((line: LineJson) => (line.location ? [line.location] : []))
      .sort();
  }

  async pack(filename = 'package.tgz'): Promise<void> {
    await this.useExeca(`pack -o ${filename}`);
  }

  async publish(tag?: string): Promise<void> {
    await this.useExeca(`npm publish ${tag ? tag : ''}`);
  }

  async useExeca(args: string) {
    const { execa } = await import('execa');
    const command = args.split(' ');
    const useCwd = this.cwd && { cwd: this.cwd };
    const env = { HOME: this.home, YARN_RC_FILENAME: this.yarnRcFileName };
    return execa('yarn', command, { ...useCwd, env });
  }
}
