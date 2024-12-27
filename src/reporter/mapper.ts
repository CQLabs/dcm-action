import { Issue } from '../parse';

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
  const isSingleLineIssue = issue.location?.startLine === issue.location?.endLine;

  return {
    path,
    start_line: issue.location?.startLine ?? 1,
    start_column: isSingleLineIssue ? issue.location?.startColumn : undefined,
    end_line: issue.location?.endLine ?? 1,
    end_column: isSingleLineIssue ? issue.location?.endColumn : undefined,
    annotation_level: severityToAnnotationLevel(issue.severity),
    message: issue.message,
  };
}

function severityToAnnotationLevel(severity?: string): AnnotationLevel {
  if (!severity) {
    return AnnotationLevel.warning;
  }

  const level = {
    none: AnnotationLevel.notice,
    style: AnnotationLevel.notice,
    warning: AnnotationLevel.warning,
    error: AnnotationLevel.failure,
  }[severity];

  return level ?? AnnotationLevel.notice;
}
