'use strict'

// Largely cribbed from
// https://raw.githubusercontent.com/tropy/tropy/master/test/support/coverage.js

const glob = require('glob')
const { readFileSync: read, realpathSync } = require('fs')
const { Reporter, Instrumenter, Collector, hook } = require('istanbul')
const { keys } = Object

function match () {
  const map = {}
  const fn = function (file) { return map[file] }
  fn.files = []

  for (let file of glob.sync(pattern)) {
    let fullpath = realpathSync(file)
    fn.files.push(fullpath)
    map[fullpath] = true
  }

  return fn
}

function report () {
  const cov = global.__coverage__
  for (let file of matched.files) {
    if (!cov[file]) {
      // Add uncovered files to the report.
      transformer(read(file, 'utf-8'), file)
      for (let key of keys(instrumenter.coverState.s)) {
        instrumenter.coverState.s[key] = 0
      }
      cov[file] = instrumenter.coverState
    }
  }

  const collector = new Collector()
  collector.add(cov)

  const reporter = new Reporter()
  reporter.addAll(['text-summary', 'json'])
  reporter.write(collector, true, () => {})
}

// The source files to cover.  Avoid node_modules/, coverage/, and
// */coverage.js (supposed to be test/coverage.js)

const pattern = '{!(node_modules|coverage)/**,.}/!(coverage).js'
const matched = match()

const instrumenter = new Instrumenter()
const transformer = instrumenter.instrumentSync.bind(instrumenter)

hook.hookRequire(matched, transformer, {})

process.on('exit', report)
