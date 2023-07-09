import * as core from '@actions/core';
import * as exec from '@actions/exec';

import { Options } from '../options';

export type JsonOutput = {
  formatVersion: number;
  records: Report[];
  timestamp: string;
};

export type Report = {
  readonly issues: readonly Issue[];
  readonly path: string;
};

export type Issue = {
  readonly ruleId: string;
  readonly message: string;
  readonly severity: string;
  readonly documentation: string;
  readonly codeSpan: CodeSpan;
};

export type CodeSpan = {
  readonly text: string;
  readonly start: Location;
  readonly end: Location;
};

export type Location = {
  readonly column: number;
  readonly line: number;
  readonly offset: number;
};

export async function analyze(options: Options): Promise<readonly Report[]> {
  const execOptions = [
    'analyze',
    `--ci-key=${options.ciKey}`,
    `--email=${options.email}`,
    '--reporter=json',
    '--no-congratulate',
  ];
  if (options.fatalWarnings) {
    execOptions.push('--fatal-warnings');
  }
  if (options.fatalStyle) {
    execOptions.push('--fatal-style');
  }
  if (options.fatalPerf) {
    execOptions.push('--fatal-performance');
  }
  execOptions.push(options.folders);

  core.info(`Running dcm ${execOptions.join(' ')}`);

  const jsonOutput = await exec.getExecOutput('dcm', execOptions, {
    silent: true,
    ignoreReturnCode: true,
  });
  const trimmed = jsonOutput.stdout.trim();

  try {
    const output = JSON.parse(trimmed) as JsonOutput;
    return output.records;
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(`Failed to parse DCM output: ${error.message},\n${trimmed}`);
    }

    return [];
  }
}

export function getConclusion(reports: readonly Report[], options: Options): 'failure' | 'success' {
  return reports.some(report =>
    report.issues.some(
      issue =>
        issue.severity === 'error' ||
        (options.fatalWarnings && issue.severity === 'warning') ||
        (options.fatalStyle && issue.severity === 'style') ||
        (options.fatalPerf && issue.severity === 'perf'),
    ),
  )
    ? 'failure'
    : 'success';
}
