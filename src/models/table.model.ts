import { Schema, model } from 'mongoose'

// create Interface
interface ITable {
    tableId  : String,
    name : String
}

// create Schema
const tableSchema = new Schema<ITable>({
    tableId: { type: String, required: true },
    name   : { type: String, required: true }
})

tableSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = '_' + returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

const Table = model<ITable>('Table', tableSchema)

export { Table }