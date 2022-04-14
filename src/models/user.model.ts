import { Schema, model, Types } from 'mongoose'
import bcrypt from 'bcryptjs'

interface IUser {
    username: String,
    email : String,
    password : string,
    permissionLevel : String,
    memberId: String,
    tableId: String,
    checkPassword : (password: String) => Promise<boolean>
}

const userSchema = new Schema<IUser>({
    username        : { type: String, required: true }, 
    email           : { type: String, required: true },
    password        : { type: String, required: true },
    permissionLevel : { type: String, required: true, enum: ['board', 'member', 'process_scoring', 'process_table'] },
    memberId        : { type: String },
    tableId         : { type: String }
})

userSchema.pre("save", function(next) {
    const user = this
  
    if (user.isModified("password") || user.isNew) {
      bcrypt.genSalt(10, function (saltError, salt) {
        if (saltError) {
          return next(saltError)
        } else {
          bcrypt.hash(user.password, salt, function(hashError, hash) {
            if (hashError) {
              return next(hashError)
            }
  
            user.password = hash
            next()
          })
        }
      })
    } else {
      return next()
    }
})

userSchema.methods.checkPassword = function(password : string) {
    const result = bcrypt.compare(password, this.password)
    return result
}

userSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = '_' + returnedObject._id.toString()
        if (returnedObject.memberId) {
          returnedObject.memberId = '_' + returnedObject.memberId
        }
        delete returnedObject._id
        delete returnedObject.__v
        delete returnedObject.password
    }
})

const User = model<IUser>('User', userSchema)

export { User }