/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
import * as core from '@actions/core';
import * as exec from '@actions/exec';

// eslint-disable-next-line import/prefer-default-export
export async function setGitHubAuth(pat: string): Promise<void> {
  if (!pat.length) return;

  core.startGroup('Configuring GitHub Auth');

  const hosts = new Map([
    ['https://github.com/', 'https://x-access-token:$token@github.com/'],
    ['git@github.com:', 'https://x-access-token:$token@github.com/'],
  ]);

  for (const [key, value] of hosts) {
    const gitResult = await exec.getExecOutput('git', [
      'config',
      '--global',
      `url.${value}.insteadOf`,
      key,
    ]);

    core.debug(`Rewrite any "${key}" to "${value}"`);
    core.debug(`return code ${gitResult.exitCode}`);
  }

  core.endGroup();
}
