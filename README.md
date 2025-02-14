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
        run: flutter pub get

      - name: Install DCM
        uses: CQLabs/setup-dcm@v2
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}

      - name: Run DCM
        uses: CQLabs/dcm-action@v2
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          ci-key: ${{ secrets.DCM_CI_KEY }}
          email: ${{ secrets.DCM_EMAIL }}
          analyze: true
          folders: lib
```

> [!WARNING]
> GitHub's `working-directory` option works only for `run` steps and has no effect when used with an action. You can find more info [in GitHub docs](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#jobsjob_iddefaultsrun).

## Migrating from v1

If you are migrating from dcm-action@v1, replace all `_` in the configuration option names with `-` (for example, `github_token` -> `github-token`). This change was made to make the github action options consistent with the CLI options.

## Inputs

> [!NOTE]
> If you have a DCM Open Source license, pass `oss` to both CI key and email inputs.

| Name                            | Required | Description                                                                                                                                                                                                                                                                                                                | Default                              |
| ------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| github-token                    | ☑️       | Required to post a report on GitHub. _Note:_ the secret [`GITHUB_TOKEN`](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/authenticating-with-the-github_token) is already provided by GitHub and you don't have to set it up yourself.                                                     |                                      |
| github-pat                      | [^1]     | [**Personal access token**](https://docs.github.com/en/github/authenticating-to-github/keeping-your-account-and-data-secure/creating-a-personal-access-token). Must have access to _repo_ and _read:user_ [scopes](https://docs.github.com/en/developers/apps/building-oauth-apps/scopes-for-oauth-apps#available-scopes). |                                      |
| ci-key                          | ☑️       | The license CI/CD key.                                                                                                                                                                                                                                                                                                     |                                      |
| email                           | ☑️       | The license email.                                                                                                                                                                                                                                                                                                         |                                      |
| pull-request-comment            |          | Add a comment with a report overview to your pull requests.                                                                                                                                                                                                                                                                | `true`                               |
| pull-request-comment-on-fail    |          | Add a comment with a report overview to your pull requests, but only when any DCM check fails. **Note**, when this option is enabled, `pull-request-comment` must be explicitly set to `false`.                                                                                                                            | `false`                              |
| package-name                    |          | Package name to differentiate the report. Set when running several DCM runs at once.                                                                                                                                                                                                                                       |                                      |
| **### General:**                |          |                                                                                                                                                                                                                                                                                                                            |                                      |
| folders                         |          | List of folders and files (comma separated) to scan.                                                                                                                                                                                                                                                                       | [`lib`]                              |
| exclude                         |          | List of files to exclude (in Glob syntax). If passing more than 1 glob pattern, wrap the list of patters into `{}`.                                                                                                                                                                                                        | {`**/*.g.dart`, `**/*.freezed.dart`} |
| exclude-public-api              |          | Exclude publicly exported code from the analysis output.                                                                                                                                                                                                                                                                   | `false`                              |
| fatal-found                     |          | Treat any found issue as fatal.                                                                                                                                                                                                                                                                                            | `true`                               |
| **### Commands:**               |          |                                                                                                                                                                                                                                                                                                                            |                                      |
| analyze                         |          | Run `dcm analyze` ([docs](https://dcm.dev/docs/cli/analysis/analyze/)).                                                                                                                                                                                                                                                    | `true`                               |
| analyze-assets                  |          | Run `dcm analyze-assets` ([docs](https://dcm.dev/docs/cli/analysis/analyze-assets/)). Supports additional options listed below.                                                                                                                                                                                            | `false`                              |
| analyze-widgets                 |          | Run `dcm analyze-widgets` ([docs](https://dcm.dev/docs/cli/analysis/analyze-widgets/)). Supports additional options listed below.                                                                                                                                                                                          | `false`                              |
| calculate-metrics               |          | Run `dcm calculate-metrics` ([docs](https://dcm.dev/docs/cli/metrics-caclulation/calculate-metrics/)).                                                                                                                                                                                                                     | `false`                              |
| check-code-duplication          |          | Run `dcm check-code-duplication` ([docs](https://dcm.dev/docs/cli/code-quality-checks/code-duplication/)). Supports additional options listed below.                                                                                                                                                                       | `false`                              |
| check-dependencies              |          | Run `dcm check-dependencies` ([docs](https://dcm.dev/docs/cli/code-quality-checks/check-dependencies/)). Supports additional options listed below.                                                                                                                                                                         | `false`                              |
| check-exports-completeness      |          | Run `dcm check-exports-completeness` ([docs](https://dcm.dev/docs/cli/code-quality-checks/exports-completeness/)).                                                                                                                                                                                                         | `false`                              |
| check-parameters                |          | Run `dcm check-parameters` ([docs](https://dcm.dev/docs/cli/code-quality-checks/check-parameters/)). Supports additional options listed below.                                                                                                                                                                             | `false`                              |
| check-unused-code               |          | Run `dcm check-unused-code` ([docs](https://dcm.dev/docs/cli/code-quality-checks/unused-code/)). Supports additional options listed below.                                                                                                                                                                                 | `false`                              |
| check-unused-files              |          | Run `dcm check-unused-files` ([docs](https://dcm.dev/docs/cli/code-quality-checks/unused-files/)).                                                                                                                                                                                                                         | `false`                              |
| check-unused-l10n               |          | Run `dcm check-unused-l10n` ([docs](https://dcm.dev/docs/cli/code-quality-checks/unused-l10n/)). Supports additional options listed below.                                                                                                                                                                                 | `false`                              |
| **### Analyze Assets:**         |          |                                                                                                                                                                                                                                                                                                                            |                                      |
| size                            |          | Size limit for image assets ([docs](https://dcm.dev/docs/cli/analysis/analyze-assets/#images-with-exceeding-size)). Supported formats: `10KB`, `1MB`, `100B`, etc.                                                                                                                                                         | `500KB`                              |
| webp                            |          | Require converting `.jpg` and `.png` images to `.webp` ([docs](https://dcm.dev/docs/cli/analysis/analyze-assets/#images-that-can-be-converted-to-webp-disabled-by-default)).                                                                                                                                               | `false`                              |
| naming                          |          | Required naming convention for image assets (`pascal`, `kebab` or `snake`) ([docs](https://dcm.dev/docs/cli/analysis/analyze-assets/#images-with-incorrect-naming-disabled-by-default)).                                                                                                                                   |                                      |
| resolution                      |          | Find missing or incorrect resolution-aware image assets ([docs](https://dcm.dev/docs/cli/analysis/analyze-assets/#incorrect-missing-or-unused-high-resolution-images)).                                                                                                                                                    | `true`                               |
| allowed-formats                 |          | List of allowed formats for particular folders (e.g. `icons:svg,img:jpg`) ([docs](https://dcm.dev/docs/cli/analysis/analyze-assets/#images-in-incorrect-folders-disabled-by-default)).                                                                                                                                     |                                      |
| **### Analyze Widgets:**        |          |                                                                                                                                                                                                                                                                                                                            |                                      |
| show-similarity                 |          | Include similar widgets into the report ([docs](https://dcm.dev/docs/cli/analysis/analyze-widgets/#detecting-similar-widgets-disabled-by-default)).                                                                                                                                                                        | `false`                              |
| similarity-threshold            |          | Set a minimum threshold after which widgets are considered similar.                                                                                                                                                                                                                                                        | `0.2`                                |
| **### Check Code Duplication:** |          |                                                                                                                                                                                                                                                                                                                            |                                      |
| per-package                     |          | Compare code for duplications only within one package ([docs](https://dcm.dev/docs/cli/code-quality-checks/code-duplication/#calculating-duplication-on-per-package-level)).                                                                                                                                               | `false`                              |
| exclude-overrides               |          | Exclude methods marked with `@override` ([docs](https://dcm.dev/docs/cli/code-quality-checks/code-duplication/#excluding-overrides)).                                                                                                                                                                                      | `false`                              |
| statements-threshold            |          | Minimum number of statements inside a declaration block ([docs](https://dcm.dev/docs/cli/code-quality-checks/code-duplication/#configuring-the-minimum-number-of-statements)).                                                                                                                                             | `3`                                  |
| **### Check Dependencies:**     |          |                                                                                                                                                                                                                                                                                                                            |                                      |
| ignored-packages                |          | Package names that should be ignored ([docs](https://dcm.dev/docs/cli/code-quality-checks/check-dependencies/#ignoring-particular-packages-from-the-report)).                                                                                                                                                              |                                      |
| **### Check Parameters:**       |          |                                                                                                                                                                                                                                                                                                                            |                                      |
| show-same-value                 |          | Include parameters that always get the same constant argument ([docs](https://dcm.dev/docs/cli/code-quality-checks/check-parameters/#parameters-with-the-same-value)).                                                                                                                                                     | `false`                              |
| show-unused-default-value       |          | Include parameters with default values that always get an argument ([docs](https://dcm.dev/docs/cli/code-quality-checks/check-parameters/#parameters-with-unused-default-values)).                                                                                                                                         | `false`                              |
| show-redundant                  |          | Include parameters whose values are always passed with another parameter ([docs](https://dcm.dev/docs/cli/code-quality-checks/check-parameters/#redundant-parameters)).                                                                                                                                                    | `false`                              |
| show-unused-vft                 |          | Include `@visibleForTesting` parameters that are never used in tests ([docs](https://dcm.dev/docs/cli/code-quality-checks/check-parameters/#parameters-with-unused-visiblefortesting-annotations)).                                                                                                                        | `false`                              |
| show-broad-types                |          | Include parameters whose types can be made more specific ([docs](https://dcm.dev/docs/cli/code-quality-checks/check-parameters/#parameters-with-broad-types)).                                                                                                                                                             | `false`                              |
| **### Check Unused Code:**      |          |                                                                                                                                                                                                                                                                                                                            |                                      |
| no-exclude-overridden           |          | Do not treat overridden members as always used ([docs](https://dcm.dev/docs/cli/code-quality-checks/unused-code/#excluding-public-api)).                                                                                                                                                                                   | `false`                              |
| **### Check Unused L10n:**      |          |                                                                                                                                                                                                                                                                                                                            |                                      |
| class-pattern                   |          | Regular expression for class names to detect classes that provide localization (for example, `^AppLocalizations$`).                                                                                                                                                                                                        | `^AppLocalizations$`                 |

[^1]: Required if you have a private GitHub repository in the package dependencies.

## License

See the [LICENSE](LICENSE) file.

## Version History

Please see our [CHANGELOG.md](CHANGELOG.md) file.
