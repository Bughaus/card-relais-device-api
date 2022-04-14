import { Schema, model } from 'mongoose'

interface IMember {
    lastname  : String,
    firstname : String,
    active : Boolean,
    flatrate : Boolean,
    cardId : Boolean
}

const memberSchema = new Schema<IMember>({
    lastname : { type: String, required: true },
    firstname: { type: String, required: true },
    active   : { type: Boolean, required: true },
    flatrate :  { type: Boolean, required: true },
    cardId   : { type: String, required: true },
})

memberSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = '_' + returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

const Member = model<IMember>('Member', memberSchema)

export { Member }