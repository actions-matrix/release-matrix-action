# release-matrix-action

[![units-test](https://github.com/actions-matrix/release-matrix-action/actions/workflows/test.yml/badge.svg)](https://github.com/actions-matrix/release-matrix-action/actions/workflows/test.yml)

GitHub Action to generate matrix using ["endoflife-date/release-data"](https://github.com/endoflife-date/release-data) dataset.

## Usage

You can now consume the action by referencing the `main` branch

```yaml
name: Test

on:
  push:
    branches:
      - main

jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - id: release
        uses: actions-matrix/release-matrix-action@main
    outputs:
      matrix: ${{ steps.release.outputs.matrix }}

  build:
    runs-on: ubuntu-latest
    needs: generate
    strategy:
      matrix: ${{ fromJson(needs.generate.outputs.matrix) }}
    steps:
      - run: echo "Build ${{ matrix.version }}"
```

**Example**

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://github.com/actions-matrix/release-matrix-action/assets/4363857/fc5b4255-d1f4-4334-b2e3-bbb3274bf58a">
  <source media="(prefers-color-scheme: light)" srcset="https://github.com/actions-matrix/release-matrix-action/assets/4363857/b1fcd735-aad5-420e-a907-fe2a6e255cae">
  <img alt="Screenshot" src="https://github.com/actions-matrix/release-matrix-action/assets/4363857/b1fcd735-aad5-420e-a907-fe2a6e255cae">
</picture>

## Inputs

- `search`: The search keyword for release data
- `date`: Set the filter for the release by date, e.g: 2023-01-01, 2023
- `version`: Set the filter for the release by version, e.g: 1.0
- `limit`: Set the limit for the number of releases to output, default: 3

## Outputs

- `matrix`: The matrix of releases

**Example**

```json
{"versions":["1.23.3","1.23.4","1.24.0","1.25.0","1.25.1"]}
```

## License
Licensed under the [MIT License](./LICENSE).
