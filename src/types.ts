export interface Context {
  readonly cwd: string;
  readonly env: NodeJS.ProcessEnv;
  readonly stdout: NodeJS.WriteStream;
  readonly stderr: NodeJS.WriteStream;
  readonly logger: {
    readonly log: (message: string, ...vars: any[]) => void;
    readonly error: (message: string, ...vars: any[]) => void;
  };
}

export interface PrepareContext extends Context {
  readonly nextRelease: {
    readonly version: string;
    readonly channel: string;
  };
}

export interface LineJson {
  location?: string;
}

export interface ReadPackageResults {
  name?: string;
  publishConfig?: {
    registry?: string;
  };
  private?: boolean;
  version?: string;
  dependencies?: {
    [key: string]: string;
  };
}
