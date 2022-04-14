import { Schema, model } from 'mongoose'

// create Interface
interface IGame {
    gameId       : String
    type         : String,
    target       : Number,
    startedAt    : Date,
    endedAt      : Date,
    homePlayerId : String,
    guestPlayerId: String,
    details      : Object
}

// create Schema
const gameSchema = new Schema<IGame>({
    gameId : { type: String, required: true },
    type : { type: String, required: true },
    target : { type: Number, required: true },
    startedAt : { type: Date },
    endedAt : { type: Date },
    homePlayerId : { type: String, required: true },
    guestPlayerId : { type: String, required: true },
    details : { type: Object },
})

gameSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = '_' + returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

const Game = model<IGame>('Game', gameSchema)

export { Game }