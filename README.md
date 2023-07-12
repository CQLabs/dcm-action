# DCM Action

`dcm-action` runs [DCM](https://dcm.dev/) checks in GitHub Actions.

## Usage example

```yml
name: DCM

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3

      - name: Install Dart and Flutter
        uses: subosito/flutter-action@v2

      - name: Install dependencies
        run: dart pub get

      - name: Install DCM
        uses: CQLabs/setup-dcm@v1.0.0
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}

      - name: Run DCM
        uses: CQLabs/dcm-action@v1.0.1
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          ci_key: ${{ secrets.DCM_CI_KEY }}
          email: ${{ secrets.DCM_EMAIL }}
          folders: lib
```

## Inputs

The action takes the following inputs:

| Name                                  | Required                                                                  | Description                                                                                                                                                                                                                                                                                                         | Default                                   |
| :------------------------------------ | :------------------------------------------------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :---------------------------------------- |
| **github_token**                      | ☑️                                                                         | Required to post a report on GitHub. _Note:_ the secret [`GITHUB_TOKEN`](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/authenticating-with-the-github_token) is already provided by GitHub and you don't have to set it up yourself.                                              |                                           |
| **github_pat**                        | Required if you had private GitHub repository in the package dependencies | [**Personal access token**](https://docs.github.com/en/github/authenticating-to-github/keeping-your-account-and-data-secure/creating-a-personal-access-token) must access to _repo_ and _read:user_ [scopes](https://docs.github.com/en/developers/apps/building-oauth-apps/scopes-for-oauth-apps#available-scopes) |                                           |
| **ci_key**                            | ☑️                                                                         | License key to run on CI server.                                                                                                                                                                                                                                                                                    |                                           |
| **email**                             | ☑️                                                                         | Email used to purchase the license.                                                                                                                                                                                                                                                                                 |                                           |
| **folders**                           | ☑️                                                                         | List of folders and files (separated by commas) to scan.                                                                                                                                                                                                                                                            | [`lib`]                                   |
| **pull_request_comment**              |                                                                           | Publish report overview directly into your pull request.                                                                                                                                                                                                                                                            | `true`                                    |
| **package_name**                      |                                                                           | Package name to differentiate the report. Set when running several DCM runs at once.                                                                                                                                                                                                                                |                                           |
| **fatal_performance**                 |                                                                           | Treat performance level issues as fatal.                                                                                                                                                                                                                                                                            | `true`                                    |
| **fatal_style**                       |                                                                           | Treat style level issues as fatal.                                                                                                                                                                                                                                                                                  | `true`                                    |
| **fatal_warnings**                    |                                                                           | Treat warning level issues as fatal.                                                                                                                                                                                                                                                                                | `true`                                    |

## License

See the [LICENSE](LICENSE) file.

## Version history

Please see our [CHANGELOG.md](CHANGELOG.md) file.
