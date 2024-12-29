import * as core from '@actions/core';
import * as github from '@actions/github';
import * as io from '@actions/io';
import { getOptions } from './options';
import { Reporter } from './reporter/reporter';
import { setGitHubAuth } from './auth';
import { runCommands } from './commands/run';
import { hasProperVersion, parseSummary } from './parse';

async function run(): Promise<void> {
  try {
    await io.which('dcm', true);

    if (!(await hasProperVersion())) {
      core.setFailed(
        'dcm-action v2 requires DCM 1.26+. Consider updating DCM or downgrading the action version.',
      );

      return;
    }

    const options = getOptions();
    setGitHubAuth(options.pat);

    core.startGroup('Analyzing');

    const reporter = new Reporter(github.getOctokit(options.token));
    const runner = await reporter.create(options.reportTitle);

    const { json, conclusion } = await runCommands(options, runner.data.id);
    if (json) {
      const reports = [
        ...(json.analyzeResults ?? []),
        ...(json.metricResults ?? []),
        ...(json.widgetResults ?? []),
        ...(json.assetResults ?? []),
        ...(json.duplicationResults ?? []),
        ...(json.unusedCodeResults ?? []),
        ...(json.unusedFilesResults ?? []),
        ...(json.unusedL10nResults ?? []),
        ...(json.dependenciesResults ?? []),
        ...(json.parametersResults ?? []),
        ...(json.exportResults ?? []),
      ];

      await reporter.reportIssues(reports, runner.data.id, options.reportTitle);

      const summary = parseSummary(json.summary);
      const reportUrl = await reporter.complete(
        conclusion,
        runner.data.id,
        options.reportTitle,
        summary,
      );

      const commentTitle = `## ${options.reportTitle}`;

      if (options.addComment || (options.addCommentOnFail && conclusion === 'failure')) {
        const commentBody = `${summary.replace(
          '## Summary',
          commentTitle,
        )}\n\nFull report: ${reportUrl}`;

        await reporter.postComment(commentTitle, commentBody);
      } else if (options.addCommentOnFail && conclusion === 'success') {
        await reporter.deleteComment(commentTitle);
      } else {
        core.debug('Skipping adding a comment');
      }
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
