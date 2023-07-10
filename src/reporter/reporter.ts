/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import * as core from '@actions/core';
import * as github from '@actions/github';
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
      head_sha: github.context.sha,
      status: 'in_progress',
    });
  }

  public async reportIssues(
    reports: readonly Report[],
    runnerId: number,
    conclusion: string,
    reportTitle: string,
  ): Promise<void> {
    const annotationsToSend: Annotation[] = [];

    try {
      for (const report of reports) {
        if (report.issues.length) {
          core.info(`\n${report.path}:`);
          for (const issue of report.issues) {
            this.logIssue(issue, report.path);

            const annotation = issueToAnnotation(issue, report.path);
            annotationsToSend.push(annotation);

            // eslint-disable-next-line no-console
            console.log(annotation);

            if (annotationsToSend.length === Reporter.apiLimit) {
              await this.octokit.rest.checks.update({
                owner: github.context.repo.owner,
                repo: github.context.repo.repo,
                check_run_id: runnerId,
                output: {
                  title: 'DCM analysis report',
                  summary: 'Summary',
                  annotations: [...annotationsToSend],
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
        status: 'completed',
        conclusion,
        name: reportTitle,
        output: {
          title: 'DCM analysis report',
          summary: 'Summary',
          annotations: annotationsToSend.length ? [...annotationsToSend] : undefined,
          text: 'Example',
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
  }

  public async postComment(
    commentText: string,
  ): ReturnType<typeof this.octokit.rest.issues.createComment> {
    return this.octokit.rest.issues.createComment({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      issue_number: github.context.issue.number,
      body: commentText,
    });
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
}
