import { Model, DataTypes, CreationOptional, InferAttributes, InferCreationAttributes, ForeignKey } from 'sequelize';
import sequelize from "../init/database";
import Cardset from './cardset';


interface QuestionModel extends Model<InferAttributes<QuestionModel>, InferCreationAttributes<QuestionModel>> {
    // Some fields are optional when calling UserModel.create() or UserModel.build()
    question_id: CreationOptional<Number>,
    question_title: string,
    question_url: string,
    answer: string,
    cardset_id: number
  }

const Question = sequelize.define<QuestionModel>("question", {
    question_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    question_title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    question_url: {
        type: DataTypes.STRING,
        allowNull: false
    },
    answer: {
        type: DataTypes.STRING,
        allowNull: false
    },
    cardset_id: {
        type: DataTypes.INTEGER,
        references: {
            model: Cardset,
            key: 'cardset_id',
        },
    }
})


export default Question;