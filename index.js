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

// most @actions toolkit packages have async methods
async function run() {
  try {
    const action = {
      query: core.getInput('query'),
      date: core.getInput('date'),
      version: core.getInput('version'),
      limit: core.getInput('limit'),
    }

    if (action.query == "") {
      core.setFailed("The query input is required.")
    }

    const data = await getReleaseData(action.query)

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
      throw new Error("Limit must be greater than 0")
    } else if (action.limit > 0) {
      releases = releases.reverse().splice(0, 5).reverse()
    }

    const versions = []
    const release_dates = []
    const matrix = releases.map(([ver, release_date]) => {
      versions.push(ver)
      release_dates.push(release_date)
      return { version: ver, release_date }
    })


    core.setOutput("matrix", JSON.stringify(matrix));
    core.setOutput("versions", JSON.stringify(versions))
    core.setOutput("release_dates", JSON.stringify(release_dates))
  } catch (error) {
    core.setFailed(error.message);
  }
}

run()
