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

class SecurityQuestion extends Model<
InferAttributes<SecurityQuestion>,
InferCreationAttributes<SecurityQuestion>
> {
  declare id: CreationOptional<number>
  declare question: string
}

const SecurityQuestionModelInit = (sequelize: Sequelize) => {
  SecurityQuestion.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      question: {
        type: DataTypes.STRING
      }
    },
    {
      tableName: 'SecurityQuestions',
      sequelize
    }
  )
}

export { SecurityQuestion as SecurityQuestionModel, SecurityQuestionModelInit }
