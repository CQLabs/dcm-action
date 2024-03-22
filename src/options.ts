import * as core from '@actions/core';

export type Options = {
  readonly token: string;
  readonly ciKey: string;
  readonly email: string;
  readonly pat: string;
  readonly folders: string[];
  readonly addComment: boolean;
  readonly addCommentOnFail: boolean;
  readonly reportTitle: string;
  readonly fatalWarnings: boolean;
  readonly fatalPerf: boolean;
  readonly fatalStyle: boolean;
};

export function getOptions(): Options {
  const folders = core
    .getInput('folders')
    .split(',')
    .map(folder => folder.trim());

  core.info(`Parsed folders ${folders.join(' ')}`);

  const packageName = core.getInput('package_name');
  const reportTitle = packageName ? `DCM report for ${packageName}` : 'DCM report';

  return {
    token: core.getInput('github_token', { required: true }),
    ciKey: core.getInput('ci_key', { required: true }),
    email: core.getInput('email', { required: true }),
    pat: core.getInput('github_pat'),
    folders: folders || ['lib'],
    addComment: core.getBooleanInput('pull_request_comment'),
    addCommentOnFail: core.getBooleanInput('pull_request_comment_on_fail'),
    reportTitle,
    fatalWarnings: core.getBooleanInput('fatal_warnings'),
    fatalPerf: core.getBooleanInput('fatal_performance'),
    fatalStyle: core.getBooleanInput('fatal_style'),
  };
}
