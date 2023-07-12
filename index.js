const core = require('@actions/core');
const fetch = require('node-fetch');
const { compareVersions } = require('compare-versions');

const config = {
  release_data: "endoflife-date/release-data",
  tag: "master"
}

async function getReleaseData(query) {
  return fetch(`https://raw.githubusercontent.com/${config.release_data}/${config.tag}/releases/${query}.json`)
    .then(res => res.json())
}

function jsonToMatrix(json) {
  return JSON.stringify(json)
}

// most @actions toolkit packages have async methods
async function run() {
  try {
    const action = {
      search: core.getInput('search'),
      date: core.getInput('date'),
      version: core.getInput('version'),
      limit: core.getInput('limit'),
    }

    if (action.search == "") {
      core.setFailed("The search input is required.")
      return
    }

    const data = await getReleaseData(action.search)

    // The data is a JSON object that the key is the version and the value is the release date
    // filter data for the version that are release in 2022
    let releases = Object.entries(data)
      .filter(([, release_date]) => {
        if (!action.date) return true
        return new Date(release_date) >= new Date(action.date)
      })
      .filter(([ver]) => {
        if (!action.version) return true
        return ver.startsWith(action.version)
      })
      .sort(([a], [b]) => compareVersions(a, b))

    if (action.limit === 0) {
      core.setFailed("The limit input cannot be zero.")
      return
    } else if (action.limit > 0) {
      releases = releases.reverse().splice(0, 5).reverse()
    }

    const matrix = { versions: [] }

    releases.forEach(([ver]) => {
      matrix.versions.push(ver)
    })

    core.setOutput("matrix", jsonToMatrix(matrix));

  } catch (error) {
    core.setFailed(error.message);
  }
}

run()
