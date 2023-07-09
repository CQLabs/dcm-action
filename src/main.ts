import * as core from '@actions/core';
import * as github from '@actions/github';
import * as io from '@actions/io';
import { analyze, getConclusion } from './commands/analyze';
import { getOptions } from './options';
import { Reporter } from './reporter/reporter';

async function run(): Promise<void> {
  try {
    await io.which('dcm', true);

    const options = getOptions();
    const tokenToUse = options.pat.length > 0 ? options.pat : options.token;

    core.startGroup('Analyzing');
    const reports = await analyze(options);
    const conclusion = getConclusion(reports, options);
    // get summary

    const reporter = new Reporter(github.getOctokit(tokenToUse));
    const runner = await reporter.create(options.reportTitle, conclusion);
    await reporter.reportIssues(reports, runner.data.id, conclusion);
    core.endGroup();

    if (conclusion === 'failure') {
      core.setFailed('Found fatal issues!');
    }
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message);
  }
}

run();
