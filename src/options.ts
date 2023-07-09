import * as core from '@actions/core';

export type Options = {
  readonly token: string;
  readonly ciKey: string;
  readonly email: string;
  readonly pat: string;
  readonly folders: string;
  readonly relativePath: string;
  readonly addComment: boolean;
  readonly reportTitle: string;
  readonly fatalWarnings: boolean;
  readonly fatalPerf: boolean;
  readonly fatalStyle: boolean;
  readonly unusedFileFolders: string;
};

export function getOptions(): Options {
  return {
    token: core.getInput('github_token', { required: true }),
    ciKey: core.getInput('ci_key', { required: true }),
    email: core.getInput('email', { required: true }),
    pat: core.getInput('github_pat'),
    folders: core.getInput('folders'),
    relativePath: core.getInput('relative_path'),
    addComment: core.getBooleanInput('pull_request_comment'),
    reportTitle: core.getInput('report_title'),
    fatalWarnings: core.getBooleanInput('fatal_warnings'),
    fatalPerf: core.getBooleanInput('fatal_performance'),
    fatalStyle: core.getBooleanInput('fatal_style'),
    unusedFileFolders: core.getInput('unused_files_folders'),
  };
}
