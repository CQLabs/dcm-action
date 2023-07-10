import * as core from '@actions/core';
import * as github from '@actions/github';
import * as io from '@actions/io';
// import { analyze, getConclusion } from './commands/analyze';
import { getOptions } from './options';
// import { Reporter } from './reporter/reporter';
// import { setGitHubAuth } from './auth';

async function run(): Promise<void> {
  try {
    await io.which('dcm', true);

    const options = getOptions();
    // setGitHubAuth(options.pat);

    core.startGroup('Analyzing');

    core.info(`Creating check run DCM`);
    const octokit = github.getOctokit(options.token);
    const createResp = await octokit.rest.checks.create({
      head_sha: github.context.sha,
      name: 'DCM',
      status: 'in_progress',
      output: {
        title: 'DCM',
        summary: '',
      },
      ...github.context.repo,
    });

    core.info('Creating report summary');
    const summary = `Hello
world
`;

    const resp = await octokit.rest.checks.update({
      check_run_id: createResp.data.id,
      conclusion: 'success',
      status: 'completed',
      output: {
        title: `DCM`,
        summary,
      },
      ...github.context.repo,
    });

    core.info(`Check run create response: ${resp.status}`);
    core.info(`Check run URL: ${resp.data.url}`);
    core.info(`Check run HTML: ${resp.data.html_url ?? ''}`);

    // const reports = await analyze(options);
    // const conclusion = getConclusion(reports, options);
    // get summary

    // const reporter = new Reporter(github.getOctokit(options.token));
    // const runner = await reporter.create(options.reportTitle);
    // await reporter.reportIssues(reports, runner.data.id, conclusion, options.reportTitle);
    // await reporter.postComment(`## Hello`);

    core.endGroup();

    // if (conclusion === 'failure') {
    //   core.setFailed('Found fatal issues!');
    // }
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message);
  }
}

run();
