/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import * as core from '@actions/core';
import * as github from '@actions/github';
import type { PullRequest, WorkflowRunEvent } from '@octokit/webhooks-types';
import { Issue, Report } from '../commands/analyze';
import { Annotation, issueToAnnotation } from './mapper';

// eslint-disable-next-line import/prefer-default-export
export class Reporter {
  static readonly apiLimit = 50;

  constructor(private readonly octokit: ReturnType<typeof github.getOctokit>) {}

  public async create(reportTitle: string): ReturnType<typeof this.octokit.rest.checks.create> {
    return this.octokit.rest.checks.create({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      name: reportTitle,
      head_sha: this.getCheckRunSha(),
      status: 'in_progress',
    });
  }

  public async reportIssues(
    reports: readonly Report[],
    runnerId: number,
    reportTitle: string,
  ): Promise<{ errors: number; warnings: number; style: number; perf: number }> {
    let warnings = 0;
    let style = 0;
    let perf = 0;
    let errors = 0;

    const annotationsToSend: Annotation[] = [];

    try {
      for (const report of reports) {
        if (report.issues.length) {
          core.info(`\n${report.path}:`);
          for (const issue of report.issues) {
            this.logIssue(issue, report.path);

            if (issue.severity === 'error') {
              errors += 1;
            } else if (issue.severity === 'warning') {
              warnings += 1;
            } else if (issue.severity === 'style') {
              style += 1;
            } else if (issue.severity === 'perf') {
              perf += 1;
            }

            const annotation = issueToAnnotation(issue, report.path);
            annotationsToSend.push(annotation);

            if (annotationsToSend.length === Reporter.apiLimit) {
              await this.octokit.rest.checks.update({
                owner: github.context.repo.owner,
                repo: github.context.repo.repo,
                check_run_id: runnerId,
                output: {
                  title: reportTitle,
                  summary: reportTitle,
                  annotations: annotationsToSend,
                },
              });

              annotationsToSend.length = 0;
            }
          }
        }
      }

      await this.octokit.rest.checks.update({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        check_run_id: runnerId,
        output: {
          title: reportTitle,
          summary: reportTitle,
          annotations: annotationsToSend.length ? [...annotationsToSend] : undefined,
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        try {
          await this.cancelRun(runnerId, error);
        } catch (innerError) {
          core.error(error);
          if (innerError instanceof Error) core.error(innerError);
        }
      }
    }

    return { errors, warnings, style, perf };
  }

  public async complete(
    conclusion: string,
    runnerId: number,
    reportTitle: string,
    summary: string,
  ): Promise<string> {
    const completedRun = await this.octokit.rest.checks.update({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      check_run_id: runnerId,
      status: 'completed',
      conclusion,
      name: reportTitle,
      output: {
        title: reportTitle,
        summary,
      },
    });

    core.info(`Check run create response: ${completedRun.status}`);
    core.info(`Check run HTML: ${completedRun.data.html_url ?? ''}`);

    return completedRun.data.html_url ?? '';
  }

  public async postComment(commentTitle: string, commentText: string): Promise<void> {
    const issue = github.context.issue.number;
    if (issue === null || issue === undefined) return;

    try {
      const existingComment = (
        await this.octokit.rest.issues.listComments({
          owner: github.context.repo.owner,
          repo: github.context.repo.repo,
          issue_number: issue,
          per_page: 100,
        })
      ).data.find(comment => comment.body?.startsWith(commentTitle));

      if (existingComment?.id) {
        await this.octokit.rest.issues.updateComment({
          owner: github.context.repo.owner,
          repo: github.context.repo.repo,
          comment_id: existingComment.id,
          body: commentText,
        });

        return;
      }

      await this.octokit.rest.issues.createComment({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        issue_number: issue,
        body: commentText,
      });
    } catch (error) {
      if (error instanceof Error) core.debug(`Failed to create a comment due to ${error.message}.`);
    }
  }

  private async cancelRun(runnerId: number, error: Error): Promise<void> {
    core.info(`Checkrun is cancelled due to ${error.message}.`);

    await this.octokit.rest.checks.update({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      check_run_id: runnerId,
      status: 'completed',
      completed_at: new Date(Date.now()).toISOString(),
      conclusion: 'cancelled',
      output: {
        title: 'DCM analysis report',
        summary: `This check run has been cancelled, due to the following error:
\n'${error.message}'\n
Check your logs for more information.`,
      },
    });
  }

  private logIssue(issue: Issue, path: string): void {
    const padding = ''.padStart(10);

    core.info(`${issue.severity.padEnd(10).toUpperCase()}${issue.message}
${padding}at ${path}:${issue.codeSpan.start.line}:${issue.codeSpan.start.column}
${padding}${issue.ruleId} : ${issue.documentation}
`);
  }

  private getCheckRunSha(): string {
    if (github.context.eventName === 'workflow_run') {
      core.info(
        'Action was triggered by workflow_run: using SHA and RUN_ID from triggering workflow',
      );
      const event = github.context.payload.workflow_run as WorkflowRunEvent;
      if (!event) {
        throw new Error("Event of type 'workflow_run' is missing 'workflow_run' field");
      }

      return event.workflow_run.head_commit.id;
    }

    if (github.context.payload.pull_request) {
      core.info(
        `Action was triggered by ${github.context.eventName}: using SHA from head of source branch`,
      );
      const pr = github.context.payload.pull_request as PullRequest;

      return pr.head.sha;
    }

    return github.context.sha;
  }
}
