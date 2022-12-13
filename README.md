# tangro/actions-license-check

A @tangro action to check whether a dependency uses an allowed license. We use [license-checker](https://www.npmjs.com/package/license-checker) to retrieve the license of the dependencies.

By default these licenses are allowed:

- `MIT`
- `Apache-2.0`
- `ISC`
- `Custom: https://www.telerik.com/kendo-angular-ui/`
- `BSD`

> **Important** We only check production dependencies and only 0 direct production dependencies

# Version

You can use a specific `version` of this action. The latest published version is `v1.0.12`. You can also use `latest` to always get the latest version.

# Example job

```yml
license-check:
  runs-on: ubuntu-latest
  steps:
    - name: Checkout latest code
      uses: actions/checkout@v3
    - name: Use Node.js 16.x
      uses: actions/setup-node@v3.5.1
      with:
        node-version: 16.x
    - name: Authenticate with GitHub package registry
      run: echo "//npm.pkg.github.com/:_authToken=${{ secrets.ACCESS_TOKEN }}" >> ~/.npmrc
    - name: Run npm install
      run: npm install
    - name: Check licenses
      uses: tangro/actions-license-check@v1.0.12
      with:
        allowed-licenses: 'MIT; ISC; Apache-2.0; Custom: https://www.telerik.com/kendo-angular-ui/; Custom: https://www.telerik.com/kendo-react-ui/; BSD'
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        GITHUB_CONTEXT: ${{ toJson(github) }}
```

> **Attention** Do not forget to pass `GITHUB_TOKEN` and `GITHUB_CONTEXT`

Steps this example job will perform:

1. Check out the latest code
2. Use node v16
3. Run `npm install` - Sadly we need to install the dependencies to check the licenses
4. (this action) Run the license check

# Usage

This action will run `npx license-checker --production --json --onlyAllow=${allowedLicenses}` to check the licenses.

This action will set a status to the commit to `pending` under the context `Tangro CI/license-check`. When it finishes successfully it will change the status to `success` and the license-check result will be displayed in the description. If the license check fails the status will set the status to `failed`.

The action will write the data to `./license-check/index.html`. This file can be deployed to a static file server.

# Using with a static file server

You can also publish the test results to a static file server. The action will write the results into `dependencies/index.html`.

You can publish the results with our custom [deploy actions](https://github.com/tangro/actions-deploy)

```yml
license-check:
  runs-on: ubuntu-latest
  steps:
    - name: Checkout latest code
      uses: actions/checkout@v3
    - name: Use Node.js 16.x
      uses: actions/setup-node@v3.5.1
      with:
        node-version: 16.x
    - name: Authenticate with GitHub package registry
      run: echo "//npm.pkg.github.com/:_authToken=${{ secrets.ACCESS_TOKEN }}" >> ~/.npmrc
    - name: Run npm install
      run: npm install
    - name: Check licenses
      uses: tangro/actions-license-check@v1.0.12
      with:
        allowed-licenses: 'MIT; ISC; Apache-2.0; Custom: https://www.telerik.com/kendo-angular-ui/; Custom: https://www.telerik.com/kendo-react-ui/; BSD'
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        GITHUB_CONTEXT: ${{ toJson(github) }}
    - name: Zip license check result
      if: always()
      run: |
        cd license-check
        zip --quiet --recurse-paths ../license-check.zip *
    - name: Deploy license check result
      if: always()
      uses: tangro/actions-deploy@v1.2.14
      with:
        context: auto
        zip-file: license-check.zip
        deploy-url: ${{secrets.DEPLOY_URL}}
        project: license-check
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        GITHUB_CONTEXT: ${{ toJson(github) }}
        DEPLOY_PASSWORD: ${{ secrets.DEPLOY_PASSWORD }}
        DEPLOY_USER: ${{ secrets.DEPLOY_USER }}
```

# Arguments

You have to specify the allowed licenses with `allowed-licenses`. They have to be separated by a semicolon.
