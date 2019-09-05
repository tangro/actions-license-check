import * as core from '@actions/core';
import { GitHubContext } from '@tangro/tangro-github-toolkit';

async function run() {
  try {
    if (
      !process.env.GITHUB_CONTEXT ||
      process.env.GITHUB_CONTEXT.length === 0
    ) {
      throw new Error(
        'You have to set the GITHUB_CONTEXT in your secrets configuration'
      );
    }
    if (!process.env.GITHUB_TOKEN || process.env.GITHUB_TOKEN.length === 0) {
      throw new Error(
        'You have to set the GITHUB_TOKEN in your secrets configuration'
      );
    }

    const context = JSON.parse(
      process.env.GITHUB_CONTEXT || ''
    ) as GitHubContext;

    const [owner, repo] = context.repository.split('/');

    console.log(core.getInput('allowed-licenses'));

    core.debug('debug message');
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
