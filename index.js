const core = require('@actions/core');
const fetch = require('node-fetch');
const semver = require('semver');
const { compareVersions } = require('compare-versions');
const semdate = require('./semdate')

const defaults = {
  repo: "endoflife-date/release-data",
  branch: "main",
}

let is_default_limit = false;

async function main() {
  const inputs = {
    search: core.getInput('search', { required: true }),
    date: core.getInput('date'),
    version: core.getInput('version'),
    limit: core.getInput('limit'),
    strict: core.getInput('strict') === 'true',
  }

  const source = {
    repo: core.getInput('source-repo') || defaults.repo,
    branch: core.getInput('source-branch') || defaults.branch,
  }

  core.info(
    !inputs.date
      ? `Searching for "${inputs.search}" from "${source.repo}@${source.branch}"...`
    : `Searching for "${inputs.search}" released in "${inputs.date}" from "${source.repo}@${source.branch}"...`
  )
  const data = await fetch(`https://raw.githubusercontent.com/${source.repo}/${source.branch}/releases/${inputs.search}.json`).then(res => res.json())

  // Filter by date
  if (inputs.date) {
    core.info(`Set filter by date: ${inputs.date}`)
  }

  // Filter by version
  if (inputs.version) {
    core.info(`Set filter by version: ${inputs.version}`)
  }

  // Prepare outputs matrix
  // Adopt the new releases JSON fromat, https://github.com/endoflife-date/release-data/issues/51
  const matrix = { releases: [], versions: [], }

  // Process release data
  for (const key in data) {
    if (Object.hasOwnProperty.call(data, key)) {
      const targetData = data[key]
      const result = Object.entries(targetData)
        // Check if date is satisfied by the input date, if set
        .filter(([version, item]) => {
          if (!inputs.date) return true
          const tmpDate = (item.date || item.releaseDate) || ""
          if (!tmpDate) return false
          return semdate.satisfies(tmpDate, inputs.date)
        })
        // Check if version is satisfied by the input version, if set
        .filter(([version, item]) => {
          if (!inputs.version) return true
          return semver.satisfies(version, inputs.version)
        })
        // Sort by version
        .sort(([a], [b]) => compareVersions(a, b))
        .map(([version]) => version)

      // Limit the result, if limit is set
      if (inputs.limit) {
        inputs.limit = parseInt(inputs.limit)
        if (inputs.limit < 0) {
          core.error("Limit should be a positive integer")
        }
        core.info(`Set "${key}" limit to ${inputs.limit}`)
        result.splice(0, inputs.limit)
      }

      // Add result to output
      matrix[key] = result
    } // if (Object.hasOwnProperty.call(data, key))
  } // for (const key in data)

  // Set outputs matrix
  core.info("matrix:")
  core.info("----------------------------------------")
  core.info(JSON.stringify(matrix))
  core.info("----------------------------------------")
  core.setOutput("matrix", JSON.stringify(matrix));
}

main()
