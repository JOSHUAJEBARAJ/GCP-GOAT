/*
 * Copyright (c) 2014-2023 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import * as webhook from '../../lib/webhook'
import chai = require('chai')
const expect = chai.expect
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

describe('webhook', () => {
  const challenge = {
    key: 'key',
    name: 'name',
    difficulty: 1
  }

  describe('notify', () => {
    it('fails when no webhook URL is provided via environment variable', () => {
      void expect(webhook.notify(challenge)).to.eventually.throw('options.uri is a required argument')
    })

    it('fails when supplied webhook is not a valid URL', () => {
      void expect(webhook.notify(challenge, 0, 'localhorst')).to.eventually.throw('Invalid URI "localhorst"')
    })

    it('submits POST with payload to existing URL', () => {
      void expect(webhook.notify(challenge, 0, 'https://enlm7zwniuyah.x.pipedream.net/')).to.eventually.not.throw()
    })
  })
})
