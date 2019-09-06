import * as core from '@actions/core';
import * as fs from 'fs';
import path from 'path';
import { GitHubContext, setStatus } from '@tangro/tangro-github-toolkit';
import { runLicenseCheck } from './runLicenseCheck';
import { Result } from './Result';

async function wrapWithSetStatus<T>(
  context: GitHubContext,
  step: string,
  code: () => Promise<Result<T>>
) {
  setStatus({
    context,
    step,
    description: `Running ${step}`,
    state: 'pending'
  });

  try {
    const result = await code();
    setStatus({
      context,
      step,
      description: result.shortText,
      state: result.isOkay ? 'success' : 'failure'
    });
    return result;
  } catch (error) {
    setStatus({
      context,
      step,
      description: `Failed: ${step}`,
      state: 'failure'
    });
    core.setFailed(`CI failed at step: ${step}`);
  }
}

async function run() {
  if (!process.env.GITHUB_CONTEXT || process.env.GITHUB_CONTEXT.length === 0) {
    throw new Error(
      'You have to set the GITHUB_CONTEXT in your secrets configuration'
    );
  }
  if (!process.env.GITHUB_TOKEN || process.env.GITHUB_TOKEN.length === 0) {
    throw new Error(
      'You have to set the GITHUB_TOKEN in your secrets configuration'
    );
  }

  const context = JSON.parse(process.env.GITHUB_CONTEXT || '') as GitHubContext;

  try {
    wrapWithSetStatus(context, 'license-check', async () => {
      const allowedLicenses = core.getInput('allowed-licenses');
      const output = await runLicenseCheck({ context, allowedLicenses });
      fs.mkdirSync('license-check');
      fs.writeFileSync(
        path.join('license-check', 'index.html'),
        `<html><body><pre><code>${output}</code></pre></body></html>`
      );

      return {
        metadata: JSON.parse(output),
        isOkay: true,
        shortText: 'All used licenses are allowed',
        text: output
      };
    });
  } catch (error) {
    core.setFailed(error.message);
    fs.mkdirSync('license-check');
    fs.writeFileSync(
      path.join('license-check', 'index.html'),
      `<html><body><pre><code>${error.message}</code></pre></body></html>`
    );

    setStatus({
      context,
      description: error.message,
      state: 'failure',
      step: 'license-check'
    });
  }
}

run();
