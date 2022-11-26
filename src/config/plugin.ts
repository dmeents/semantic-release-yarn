export interface PluginConfig {
  readonly npmPublish?: boolean;
  readonly changeVersion?: boolean;
  readonly tarballDir?: string | false;
}

function isNullableBoolean(
  value: unknown,
  name: string,
): asserts value is boolean {
  if (typeof value === 'undefined') return;
  if (typeof value === 'boolean') return;

  throw new Error(
    `${name} must be a boolean, but given ${JSON.stringify(value)}`,
  );
}

function isNullableString(
  value: unknown,
  name: string,
): asserts value is string {
  if (typeof value === 'undefined') return;
  if (typeof value === 'string') return;

  throw new Error(
    `${name} must be a string, but given ${JSON.stringify(value)}`,
  );
}

export const PluginConfig = {
  normalize({
    npmPublish,
    tarballDir,
    changeVersion,
  }: PluginConfig): PluginConfig {
    isNullableBoolean(npmPublish, 'npmPublish');
    isNullableBoolean(changeVersion, 'packageVersion');
    isNullableString(tarballDir, 'tarballDir');

    return {
      npmPublish: npmPublish ?? true,
      tarballDir: tarballDir ?? '.',
      changeVersion: changeVersion ?? true,
    };
  },
};
