/*
 * Copyright (c) 2014-2023 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import glob = require('glob')
import logger from '../logger'
import path from 'path'
import * as utils from '../utils'
const fs = require('fs-extra')

const cleanupFtpFolder = () => {
  glob(path.resolve('ftp/*.pdf'), (err: unknown, files: string[]) => {
    if (err != null) {
      logger.warn('Error listing PDF files in /ftp folder: ' + utils.getErrorMessage(err))
    } else {
      files.forEach((filename: string) => {
        fs.remove(filename)
      })
    }
  })
}

module.exports = cleanupFtpFolder
