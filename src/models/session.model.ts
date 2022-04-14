import { Schema, model } from 'mongoose'

// create Interface
interface ISession {
    tableId  : String,
    memberId : String,
    startedAt : number,
    endedAt : number,
    activeSession : Boolean
}

// create Schema
const sessionSchema = new Schema<ISession>({
    tableId : { type: String, required: true },
    memberId : { type: String, required: true },
    startedAt: { type: Number },
    endedAt  : { type: Number },
    activeSession : { type: Boolean, required: true }
})

sessionSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = '_' + returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

const Session = model<ISession>('Session', sessionSchema)

export { Session }