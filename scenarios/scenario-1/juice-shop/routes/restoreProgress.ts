/*
 * Copyright (c) 2014-2023 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import Hashids = require('hashids/cjs')
import { Request, Response } from 'express'

const challenges = require('../data/datacache').challenges
const challengeUtils = require('../lib/challengeUtils')

module.exports.restoreProgress = function restoreProgress () {
  return ({ params }: Request, res: Response) => {
    const hashids = new Hashids('this is my salt', 60, 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890')
    const continueCode = params.continueCode
    const ids = hashids.decode(continueCode)
    if (challengeUtils.notSolved(challenges.continueCodeChallenge) && ids.includes(999)) {
      challengeUtils.solve(challenges.continueCodeChallenge)
      res.end()
    } else if (ids.length > 0) {
      for (const name in challenges) {
        if (Object.prototype.hasOwnProperty.call(challenges, name)) {
          if (ids.includes(challenges[name].id)) {
            challengeUtils.solve(challenges[name], true)
          }
        }
      }
      res.json({ data: ids.length + ' solved challenges have been restored.' })
    } else {
      res.status(404).send('Invalid continue code.')
    }
  }
}

module.exports.restoreProgressFindIt = function restoreProgressFindIt () {
  return async ({ params }: Request, res: Response) => {
    const hashids = new Hashids('this is the salt for findIt challenges', 60, 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890')
    const continueCodeFindIt = params.continueCode
    const idsFindIt = hashids.decode(continueCodeFindIt)
    if (idsFindIt.length > 0) {
      for (const key in challenges) {
        if (Object.prototype.hasOwnProperty.call(challenges, key)) {
          if (idsFindIt.includes(challenges[key].id)) {
            await challengeUtils.solveFindIt(key, true)
          }
        }
      }
      res.json({ data: idsFindIt.length + ' solved challenges have been restored.' })
    } else {
      res.status(404).send('Invalid continue code.')
    }
  }
}

module.exports.restoreProgressFixIt = function restoreProgressFixIt () {
  const hashids = new Hashids('yet another salt for the fixIt challenges', 60, 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890')
  return async ({ params }: Request, res: Response) => {
    const continueCodeFixIt = params.continueCode
    const idsFixIt = hashids.decode(continueCodeFixIt)
    if (idsFixIt.length > 0) {
      for (const key in challenges) {
        if (Object.prototype.hasOwnProperty.call(challenges, key)) {
          if (idsFixIt.includes(challenges[key].id)) {
            await challengeUtils.solveFixIt(key, true)
          }
        }
      }
      res.json({ data: idsFixIt.length + ' solved challenges have been restored.' })
    } else {
      res.status(404).send('Invalid continue code.')
    }
  }
}
