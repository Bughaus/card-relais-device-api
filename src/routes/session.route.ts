import express, { Request, Response } from 'express'
import { Session } from '../models/session.model'
import { Member } from '../models/member.model'
import { Table } from '../models/table.model'
import rights from '../helper/rights'

const router = express.Router()

/*
 * FOR LOGGING MACHINES ONLY
 */
router.get('/club-api/session/start/:cardId', [], async (req: Request, res: Response) => {
    if (!rights.isProcessTableLogger(req)) {
        return res.status(401).send();
    }

    if (!(<any>req.user).tableId) {
        return res.status(400).send({message: "'tableId' not found in token!"});
    }

    const tableId = (<any>req.user).tableId

    // get the member id from the cardId
    if (req.params.cardId.length == 0) {
        return res.status(400).send({message: 'Missing cardId in request!'})
    }
    const member = await Member.findOne({cardId: req.params.cardId})
    if (!member) {
        return res.status(400).send({message: 'Invalid cardId!'})
    }
    
    // check if there is an active session
    const memberId = member._id.toString()
    const activeSession = await Session.findOne({memberId: memberId, activeSession: true})
    if (activeSession != null) {
        // get name for user feedback
        const table = await Table.findById(activeSession.tableId)
        return res.status(400).send({message: 'There is already an active session! Stop this one first before starting a new one!', table: table?.name})
    }

    const startTime = Date.now();
    const session = new Session({
        memberId : memberId,
        tableId : tableId,
        startedAt : startTime,
        activeSession : true
    })

    let newId = "";
    session.save((err, storeResult) => {
        if (err) {
            return res.status(500).send({message: 'Error storing record!', error: err});
        } 
        else {
            let startDate = new Date(startTime);
            // extract hour and minute for visualization purpose at the client device
            let timeOut =  ('0' + startDate.getHours()).slice(-2) + ':'
                         + ('0' + startDate.getMinutes()).slice(-2);

            return res.status(201).send({member: member.firstname, startedAt: startTime, time: timeOut, id: storeResult._id.toString()})
        }
    });
    
})

router.get('/club-api/session/stop/:cardId', [], async (req: Request, res: Response) => {
    if (!rights.isProcessTableLogger(req)) {
        return res.status(401).send();
    }

    if (!(<any>req.user).tableId) {
        return res.status(400).send({message: "'tableId' not found in token!"});
    }

    const tableId = (<any>req.user).tableId

    // get the member id from the cardId
    if (req.params.cardId.length == 0) {
        return res.status(400).send({message: 'Missing cardId in request!'})
    }
    const member = await Member.findOne({cardId: req.params.cardId})
    if (!member) {
        return res.status(400).send({message: 'Invalid cardId!'})
    }
    
    // find the active session
    const memberId = member._id.toString()
    const activeSession = await Session.findOne({memberId: memberId, activeSession: true})
    if (activeSession == null) {
        return res.status(400).send({message: 'There is NO active session!'})
    }

    // is the active session at the actual table?
    if (activeSession.tableId != tableId) {
        const table = await Table.findById(activeSession.tableId)
        return res.status(400).send({message: 'There is an active session at another table!', table: table?.name})
    }
    const endTime = Date.now();
    activeSession.endedAt = endTime;
    activeSession.activeSession = false;
    activeSession.save((err, storeResult) => {
        if (err) {
            return res.status(500).send({message: 'Error storing record!', error: err});
        } 
        else {
            return res.status(201).send({member: member.firstname, startedAt: activeSession.startedAt, endedAt: activeSession.endedAt, id: storeResult._id.toString()})
        }
    });
    
})

router.get('/club-api/session/activeCards', [], async (req: Request, res: Response) => {
    if (!rights.isProcessTableLogger(req)) {
        return res.status(401).send();
    }

    if (!(<any>req.user).tableId) {
        return res.status(400).send({message: "'tableId' not found in token!"});
    }

    const tableId = (<any>req.user).tableId

    // find the active sessions
    let result = {cardIds:[]}
    const activeSessions = await Session.find({tableId: tableId, activeSession: true})
    if (activeSessions == null) {
        return res.status(200).send(result)    
    }
    
    for (let i = 0; i < activeSessions.length; i ++) {
        let memberId = activeSessions[i].memberId;
        const member = await Member.findById(memberId);
        (<any>result.cardIds).push(member?.cardId);
    }

    return res.status(200).send(result)
})

export {
    router as sessionRouter
}