import * as core from '@actions/core';
import * as github from '@actions/github';
import * as io from '@actions/io';
import { analyze, getConclusion } from './commands/analyze';
import { getOptions } from './options';
import { Reporter } from './reporter/reporter';
// import { setGitHubAuth } from './auth';

async function run(): Promise<void> {
  try {
    await io.which('dcm', true);

    const options = getOptions();
    // setGitHubAuth(options.pat);

    core.startGroup('Analyzing');

    const reports = await analyze(options);
    const conclusion = getConclusion(reports, options);
    // get summary

    const reporter = new Reporter(github.getOctokit(options.token));
    const runner = await reporter.create(options.reportTitle);
    await reporter.reportIssues(reports, runner.data.id, conclusion, options.reportTitle);
    await reporter.postComment(`## Hello`);

    core.endGroup();

    if (conclusion === 'failure') {
      core.setFailed('Found fatal issues!');
    }
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message);
  }
}

run();
