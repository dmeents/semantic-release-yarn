/* eslint-disable @typescript-eslint/no-unsafe-call */
import SemanticReleaseError from '@semantic-release/error';

export enum ErrorTypes {
  MISSING_PACKAGE_NAME,
  MISSING_PACKAGE,
  INVALID_NPM_TOKEN,
}

export const error = (error: ErrorTypes): Error => {
  switch (error) {
    case ErrorTypes.MISSING_PACKAGE_NAME:
      return new SemanticReleaseError(
        'Missing `name` in property `package.json`',
        'MISSING_PACKAGE_NAME',
      ) as Error;
    case ErrorTypes.MISSING_PACKAGE:
      return new SemanticReleaseError(
        'Missing `name` in property `package.json`',
        'MISSING_PACKAGE_NAME',
      ) as Error;
    case ErrorTypes.INVALID_NPM_TOKEN:
      return new SemanticReleaseError(
        'Missing `name` in property `package.json`',
        'MISSING_PACKAGE_NAME',
      ) as Error;
    default:
      return new SemanticReleaseError(error) as Error;
  }
};
