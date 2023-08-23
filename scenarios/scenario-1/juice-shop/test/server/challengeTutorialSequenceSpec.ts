/*
 * Copyright (c) 2014-2023 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import chai = require('chai')
import path from 'path'
import { promisify } from 'util'
const sinonChai = require('sinon-chai')
const expect = chai.expect
chai.use(sinonChai)

const fs = require('fs')
const { safeLoad } = require('js-yaml')
const readFile = promisify(fs.readFile)

const loadYamlFile = async (filename: string) => {
  const contents = await readFile(filename, { encoding: 'utf8' })
  return safeLoad(contents)
}

describe('challengeTutorialSequence', () => {
  let challenges: any
  before(async () => {
    challenges = await loadYamlFile(path.resolve('data/static/challenges.yml'))
  })

  it('should have unique tutorial orders', async () => {
    const tutorialOrderCounts: any = {}

    for (const { tutorial } of challenges) {
      if (tutorial) {
        const order: string = tutorial.order
        if (!Object.prototype.hasOwnProperty.call(tutorialOrderCounts, order)) {
          tutorialOrderCounts[order] = 0
        }
        tutorialOrderCounts[order]++
      }
    }

    for (const order of Object.keys(tutorialOrderCounts)) {
      const count = tutorialOrderCounts[order]

      expect(count, `Tutorial order "${order}" is used for multiple challenges.`).to.equal(1)
    }
  })
})
