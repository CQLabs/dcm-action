import os from 'os';
import * as core from '@actions/core';
import * as exec from '@actions/exec';
import { join } from 'path';

import { Options } from '../options';
import { JsonOutput, parseOutput } from '../parse';

export type RunResult = {
  readonly json?: JsonOutput;
  readonly conclusion: 'failure' | 'success';
};

export async function runCommands(options: Options, runnerId: number): Promise<RunResult> {
  const credentials =
    options.ciKey !== 'oss' ? [`--ci-key=${options.ciKey}`, `--email=${options.ciEmail}`] : [];

  const outputFilePath = getOutputFilePath(runnerId);

  const execOptions = [
    'run',
    '--reporter=json',
    `--output-to=${outputFilePath}`,
    ...credentials,
    ...prepareAnalyze(options),
    ...prepareAnalyzeAssets(options),
    ...prepareAnalyzeWidgets(options),
    ...prepareCalculateMetrics(options),
    ...prepareCheckCodeDuplication(options),
    ...prepareCheckDependencies(options),
    ...prepareCheckExportsCompleteness(options),
    ...prepareCheckParameters(options),
    ...prepareCheckUnusedCode(options),
    ...prepareCheckUnusedFiles(options),
    ...prepareCheckUnusedL10n(options),
    ...prepareGeneral(options),
  ];

  core.info(`Running dcm ${execOptions.join(' ')}`);

  const output = await exec.getExecOutput('dcm', execOptions, {
    ignoreReturnCode: true,
  });

  try {
    const result = parseOutput(outputFilePath);
    if (result) {
      return { json: result, conclusion: output.exitCode === 0 ? 'success' : 'failure' };
    }

    core.setFailed('Failed to parse DCM output.');
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(`Failed to parse DCM output: ${error.message}`);
    }
  }

  return { conclusion: 'failure' };
}

function getOutputFilePath(runnerId: number): string {
  const tempDirectory = process.env.RUNNER_TEMP || os.tmpdir();

  return join(tempDirectory, `${runnerId}.json`);
}

function prepareAnalyze(options: Options): string[] {
  return options.analyze ? ['--analyze'] : [];
}

function prepareAnalyzeAssets(options: Options): string[] {
  if (options.analyzeAssets) {
    const command = ['--analyze-assets'];

    if (options.size) {
      command.push(`--size=${options.size}`);
    }

    if (options.webp) {
      command.push('--webp');
    }

    if (options.naming) {
      command.push(`--naming=${options.naming}`);
    }

    if (options.resolution) {
      command.push('--resolution');
    } else {
      command.push('--no-resolution');
    }

    if (options.allowedFormats) {
      command.push(`--allowed-formats="${options.allowedFormats}"`);
    }

    return command;
  }

  return [];
}

function prepareAnalyzeWidgets(options: Options): string[] {
  if (options.analyzeWidgets) {
    const command = ['--analyze-widgets'];

    if (options.showSimilarity) {
      command.push('--show-similarity');
    }

    if (options.similarityThreshold) {
      command.push(`--similarity-threshold=${options.similarityThreshold}`);
    }

    return command;
  }

  return [];
}

function prepareCalculateMetrics(options: Options): string[] {
  return options.calculateMetrics ? ['--metrics'] : [];
}

function prepareCheckCodeDuplication(options: Options): string[] {
  if (options.checkCodeDuplication) {
    const command = ['--code-duplication'];

    if (options.perPackage) {
      command.push('--per-package');
    }

    if (options.excludeOverrides) {
      command.push('--exclude-overrides');
    }

    if (options.statementsThreshold) {
      command.push(`--statements-threshold=${options.statementsThreshold}`);
    }

    return command;
  }

  return [];
}

function prepareCheckDependencies(options: Options): string[] {
  if (options.checkDependencies) {
    const command = ['--dependencies'];

    if (options.ignoredPackages) {
      command.push(`--ignored-packages="${options.ignoredPackages}"`);
    }

    return command;
  }

  return [];
}

function prepareCheckExportsCompleteness(options: Options): string[] {
  return options.checkExportsCompleteness ? ['--exports-completeness'] : [];
}

function prepareCheckParameters(options: Options): string[] {
  if (options.checkParameters) {
    const command = ['--parameters'];

    if (options.showSameValue) {
      command.push('--show-same-value');
    }

    if (options.showUnusedDefaultValue) {
      command.push('--show-unused-default-value');
    }

    if (options.showRedundant) {
      command.push('--show-redundant');
    }

    if (options.showUnusedVFT) {
      command.push('--show-unused-vft');
    }

    if (options.showBroadTypes) {
      command.push('--show-broad-types');
    }

    return command;
  }

  return [];
}

function prepareCheckUnusedCode(options: Options): string[] {
  if (options.checkUnusedCode) {
    const command = ['--unused-code'];

    if (options.noExcludeOverridden) {
      command.push('--no-exclude-overridden');
    }

    return command;
  }

  return [];
}

function prepareCheckUnusedFiles(options: Options): string[] {
  return options.checkUnusedFiles ? ['--unused-files'] : [];
}

function prepareCheckUnusedL10n(options: Options): string[] {
  return options.checkUnusedL10n ? [' --unused-l10n'] : [];
}

function prepareGeneral(options: Options): string[] {
  const result = [];

  if (options.exclude) {
    result.push(`--exclude="${options.exclude}"`);
  }

  if (options.excludePublicApi) {
    result.push('--exclude-public-api');
  }

  if (options.fatalFound) {
    result.push('--fatal-found');
  } else {
    result.push('--no-fatal-found');
  }

  options.folders.forEach(folder => result.push(folder));

  return result;
}
