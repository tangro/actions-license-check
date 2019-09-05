import checker from 'license-checker';

export async function runLicenseCheck(allowedLicenses: string) {
  return new Promise((resolve, reject) => {
    checker.init(
      {
        start: process.env.RUNNER_WORKSPACE as string,
        onlyAllow: allowedLicenses
      },
      (error: Error, packages: checker.ModuleInfos) => {
        if (error) {
          console.log(error);
          reject(error);
        } else {
          console.log(packages);
          resolve();
        }
      }
    );
  });
}
