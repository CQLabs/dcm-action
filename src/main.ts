import * as core from '@actions/core';
import * as github from '@actions/github';
import * as io from '@actions/io';
import { analyze, getConclusion, getSummary } from './commands/analyze';
import { getOptions } from './options';
import { Reporter } from './reporter/reporter';
import { setGitHubAuth } from './auth';

async function run(): Promise<void> {
  try {
    await io.which('dcm', true);

    const options = getOptions();
    setGitHubAuth(options.pat);

    core.startGroup('Analyzing');

    const reports = await analyze(options);

    const reporter = new Reporter(github.getOctokit(options.token));
    const runner = await reporter.create(options.reportTitle);
    const { errors, warnings, style, perf } = await reporter.reportIssues(
      reports,
      runner.data.id,
      options.reportTitle,
    );
    const conclusion = getConclusion(errors, warnings, style, perf, options);
    const summary = getSummary(errors, warnings, style, perf);
    const reportUrl = await reporter.complete(
      conclusion,
      runner.data.id,
      options.reportTitle,
      summary,
    );

    if (options.addComment) {
      const commentBody = `# ${options.reportTitle}\n${summary}\n\nFull report: ${reportUrl}`;

      await reporter.postComment(commentBody);
    }

    core.endGroup();

    if (conclusion === 'failure') {
      core.setFailed('Found fatal issues!');
    }
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message);
  }
}

run();
