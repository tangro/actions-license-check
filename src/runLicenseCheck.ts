import { exec } from '@actions/exec';
import { ExecOptions } from '@actions/exec/lib/interfaces';

export async function runLicenseCheck(allowedLicenses: string) {
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
