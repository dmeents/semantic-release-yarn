/* eslint-disable @typescript-eslint/no-unsafe-call */
import SemanticReleaseError from '@semantic-release/error';

export enum ErrorTypes {
  MISSING_PACKAGE_NAME,
  MISSING_YARNRC,
  MISSING_PACKAGE,
  INVALID_NPM_TOKEN,
  INVALID_NPM_AUTH_IDENT,
}

export const error = (error: ErrorTypes): Error => {
  switch (error) {
    case ErrorTypes.MISSING_PACKAGE_NAME:
      return new SemanticReleaseError(
        'Missing `name` in property `package.json`',
        'MISSING_PACKAGE_NAME',
      ) as Error;
    case ErrorTypes.MISSING_YARNRC:
      return new SemanticReleaseError(
        'Missing `.yarnrc.yml`',
        'MISSING_YARNRC',
      ) as Error;
    case ErrorTypes.MISSING_PACKAGE:
      return new SemanticReleaseError(
        'Missing `package.json`',
        'MISSING_PACKAGE',
      ) as Error;
    case ErrorTypes.INVALID_NPM_TOKEN:
      return new SemanticReleaseError(
        'Invalid NPM_TOKEN value in environment variables',
        'INVALID_NPM_TOKEN',
      ) as Error;
    case ErrorTypes.INVALID_NPM_AUTH_IDENT:
      return new SemanticReleaseError(
        'Invalid NPM_AUTH_IDENT value in environment variables',
        'INVALID_NPM_AUTH_IDENT',
      ) as Error;
    default:
      return new SemanticReleaseError(error) as Error;
  }
};
