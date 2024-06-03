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
  const url = `https://raw.githubusercontent.com/${source.repo}/${source.branch}/releases/${inputs.search}.json`
  const releasesData = await fetch(url).then(res => res.json())
  core.info(`Fetched data from ${url}`)

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
  for (const key in releasesData) {
    if (Object.hasOwnProperty.call(releasesData, key)) {
      await core.group(`Processing "${key}" data...`, () => {
        const releases = releasesData[key]
        let result = []
        for (const iterator of Object.entries(releases)) {
          const [version, release] = iterator

          // Check if date is satisfied by the input date, if set
          if (inputs.date) {
            const tmpDate = (release.date || release.releaseDate) || ""
            if (!tmpDate) return false
            if (!semdate.satisfies(tmpDate, inputs.date)) {
              continue
            }
          }

          // Check if version is satisfied by the input version, if set
          if (inputs.version) {
            if (!semver.satisfies(version, inputs.version)) {
              continue
            }
          }

          // Add to result
          result.push(iterator)

          // Log the message
          core.info(`- The ${key} '${JSON.stringify(release)}' satisfies the queries.`)
        }

        // Add result to output
        matrix[key] = result
      })
    } // if (Object.hasOwnProperty.call(data, key))
  } // for (const key in data)

  if (matrix.releases.length && matrix.versions.length) {
    core.setFailed([
      "No result found for the given query, please check the input values or the source data.",
      `Visit ${url} to check the source data.`,
    ].join("\n"))
    return
  }

  // Post-process the matrix
  for (const key in matrix) {
    if (Object.hasOwnProperty.call(matrix, key)) {
      await core.group(`Post-processing for "${key}"...`, async () => {
        const items = matrix[key]
        if (items.length === 0) {
          core.info(`- Remove the "${key}" from the matrix to avoid empty arrays which will cause the job to fail`)
          delete matrix[key]
        } else {
          core.info("- Removing duplicates and sorting the versions")
          matrix[key] = Array
            .from(matrix[key])
            .map(([version]) => version) // Map the result version only
            .sort(compareVersions) // Sort the versions

          matrix[key] = Array.from(new Set(matrix[key])) // Remove duplicates

          // Limit the result, if limit is set
          if (inputs.limit) {
            inputs.limit = parseInt(inputs.limit)
            if (inputs.limit < 0) {
              core.error("Limit should be a positive integer")
              return
            }
            core.info(`Set "${key}" limit to ${inputs.limit}`)
            matrix[key] = matrix[key].reverse().splice(0, inputs.limit).reverse()
          }
        }
      })
    }
  }

  // Show a summary of the matrix
  await core.group("Matrix summary", () => core.info(JSON.stringify(matrix, null, 2)))

  // Set the output variables
  core.setOutput("matrix", JSON.stringify(matrix));
  if ('releases' in matrix) {
    core.setOutput("releases", JSON.stringify(matrix.releases));
  }
  if ('versions' in matrix) {
    core.setOutput("versions", JSON.stringify(matrix.versions));
  }
}

main()
