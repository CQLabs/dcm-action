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
  const credentials =
    options.ciKey !== 'oss' ? [`--ci-key=${options.ciKey}`, `--email=${options.email}`] : [];

  const execOptions = ['analyze', ...credentials, '--reporter=json', '--no-congratulate'];
  if (options.fatalWarnings) {
    execOptions.push('--fatal-warnings');
  }
  if (options.fatalStyle) {
    execOptions.push('--fatal-style');
  }
  if (options.fatalPerf) {
    execOptions.push('--fatal-performance');
  }
  options.folders.forEach(folder => execOptions.push(folder));

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
      const trimmedError = jsonOutput.stderr.trim();
      const message = trimmedError ? [error.message, trimmedError].join('\n') : error.message;
      core.setFailed(`Failed to parse DCM output: ${message},\n\n${trimmed}`);
    }

    return [];
  }
}

export function getConclusion(
  errors: number,
  warnings: number,
  style: number,
  perf: number,
  options: Options,
): 'failure' | 'success' {
  if (errors) return 'failure';
  if (options.fatalWarnings && warnings) return 'failure';
  if (options.fatalStyle && style) return 'failure';
  if (options.fatalPerf && perf) return 'failure';

  return 'success';
}

export function getSummary(errors: number, warnings: number, style: number, perf: number): string {
  const parts = [];
  if (errors) parts.push(`error issues: ${errors}`);
  if (warnings) parts.push(`warning issues: ${warnings}`);
  if (style) parts.push(`style issues: ${style}`);
  if (perf) parts.push(`perf issues: ${perf}`);

  const text = parts.join(', ');

  return `## Summary\n${text ? `❌ ${text}` : `✅ no issues found!`}`;
}
