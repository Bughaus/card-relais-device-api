import express, { Request, Response } from 'express'
import { Member } from '../models/member.model'
import { User } from '../models/user.model'
import rights from '../helper/rights'

const router = express.Router()

/*
 * ONLY FOR BOARD MEMBERS
 */
router.get('/club-api/member', [], async (req: Request, res: Response) => {
    if (!rights.isBoardMemberAuthorized(req)) {
        return res.status(401).send();
    }

    const member = await Member.find({}, undefined, {sort: {lastname:1, firstname:1}})
    return res.status(200).send(member)
})

router.get('/club-api/member/:id', [], async (req: Request, res: Response) => {
    if (!rights.isBoardMemberAuthorized(req)) {
        return res.status(401).send();
    }
    let member;

    // with _ we send a objectid
    if (req.params.id.length > 0 && req.params.id.charAt(0) == '_') {
        try {
            member = await Member.findById(req.params.id.substr(1))
        } catch(ex) {
            return res.status(400).send()
        }
    }
    else {
        member = await Member.findOne({cardId: req.params.id})
    }
    
    if (!Array.isArray(member))  {
        if (member && typeof member == 'object') {
            return res.status(200).send(member)
        }
        return res.status(500).send();
    }
    if (member.length == 1) {
        return res.status(200).send(member[0])
    }
    else if (member.length == 0) {
        return res.status(204).send();
    }
    else {
        return res.status(500).send('FATAL: db is potentially corrupted!');
    }
    
})

router.put('/club-api/member', [], async (req: Request, res: Response) => {
    if (!rights.isBoardMemberAuthorized(req)) {
        return res.status(401).send();
    }

    // validate the authenticated role. must be 
    const { firstname, lastname, active, flatrate, cardId } = req.body

    // check if already exists
    try {  
        const member = await Member.findOne({cardId})
    if (member) {
        return res.status(409).send({message: 'CardId already in use'})
    }

    } catch(ex) {    
    }

    const member = new Member({ firstname, lastname, active, flatrate, cardId })
    await member.save()
    return res.status(201).send(member)
})

router.put('/club-api/member/:memberId', [], async (req: Request, res: Response) => {

    if (!rights.isBoardMemberAuthorized(req)) {
        return res.status(401).send();
    }

    console.log(req);
    const { firstname, lastname, active, flatrate, cardId } = req.body

    const member = new Member({ firstname, lastname, active, flatrate, cardId })
    await member.save()
    return res.status(201).send(member)
})

router.post('/club-api/member/bindLogin', [], async (req: Request, res: Response) => {
    if (!rights.isBoardMemberAuthorized(req)) {
        return res.status(401).send();
    }

    try {
        const { username, cardId } = req.body
        if (!username) { return res.status(400).send({message: "'username' not given"}) }
        if (!cardId) { return res.status(400).send({message: "'cardId' not given"})
     }
        const user = await User.findOne({username})
        if (!user) {
            return res.status(400).send({message: "User document not found"})
        }
        const member = await Member.findOne({cardId})
        if (!member) {
            return res.status(400).send({message: "Member document not found"})
        }

        
        user.memberId = member._id.toString()
        user.save()
        return res.status(200).send(user)
    } catch(ex) {
        return res.status(401).send()    
    }
})

/* TODO unbind method */

export {
    router as memberRouter
}
