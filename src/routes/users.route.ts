import express, { Request, Response } from 'express'
import auth from '../helper/jwt'
import rights from '../helper/rights'
import emailValidator from 'email-validator'
import { ObjectId } from 'mongodb'

import { User } from '../models/user.model'
import { Member } from '../models/member.model'
import { Table } from '../models/table.model'

const router = express.Router()

/*
 * PUBLIC NODES
 */
// register a new user
router.post('/club-api/users/register', [], async (req: Request, res: Response) => {
    const { username, email, password } = req.body
    if (!username) { return res.status(400).send({message: "'username' not given"}) }
    if (!email) { return res.status(400).send({message: "'email' not given"}) }
    if (!password) { return res.status(400).send({message: "'password' not given"}) }

    if (!emailValidator.validate(email)) { return res.status(400).send({message: "'email' must be a valid email address"}) }
    if (password.length < 8) { return res.status(400).send({message: "'password' must be at least 8 characters long"}) }

    // check if user already exists
    try {  
        const user = await User.findOne({username})
        if (user) {
            return res.status(409).send({message: 'User already exists'})
        }
    } catch(ex) {}

    const user = new User({ username, email, password, permissionLevel: 'member' })
    await user.save()
    return res.status(201).send(user)
})

// login existing user
router.post('/club-api/users/authenticate', [], async (req: Request, res: Response) => {
    const { username, password } = req.body
    if (!username) { return res.status(400).send({message: "'username' not given"}) }
    if (!password) { return res.status(400).send({message: "'password' not given"}) }

    try {
        const user = await User.findOne({username: username})
        if (!user) {
            return res.status(401).send({error: 'User or password is incorrect'})
        }
        const result = await user.checkPassword(password);
        if (!result) {
            return res.status(401).send({error: 'User or password is incorrect'})
        }
        else {
            // login succesful. generate jwt
            // do we have a memberId? Then load member doc
            let result = user.toJSON()
            let jwtUserData = {
                username: user.username,
                role: user.permissionLevel
            };

            if (user?.memberId) {
                const member = await Member.findById(new ObjectId(<string>user.memberId));
                (<any>result).firstname = member?.firstname;
                (<any>result).lastname = member?.lastname;
                (<any>jwtUserData)['memberId'] = user.memberId;
            }
            if (user?.tableId) {
                const table = await Table.findById(new ObjectId(<string>user.tableId));
                (<any>result).name = table?.name;
                (<any>result).uid = table?.tableId;
                (<any>jwtUserData)['tableId'] = user.tableId;
            }

            const token = auth.generateAccessToken(jwtUserData)
            return res.status(200).send({...result, token})
        }
    } catch (ex) {
        return res.status(401).send()      
    }
})

/*
 * USER SPECIFIC NODE
 */
router.get('/club-api/users/profile', [], async (req: Request, res: Response) => {
    console.log(req.user)
    try {  
        const user = await User.findOne({username: (<any>req.user).user})

        // do we have a memberId? Then load member doc
        if (user?.memberId) {
            const member = await Member.findById(new ObjectId(<string>user.memberId));
            let result = user.toJSON();
            (<any>result).member_data = member?.toJSON();
            return res.status(200).send(result)
        }
        // do we have a memberId? Then load member doc
        if (user?.tableId) {
            const table = await Table.findById(new ObjectId(<string>user.tableId));
            let result = user.toJSON();
            (<any>result).table_data = table?.toJSON();
            return res.status(200).send(result)
        }
        return res.status(200).send(user)
    } catch(ex) {
        return res.status(401).send()     
    }
})

/*
 * BOARD MEMBER NODES
 */
router.post('/club-api/users/changeRole', [], async (req: Request, res: Response) => {
    if (!rights.isBoardMemberAuthorized(req)) {
        return res.status(401).send();
    }

    try {
        const { username, role } = req.body
        if (!username) { return res.status(400).send({message: "'username' not given"}) }
        if (!role) { return res.status(400).send({message: "'role' not given"})
     }
        const user = await User.findOne({username})
        if (!user) {
            return res.status(400).send({message: "User document not found"})
        }   

        user.permissionLevel = role;
        user.save(function(err, user) {
            if (err) return res.status(400).send({message: err.message})
            return res.status(200).send(user)
        })
    } catch(ex) {
        return res.status(401).send()    
    }
})

/* 
  TODO
   - OTP on creation
   - Change Password
*/

export {
    router as userRouter
}