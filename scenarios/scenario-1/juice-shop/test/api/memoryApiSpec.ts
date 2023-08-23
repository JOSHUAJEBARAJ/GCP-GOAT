/*
 * Copyright (c) 2014-2023 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import frisby = require('frisby')
import config from 'config'
import path from 'path'
const fs = require('fs')

const jsonHeader = { 'content-type': 'application/json' }
const REST_URL = 'http://localhost:3000/rest'

describe('/rest/memories', () => {
  it('GET memories via public API', () => {
    return frisby.get(REST_URL + '/memories')
      .expect('status', 200)
  })

  it('GET memories via a valid authorization token', () => {
    return frisby.post(REST_URL + '/user/login', {
      headers: jsonHeader,
      body: {
        email: 'jim@' + config.get('application.domain'),
        password: 'ncc-1701'
      }
    })
      .expect('status', 200)
      .then(({ json: jsonLogin }) => {
        return frisby.get(REST_URL + '/memories', {
          headers: { Authorization: 'Bearer ' + jsonLogin.authentication.token, 'content-type': 'application/json' }
        })
          .expect('status', 200)
      })
  })

  it('POST new memory is forbidden via public API', () => {
    const file = path.resolve(__dirname, '../files/validProfileImage.jpg')
    const form = frisby.formData()
    form.append('image', fs.createReadStream(file), 'Valid Image')
    form.append('caption', 'Valid Image')

    return frisby.post(REST_URL + '/memories', {
      headers: {
        // @ts-expect-error
        'Content-Type': form.getHeaders()['content-type']
      },
      body: form
    })
      .expect('status', 401)
  })

  it('POST new memory image file invalid type', () => {
    const file = path.resolve(__dirname, '../files/invalidProfileImageType.docx')
    const form = frisby.formData()
    form.append('image', fs.createReadStream(file), 'Valid Image')
    form.append('caption', 'Valid Image')

    return frisby.post(REST_URL + '/user/login', {
      headers: jsonHeader,
      body: {
        email: 'jim@' + config.get('application.domain'),
        password: 'ncc-1701'
      }
    })
      .expect('status', 200)
      .then(({ json: jsonLogin }) => {
        return frisby.post(REST_URL + '/memories', {
          headers: {
            Authorization: 'Bearer ' + jsonLogin.authentication.token,
            // @ts-expect-error
            'Content-Type': form.getHeaders()['content-type']
          },
          body: form
        })
          .expect('status', 500)
      })
  })

  it('POST new memory with valid for JPG format image', () => {
    const file = path.resolve(__dirname, '../files/validProfileImage.jpg')
    const form = frisby.formData()
    form.append('image', fs.createReadStream(file), 'Valid Image')
    form.append('caption', 'Valid Image')

    return frisby.post(REST_URL + '/user/login', {
      headers: jsonHeader,
      body: {
        email: 'jim@' + config.get('application.domain'),
        password: 'ncc-1701'
      }
    })
      .expect('status', 200)
      .then(({ json: jsonLogin }) => {
        return frisby.post(REST_URL + '/memories', {
          headers: {
            Authorization: 'Bearer ' + jsonLogin.authentication.token,
            // @ts-expect-error
            'Content-Type': form.getHeaders()['content-type']
          },
          body: form
        })
          .expect('status', 200)
          .then(({ json }) => {
            expect(json.data.caption).toBe('Valid Image')
            expect(json.data.UserId).toBe(2)
          })
      })
  })

  it('Should not crash the node-js server when sending invalid content like described in CVE-2022-24434', () => {
    return frisby.post(REST_URL + '/memories', {
      headers: {
        'Content-Type': 'multipart/form-data; boundary=----WebKitFormBoundaryoo6vortfDzBsDiro',
        'Content-Length': '145'
      },
      body: '------WebKitFormBoundaryoo6vortfDzBsDiro\r\n Content-Disposition: form-data; name="bildbeschreibung"\r\n\r\n\r\n------WebKitFormBoundaryoo6vortfDzBsDiro--'
    })
      .expect('status', 500)
      .expect('bodyContains', 'Error: Malformed part header')
  })
})
