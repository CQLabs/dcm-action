# DCM Action

`dcm-action` runs [DCM](https://dcm.dev/) checks in GitHub Actions.

> [!NOTE]
> This action requires write permissions for `checks` and `pull-requests`. For more information, refer to GitHub docs [here](https://docs.github.com/en/actions/writing-workflows/choosing-what-your-workflow-does/controlling-permissions-for-github_token#defining-access-for-the-github_token-permissions) and [here](https://docs.github.com/en/actions/security-for-github-actions/security-guides/automatic-token-authentication#modifying-the-permissions-for-the-github_token).

## Usage Example

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
        uses: CQLabs/setup-dcm@v1
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}

      - name: Run DCM
        uses: CQLabs/dcm-action@v1
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          ci_key: ${{ secrets.DCM_CI_KEY }}
          email: ${{ secrets.DCM_EMAIL }}
          folders: lib
```

> [!WARNING]
> GitHub's `working-directory` option works only for `run` steps and has no effect when used with an action. You can find more info [in GitHub docs](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#jobsjob_iddefaultsrun).

## Inputs

<style>
table th:first-of-type {
    width: 20%;
}
table th:nth-of-type(2) {
    width: 10%;
}
table th:nth-of-type(3) {
    width: 60%;
}
table th:nth-of-type(4) {
    width: 10%;
}
</style>

### Action Configuration

| Name               | Required                                                                  | Description                                                                                                                                                                                                                                                                                                         | Default |
| ------------------ | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| github-token       | ☑️                                                                        | Required to post a report on GitHub. _Note:_ the secret [`GITHUB_TOKEN`](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/authenticating-with-the-github_token) is already provided by GitHub and you don't have to set it up yourself.                                              |         |
| github-pat         | Required if you had private GitHub repository in the package dependencies | [**Personal access token**](https://docs.github.com/en/github/authenticating-to-github/keeping-your-account-and-data-secure/creating-a-personal-access-token) must access to _repo_ and _read:user_ [scopes](https://docs.github.com/en/developers/apps/building-oauth-apps/scopes-for-oauth-apps#available-scopes) |         |
| ci-key             | ☑️                                                                        | The license CI/CD key.                                                                                                                                                                                                                                                                                              |         |
| ci-email           | ☑️                                                                        | The license email.                                                                                                                                                                                                                                                                                                  |         |
| pr-comment         |                                                                           | Publish a report overview directly into your pull requests.                                                                                                                                                                                                                                                         | `true`  |
| pr-comment-on-fail |                                                                           | Publish a report overview directly into your pull requests, but only when any DCM check fails. **Note**, when this option is enabled, `pr-comment` must be explicitly set to `false`.                                                                                                                               | `false` |
| package-name       |                                                                           | Package name to differentiate the report. Set when running several DCM runs at once.                                                                                                                                                                                                                                |         |

> [!NOTE]
> If you have a DCM Open Source license, pass `oss` to both CI key and email inputs.

### General

| Name               | Required | Description                                              | Default                             |
| ------------------ | -------- | -------------------------------------------------------- | ----------------------------------- |
| folders            |          | List of folders and files (separated by comma) to scan.  | [`lib`]                             |
| exclude            |          | List of files to exclude (in Glob syntax).               | `"{**/*.g.dart,**/*.freezed.dart}"` |
| exclude-public-api |          | Exclude publicly exported code from the analysis output. | `false`                             |
| fatal-found        |          | Treat any found issue as fatal.                          | `true`                              |

### Commands

| Name                       | Required | Description                           | Default |
| -------------------------- | -------- | ------------------------------------- | ------- |
| analyze                    |          | Run `dcm analyze`.                    | `true`  |
| analyze-assets             |          | Run `dcm analyze-assets`.             | `false` |
| analyze-widgets            |          | Run `dcm analyze-widgets`.            | `false` |
| calculate-metrics          |          | Run `dcm calculate-metrics`.          | `false` |
| check-code-duplication     |          | Run `dcm check-code-duplication`.     | `false` |
| check-dependencies         |          | Run `dcm check-dependencies`.         | `false` |
| check-exports-completeness |          | Run `dcm check-exports-completeness`. | `false` |
| check-parameters           |          | Run `dcm check-parameters`.           | `false` |
| check-unused-code          |          | Run `dcm check-unused-code`.          | `false` |
| check-unused-files         |          | Run `dcm check-unused-files`.         | `false` |
| check-unused-l10n          |          | Run `dcm check-unused-l10n`.          | `false` |

### Analyze Assets

| Name            | Required | Description                                                                 | Default |
| --------------- | -------- | --------------------------------------------------------------------------- | ------- |
| size            |          | Size limit for image assets.                                                | `500KB` |
| webp            |          | Require converting `.jpg` and `.png` images to `.webp`.                     | `false` |
| naming          |          | Required naming convention for image assets (`pascal`, `kebab` or `snake`). |         |
| resolution      |          | Find missing or incorrect resolution-aware image assets.                    | `true`  |
| allowed-formats |          | List of allowed formats for particular folders (e.g. `icons:svg`).          |         |

### Analyze Widgets

| Name            | Required | Description                                                         | Default |
| --------------- | -------- | ------------------------------------------------------------------- | ------- |
| show-similarity |          | Include similar widgets into the report.                            | `false` |
| threshold       |          | Set a minimum threshold after which widgets are considered similar. | `0.2`   |

### Check Code Duplication

| Name                 | Required | Description                                              | Default |
| -------------------- | -------- | -------------------------------------------------------- | ------- |
| per-package          |          | Compare code for duplications only within one package.   | `false` |
| exclude-overrides    |          | Exclude methods marked with `@override`.                 | `false` |
| statements-threshold |          | Minimum number of statements inside a declaration block. | `3`     |

### Check Dependencies

| Name             | Required | Description                           | Default |
| ---------------- | -------- | ------------------------------------- | ------- |
| ignored-packages |          | Package names that should be ignored. |         |

### Check Parameters

| Name                      | Required | Description                                                               | Default |
| ------------------------- | -------- | ------------------------------------------------------------------------- | ------- |
| show-same-value           |          | Include parameters that always get the same constant argument.            | `false` |
| show-unused-default-value |          | Include parameters with default values that always get an argument.       | `false` |
| show-redundant            |          | Include parameters whose values are always passed with another parameter. | `false` |
| show-unused-vft           |          | Include `@visibleForTesting` parameters that are never used in tests.     | `false` |
| show-broad-types          |          | Include parameters whose types can be made more specific.                 | `false` |

### Check Unused Code

| Name                  | Required | Description                                     | Default |
| --------------------- | -------- | ----------------------------------------------- | ------- |
| no-exclude-overridden |          | Do not treat overridden members as always used. | `false` |

### Check Unused L10n

| Name          | Required | Description                                                                                                         | Default              |
| ------------- | -------- | ------------------------------------------------------------------------------------------------------------------- | -------------------- |
| class-pattern |          | Regular expression for class names to detect classes that provide localization (for example, `^AppLocalizations$`). | `^AppLocalizations$` |

## License

See the [LICENSE](LICENSE) file.

## Version History

Please see our [CHANGELOG.md](CHANGELOG.md) file.
