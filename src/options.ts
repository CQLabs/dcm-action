import * as core from '@actions/core';

export type Options = {
  // Configuration
  readonly token: string;
  readonly pat: string;
  readonly ciKey: string;
  readonly ciEmail: string;
  readonly addComment: boolean;
  readonly addCommentOnFail: boolean;
  readonly reportTitle: string;

  // General
  readonly folders: string[];
  readonly exclude: string; // TODO: update readme
  readonly excludePublicApi: boolean;
  readonly fatalFound: boolean;

  // Commands
  readonly analyze: boolean;
  readonly analyzeAssets: boolean;
  readonly analyzeWidgets: boolean;
  readonly calculateMetrics: boolean;
  readonly checkCodeDuplication: boolean;
  readonly checkDependencies: boolean;
  readonly checkExportsCompleteness: boolean;
  readonly checkParameters: boolean;
  readonly checkUnusedCode: boolean;
  readonly checkUnusedFiles: boolean;
  readonly checkUnusedL10n: boolean;

  // Analyze Assets
  readonly size: string; // TODO: add a hint about format to readme
  readonly webp: boolean;
  readonly naming: string;
  readonly resolution: boolean;
  readonly allowedFormats: string; // TODO: add a hint about format

  // Analyze Widgets
  readonly showSimilarity: boolean;
  readonly similarityThreshold: string; // TODO: rename in config

  // Check Code Duplication
  readonly perPackage: boolean;
  readonly excludeOverrides: boolean;
  readonly statementsThreshold: string;

  // Check Dependencies
  readonly ignoredPackages: string; // TODO: parse

  // Check Parameters
  readonly showSameValue: boolean;
  readonly showUnusedDefaultValue: boolean;
  readonly showRedundant: boolean;
  readonly showUnusedVFT: boolean;
  readonly showBroadTypes: boolean;

  // Check Unused Code
  readonly noExcludeOverridden: boolean;

  // Check Unused L10n
  readonly classPattern: string;
};

export function getOptions(): Options {
  const folders = core
    .getInput('folders')
    .split(',')
    .map(folder => folder.trim());

  const packageName = core.getInput('package-name');
  const reportTitle = packageName ? `DCM report for ${packageName}` : 'DCM report';

  return {
    // Configuration
    token: core.getInput('github-token', { required: true }),
    pat: core.getInput('github-pat'),
    ciKey: core.getInput('ci-key', { required: true }),
    ciEmail: core.getInput('ci-email', { required: true }),
    addComment: core.getBooleanInput('pr-comment'),
    addCommentOnFail: core.getBooleanInput('pr-comment-on-fail'),
    reportTitle,
    // General
    folders,
    exclude: core.getInput('exclude'), // TODO: parse
    excludePublicApi: core.getBooleanInput('exclude-public-api'),
    fatalFound: core.getBooleanInput('fatal-found'),
    // Commands
    analyze: core.getBooleanInput('analyze'),
    analyzeAssets: core.getBooleanInput('analyze-assets'),
    analyzeWidgets: core.getBooleanInput('analyze-widgets'),
    calculateMetrics: core.getBooleanInput('calculate-metrics'),
    checkCodeDuplication: core.getBooleanInput('check-code-duplication'),
    checkDependencies: core.getBooleanInput('check-dependencies'),
    checkExportsCompleteness: core.getBooleanInput('check-exports-completeness'),
    checkParameters: core.getBooleanInput('check-parameters'),
    checkUnusedCode: core.getBooleanInput('check-unused-code'),
    checkUnusedFiles: core.getBooleanInput('check-unused-files'),
    checkUnusedL10n: core.getBooleanInput('check-unused-l10n'),
    // Analyze Assets
    size: core.getInput('size'),
    webp: core.getBooleanInput('webp'),
    naming: core.getInput('naming'),
    resolution: core.getBooleanInput('resolution'),
    allowedFormats: core.getInput('allowed-formats'),
    // Analyze Widgets
    showSimilarity: core.getBooleanInput('show-similarity'),
    similarityThreshold: core.getInput('similarity-threshold'),
    // Check Code Duplication
    perPackage: core.getBooleanInput('per-package'),
    excludeOverrides: core.getBooleanInput('exclude-overrides'),
    statementsThreshold: core.getInput('statements-threshold'),
    // Check Dependencies
    ignoredPackages: core.getInput('ignored-packages'),
    // Check Parameters
    showSameValue: core.getBooleanInput('show-same-value'),
    showUnusedDefaultValue: core.getBooleanInput('show-unused-default-value'),
    showRedundant: core.getBooleanInput('show-redundant'),
    showUnusedVFT: core.getBooleanInput('show-unused-vft'),
    showBroadTypes: core.getBooleanInput('show-broad-types'),
    // Check Unused Code
    noExcludeOverridden: core.getBooleanInput('no-exclude-overridden'),
    // Check Unused L10n
    classPattern: core.getInput('class-pattern'),
  };
}
