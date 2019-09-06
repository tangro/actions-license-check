import { exec } from '@actions/exec';
import { ExecOptions } from '@actions/exec/lib/interfaces';
import { GitHubContext } from '@tangro/tangro-github-toolkit';
import path from 'path';

export async function runLicenseCheck({
  context,
  allowedLicenses
}: {
  context: GitHubContext;
  allowedLicenses: string;
}) {
  const [owner, repo] = context.repository.split('/');

  let stdout = '';
  let stderr = '';

  const options: ExecOptions = {
    ignoreReturnCode: true,
    listeners: {
      stdout: data => {
        stdout += data.toString();
      },
      stderr: data => {
        stderr += data.toString();
      }
    }
  };

  await exec(
    'npx',
    [
      `-start=${path.join(process.env.RUNNER_WORKSPACE, repo)}`,
      '-q',
      'license-checker',
      '--production',
      '--json',
      `--onlyAllow=${allowedLicenses}`
    ],
    options
  );

  if (stderr.length > 0) {
    throw new Error(stderr);
  } else {
    return stdout;
  }
}
