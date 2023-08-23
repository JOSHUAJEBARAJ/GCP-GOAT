/*
 * Copyright (c) 2014-2023 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { HttpClient } from '@angular/common/http'
import { environment } from '../../environments/environment'
import { Injectable } from '@angular/core'
import { catchError } from 'rxjs/operators'

@Injectable({
  providedIn: 'root'
  })
export class CaptchaService {
  private readonly hostServer = environment.hostServer
  private readonly host = this.hostServer + '/rest/captcha'

  constructor (private readonly http: HttpClient) { }

  getCaptcha () {
    return this.http.get(this.host + '/').pipe(catchError((err) => { throw err }))
  }
}
