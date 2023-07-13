const core = require('@actions/core');
const fetch = require('node-fetch');
const { compareVersions } = require('compare-versions');

const config = {
  release_data: "endoflife-date/release-data",
  tag: "master"
}

const defaults = {
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

    if (inputs.limit === 0) {
      throw new Error("The limit input cannot be zero.")
    }

    if (!inputs.date || !inputs.version) {
      inputs.limit = defaults.limit
      core.info("The limit input is set to default.")
    } else {
      core.info("The limit input is set to custom.")
    }

    inputs.limit = parseInt(inputs.limit)
    core.info(`Set releases limit by: ${inputs.limit}`)
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
