import * as exec from '@actions/exec';
import * as core from '@actions/core';
import { gte } from 'semver';
import { existsSync, readFileSync } from 'fs';

export type JsonOutput = {
  readonly formatVersion: number;
  readonly timestamp: string;
  readonly analyzeResults?: JsonReport[];
  readonly metricResults?: JsonReport[];
  readonly widgetResults?: JsonReport[];
  readonly assetResults?: JsonReport[];
  readonly duplicationResults?: JsonReport[];
  readonly unusedCodeResults?: JsonReport[];
  readonly unusedFilesResults?: JsonReport[];
  readonly unusedL10nResults?: JsonReport[];
  readonly dependenciesResults?: JsonReport[];
  readonly parametersResults?: JsonReport[];
  readonly exportResults?: JsonReport[];
  readonly summary: JsonReportSummary[];
};

export type JsonReportSummary = {
  readonly title: string;
  readonly value: string | number;
};

export type JsonReport = {
  readonly issues: readonly Issue[];
  readonly path: string;
};

export type Issue = {
  readonly id: string;
  readonly message: string;
  readonly severity?: string;
  readonly location?: Location;
};

export type Location = {
  readonly startLine: number;
  readonly startColumn: number;
  readonly startOffset: number;
  readonly endLine: number;
  readonly endColumn: number;
};

export function parseOutput(outputFilePath: string): JsonOutput | undefined {
  core.info('Parsing output...');

  if (!existsSync(outputFilePath)) {
    core.info('File does not exist...');
    return undefined;
  }
  core.info('Reading file...');

  const report = readFileSync(outputFilePath).toString();

  // core.info(report);
  core.info(report.substring(report.length - 10));

  core.info(report.length.toString());

  core.info('Parsing file...');

  return JSON.parse(report.trim()) as JsonOutput;
}

export function parseSummary(summary: JsonReportSummary[]): string {
  const text = summary.map(entry => `❌ ${entry.title} - ${entry.value}`).join('\n');

  return `## Summary\n${text || '✅ no issues found!'}`;
}

export async function hasProperVersion(): Promise<boolean> {
  const output = await exec.getExecOutput('dcm', ['--version'], {
    silent: true,
    ignoreReturnCode: true,
  });

  const version = output.stdout.trim().split(':')[1]?.trim();

  return version !== undefined && gte(version, '1.26.0');
}
