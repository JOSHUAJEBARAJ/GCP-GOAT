/*
 * Copyright (c) 2014-2023 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import config from 'config'
import { Request, Response } from 'express'

import * as utils from '../lib/utils'

module.exports = function retrieveAppVersion () {
  return (_req: Request, res: Response) => {
    res.json({
      version: config.get('application.showVersionNumber') ? utils.version() : ''
    })
  }
}
