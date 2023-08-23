/*
 * Copyright (c) 2014-2023 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { environment } from '../../environments/environment'
import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { catchError, map } from 'rxjs/operators'

@Injectable({
  providedIn: 'root'
  })
export class PaymentService {
  private readonly hostServer = environment.hostServer
  private readonly host = this.hostServer + '/api/Cards'

  constructor (private readonly http: HttpClient) { }

  get () {
    return this.http.get(this.host).pipe(map((response: any) => response.data), catchError((err) => { throw err }))
  }

  getById (id) {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    return this.http.get(`${this.host}/${id}`).pipe(map((response: any) => response.data), catchError((err: Error) => { throw err }))
  }

  save (params) {
    return this.http.post(this.host + '/', params).pipe(map((response: any) => response.data), catchError((err) => { throw err }))
  }

  del (id: number) {
    return this.http.delete(`${this.host}/${id}`).pipe(map((response: any) => response.data), catchError((err) => { throw err }))
  }
}
