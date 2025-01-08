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
  readonly exclude: string;
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
  readonly size: string;
  readonly webp: boolean;
  readonly naming: string;
  readonly resolution: boolean;
  readonly allowedFormats: string;

  // Analyze Widgets
  readonly showSimilarity: boolean;
  readonly similarityThreshold: string;

  // Check Code Duplication
  readonly perPackage: boolean;
  readonly excludeOverrides: boolean;
  readonly statementsThreshold: string;

  // Check Dependencies
  readonly ignoredPackages: string;

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

  const ignoredPackages = parseSeparatedList('ignored-packages');
  const allowedFormats = parseSeparatedList('allowed-formats');
  const exclude = parseSeparatedList('exclude');

  const naming = core.getInput('naming');
  const parsedNaming = ['snake', 'kebab', 'pascal'].find(item => item === naming) || '';

  return {
    // Configuration
    token: core.getInput('github-token', { required: true }),
    pat: core.getInput('github-pat'),
    ciKey: core.getInput('ci-key', { required: true }),
    ciEmail: core.getInput('email', { required: true }),
    addComment: core.getBooleanInput('pull-request-comment'),
    addCommentOnFail: core.getBooleanInput('pull-request-comment-on-fail'),
    reportTitle,
    // General
    folders,
    exclude,
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
    naming: parsedNaming,
    resolution: core.getBooleanInput('resolution'),
    allowedFormats,
    // Analyze Widgets
    showSimilarity: core.getBooleanInput('show-similarity'),
    similarityThreshold: core.getInput('similarity-threshold'),
    // Check Code Duplication
    perPackage: core.getBooleanInput('per-package'),
    excludeOverrides: core.getBooleanInput('exclude-overrides'),
    statementsThreshold: core.getInput('statements-threshold'),
    // Check Dependencies
    ignoredPackages,
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

function parseSeparatedList(name: 'ignored-packages' | 'exclude' | 'allowed-formats'): string {
  return core
    .getInput(name)
    .split(',')
    .map(item => item.trim())
    .join(',');
}
