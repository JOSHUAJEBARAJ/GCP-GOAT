/*
 * Copyright (c) 2014-2023 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

/* jslint node: true */

import {
  Model,
  InferAttributes,
  InferCreationAttributes,
  DataTypes,
  CreationOptional,
  Sequelize
} from 'sequelize'

class PrivacyRequestModel extends Model<
InferAttributes<PrivacyRequestModel>,
InferCreationAttributes<PrivacyRequestModel>
> {
  declare id: CreationOptional<number>
  declare UserId: number
  declare deletionRequested: boolean
}
const PrivacyRequestModelInit = (sequelize: Sequelize) => {
  PrivacyRequestModel.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      UserId: {
        type: DataTypes.INTEGER
      },
      deletionRequested: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      }
    },
    {
      tableName: 'PrivacyRequests',
      sequelize
    }
  )
}

export { PrivacyRequestModel, PrivacyRequestModelInit }
