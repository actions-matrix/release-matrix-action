# release-matrix-action

[![units-test](https://github.com/actions-matrix/release-matrix-action/actions/workflows/test.yml/badge.svg)](https://github.com/actions-matrix/release-matrix-action/actions/workflows/test.yml)

GitHub Action to generate matrix using "endoflife-date/release-data" dataset

## Usage

You can now consume the action by referencing the `main` branch

```yaml
uses: actions-matrix/release-matrix-action@main
with:
  query: nginx
```

## Inputs

- `query`: The search query for release data
- `date`: Set the filter for the release by date, e.g: 2023-01-01, 2023
- `version`: Set the filter for the release by version, e.g: 1.0
- `limit`: Set the limit for the number of releases to output, default: 3

## Outputs

- `matrix`: The matrix of releases
- `versions`: The release versions
- `release_dates`: The release dates
