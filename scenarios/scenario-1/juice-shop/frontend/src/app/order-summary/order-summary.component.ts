/*
 * Copyright (c) 2014-2023 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { Component, NgZone, OnInit } from '@angular/core'
import { AddressService } from '../Services/address.service'
import { PaymentService } from '../Services/payment.service'
import { BasketService } from '../Services/basket.service'
import { Router } from '@angular/router'
import { DeliveryService } from '../Services/delivery.service'
import { SnackBarHelperService } from '../Services/snack-bar-helper.service'

@Component({
  selector: 'app-order-summary',
  templateUrl: './order-summary.component.html',
  styleUrls: ['./order-summary.component.scss']
  })
export class OrderSummaryComponent implements OnInit {
  public bonus = 0
  public itemTotal = 0
  public deliveryPrice = 0
  public promotionalDiscount = 0
  public address: any
  public paymentMethod: any
  constructor (private readonly router: Router, private readonly addressService: AddressService, private readonly paymentService: PaymentService, private readonly basketService: BasketService, private readonly deliveryService: DeliveryService, private readonly ngZone: NgZone, private readonly snackBarHelperService: SnackBarHelperService) { }

  ngOnInit () {
    this.deliveryService.getById(sessionStorage.getItem('deliveryMethodId')).subscribe((method) => {
      this.deliveryPrice = method.price
    })

    this.addressService.getById(sessionStorage.getItem('addressId')).subscribe((address) => {
      this.address = address
    }, (error) => console.log(error))

    if (sessionStorage.getItem('paymentId') !== 'wallet') {
      this.paymentService.getById(sessionStorage.getItem('paymentId')).subscribe((card) => {
        card.cardNum = String(card.cardNum).substring(String(card.cardNum).length - 4)
        this.paymentMethod = card
      }, (err) => console.log(err))
    } else if (sessionStorage.getItem('paymentId') === 'wallet') {
      this.paymentMethod = 'wallet'
    }
  }

  getMessage (total) {
    this.itemTotal = total[0]
    this.promotionalDiscount = sessionStorage.getItem('couponDiscount') ? (parseFloat(sessionStorage.getItem('couponDiscount')) / 100) * this.itemTotal : 0
    this.bonus = total[1]
  }

  placeOrder () {
    const orderDetails = {
      paymentId: sessionStorage.getItem('paymentId'),
      addressId: sessionStorage.getItem('addressId'),
      deliveryMethodId: sessionStorage.getItem('deliveryMethodId')
    }
    this.basketService.checkout(Number(sessionStorage.getItem('bid')), btoa(sessionStorage.getItem('couponDetails')), orderDetails).subscribe((orderConfirmationId) => {
      sessionStorage.removeItem('paymentId')
      sessionStorage.removeItem('addressId')
      sessionStorage.removeItem('deliveryMethodId')
      sessionStorage.removeItem('couponDetails')
      sessionStorage.removeItem('couponDiscount')
      this.basketService.updateNumberOfCartItems()
      this.ngZone.run(async () => await this.router.navigate(['/order-completion', orderConfirmationId]))
    }, (err) => {
      console.log(err)
      this.snackBarHelperService.open(err.error?.error.message, 'errorBar')
    })
  }
}
