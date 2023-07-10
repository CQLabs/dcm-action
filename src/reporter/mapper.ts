import { join } from 'path';
import { Issue } from '../commands/analyze';

enum AnnotationLevel {
  notice = 'notice',
  warning = 'warning',
  failure = 'failure',
}

export type Annotation = {
  readonly path: string; // relative path
  readonly start_line: number;
  readonly start_column?: number;
  readonly end_line: number;
  readonly end_column?: number;
  readonly annotation_level: AnnotationLevel;
  readonly message: string;
  readonly title?: string;
};

export function issueToAnnotation(issue: Issue, path: string): Annotation {
  const isSingleLineIssue = issue.codeSpan.start.line === issue.codeSpan.end.line;
  const cwd = process.env.GITHUB_WORKSPACE || process.cwd();

  return {
    path: join(cwd, path),
    start_line: issue.codeSpan.start.line,
    start_column: isSingleLineIssue ? issue.codeSpan.start.column : undefined,
    end_line: issue.codeSpan.end.line,
    end_column: isSingleLineIssue ? issue.codeSpan.end.column : undefined,
    annotation_level: severityToAnnotationLevel(issue.severity),
    message: issue.message,
  };
}

function severityToAnnotationLevel(severity: string): AnnotationLevel {
  const level = {
    none: AnnotationLevel.notice,
    style: AnnotationLevel.notice,
    performance: AnnotationLevel.warning,
    warning: AnnotationLevel.warning,
    error: AnnotationLevel.failure,
  }[severity];

  return level ?? AnnotationLevel.notice;
}
