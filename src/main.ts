import * as core from '@actions/core';
import * as fs from 'fs';
import path from 'path';
import {
  GitHubContext,
  setStatus,
  wrapWithSetStatus
} from '@tangro/tangro-github-toolkit';
import { runLicenseCheck } from './runLicenseCheck';

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

  const context = JSON.parse(
    process.env.GITHUB_CONTEXT || ''
  ) as GitHubContext<{}>;

  try {
    await wrapWithSetStatus(context, 'license-check', async () => {
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
  } catch (error: any) {
    core.setFailed(error.message);
    fs.mkdirSync('license-check');
    fs.writeFileSync(
      path.join('license-check', 'index.html'),
      `<html><body><pre><code>${error.message}</code></pre></body></html>`
    );
    core.info('output written to license-check');

    await setStatus({
      context,
      description: error.message,
      state: 'failure',
      step: 'license-check'
    });
  }
}

run();
