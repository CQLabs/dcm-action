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
  if (!existsSync(outputFilePath)) {
    return undefined;
  }

  const report = readFileSync(outputFilePath).toString();

  return JSON.parse(report.trim()) as JsonOutput;
}

export function parseSummary(summary: JsonReportSummary[]): string {
  const text = summary.map(entry => `❌ ${entry.title} - ${entry.value}`).join('\n');

  return `## Summary\n${text || '✅ no issues found!'}`;
}
