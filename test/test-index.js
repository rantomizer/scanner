/* global describe, before, after, it */
const expect = require('chai').expect
const express = require('express')
const temp = require('temp')
const path = require('path')
const sinon = require('sinon')
const Scanner = require('..')
const fs = require('fs')
const {app} = require('electron')

describe('Scanner', function () {
  before(function (done) {
    const app = express()
    app.route('/').get((req, res) => {
      res.send('Yeah')
    })
    this.server = app.listen(() => {
      this.url = `http://localhost:${this.server.address().port}`
      done()
    })
  })

  after(function () {
    this.server.close()
  })

  it('can render and obtain HTML', sinon.test(function (done) {
    temp.track()
    const test_dir = temp.mkdirSync('scanner-test')
    this.stub(temp, 'mkdirSync', () => test_dir) // Sub in our own dir

    const s = new Scanner()
    const finish = function (error) {
      expect(error).to.be.nil
      const page_file = path.join(test_dir, 'page.html')
      const file_contents = fs.readFileSync(page_file)
      expect(file_contents.toString()).to.equal('Yeah')
      done()
    }
    s.run(this.url, finish)
    s.onReady() // Because electron-mocha already consumed the ready event
  }))
})
