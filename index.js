const core = require('@actions/core');
const fetch = require('node-fetch');
const { compareVersions } = require('compare-versions');

// !!! IMPORTANT !!!
//
// The releases JSON format has been changed, so we need to use the specific commit hash
// See https://github.com/endoflife-date/release-data/issues/51
//
// The actions-matrix/release-matrix-action@v1 has now been marked as deprecated and will be archived soon.

const config = {
  release_data: "endoflife-date/release-data",
  tag: "b79b71518d4afaf334fd9633e6d10cb041c0a7ca"
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
  [
    "The `actions-matrix/release-matrix-action@v1` has now been marked as deprecated.",
    "",
    "The releases JSON format has been changed, so we need to use the specific commit hash `b79b71518d4afaf334fd9633e6d10cb041c0a7ca`.",
    "See https://github.com/endoflife-date/release-data/issues/51",
  ].forEach(core.warning)

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

    if (!inputs.date && !inputs.version) {
      if (inputs.limit === "") {
        inputs.limit = defaults.limit
        defaults.is_limit_default = true
      }
    }

    if (inputs.limit !== "") {
      inputs.limit = parseInt(inputs.limit)
  
      if (inputs.limit <= 0) {
        throw new Error("The limit input cannot be less than or equal zero.")
      }
  
      core.info(`Set releases limit by: ${inputs.limit} ${defaults.is_limit_default ? "(default)" : ""}`)
      releases = releases.reverse().splice(0, inputs.limit).reverse()
    }

    
    if (releases.length === 0) {
      throw new Error("No releases found.")
    }
    
    const matrix = { version: [] }

    releases.forEach(([ver]) => {
      matrix.version.push(ver)
    })

    core.setOutput("matrix", jsonToMatrix(matrix));
    core.setOutput("version", jsonToMatrix(matrix.version));
    
    core.info(`Output: ${jsonToMatrix(matrix)}`)
  } catch (error) {
    core.setFailed(error.message);
  }
}

run()
