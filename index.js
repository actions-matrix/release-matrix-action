const core = require('@actions/core');
const fetch = require('node-fetch');
const { compareVersions } = require('compare-versions');

const config = {
  release_data: "endoflife-date/release-data",
  tag: "master"
}

const defaults = {
  is_limit_default: false,
  limit: "3"
}

async function getReleaseData(query) {
  const res = await fetch(`https://raw.githubusercontent.com/${config.release_data}/${config.tag}/releases/${query}.json`)
  const data = await res.json()
  return data
}

function jsonToMatrix(json) {
  return JSON.stringify(json)
}

// most @actions toolkit packages have async methods
async function run() {
  try {
    const inputs = {
      search: core.getInput('search'),
      date: core.getInput('date'),
      version: core.getInput('version'),
      limit: core.getInput('limit'),
    }

    if (inputs.search == "") {
      throw new Error("The search input is required.")
    }
    core.info(`Search for release of: ${inputs.search}`)

    const data = await getReleaseData(inputs.search)

    if (inputs.date) core.info(`Set releases filter by date: ${inputs.date}`)
    if (inputs.version) core.info(`Set releases filter by version: ${inputs.version}`)

    // The data is a JSON object that the key is the version and the value is the release date
    // filter data for the version that are release in 2022
    let releases = Object.entries(data)
      .filter(([, release_date]) => {
        if (!inputs.date) return true
        return new Date(release_date) >= new Date(inputs.date)
      })
      .filter(([ver]) => {
        if (!inputs.version) return true
        return ver.startsWith(inputs.version)
      })
      .sort(([a], [b]) => compareVersions(a, b))

    if (!inputs.date || !inputs.version) {
      if (inputs.limit === "") {
        inputs.limit = defaults.limit
        defaults.is_limit_default = true
      }
    } else {
      if (inputs.limit === "") {
        inputs.limit = defaults.limit
        defaults.is_limit_default = true
      }
    }

    inputs.limit = parseInt(inputs.limit)

    if (inputs.limit === 0) {
      throw new Error("The limit input cannot be zero.")
    }

    core.info(`Set releases limit by: ${inputs.limit} ${defaults.is_limit_default ? "(default)" : ""}`)
    releases = releases.reverse().splice(0, inputs.limit).reverse()

    const matrix = { version: [] }

    releases.forEach(([ver]) => {
      matrix.version.push(ver)
    })

    core.setOutput("matrix", jsonToMatrix(matrix));
    core.info(`Output: ${jsonToMatrix(matrix)}`)
  } catch (error) {
    core.setFailed(error.message);
  }
}

run()
