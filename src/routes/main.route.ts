import express, { Request, Response } from 'express'
import { Session } from '../models/session.model'
const router = express.Router()

/*
 * PUBLIC NODES
 */
router.get('/club-api/info', [], async (req: Request, res: Response) => {
    return res.status(200).send({"club-api-version": "0.1.0"})
})

router.get('/club-api/test', [], async (req: Request, res: Response) => {
    const activeSession = await Session.findOne({memberId: 'abc', activeSession: false})
    console.log(activeSession)
    return res.status(200).send(activeSession)
})


export {
    router as mainRouter
}
