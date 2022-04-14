import express, { Request, Response } from 'express'
import { Table } from '../models/table.model'
import { User } from '../models/user.model'
import rights from '../helper/rights'

const router = express.Router()

/*
 * FOR ALL MEMBERS
 */
router.get('/club-api/table', [], async (req: Request, res: Response) => {
    const table = await Table.find({})
    return res.status(200).send(table)
})

router.get('/club-api/table/:tableId', [], async (req: Request, res: Response) => {
    let table;

    // with _ we send a objectid
    if (req.params.tableId.length > 0 && req.params.tableId.charAt(0) == '_') {
        try {
            table = await Table.findById(req.params.tableId.substr(1))
        } catch(ex) {
            return res.status(400).send()
        }
    }
    else {
        table = await Table.findOne({tableId: req.params.tableId})
    }
    
    if (!Array.isArray(table))  {
        if (typeof table == 'object') {
            return res.status(200).send(table)
        }
        return res.status(500).send();
    }
    if (!Array.isArray(table))  {
        return res.status(500).send();
    }
    if (table.length == 1) {
        return res.status(200).send(table)
    }
    else if (table.length == 0) {
        return res.status(204).send();
    }
    else {
        return res.status(500).send('FATAL: db is potentially corrupted!');
    }
    
})

/*
 * ONLY FOR BOARD MEMBERS 
*/
router.put('/club-api/table', [], async (req: Request, res: Response) => {
    if (!rights.isBoardMemberAuthorized(req)) {
        return res.status(401).send();
    }

    const { tableId, name } = req.body

    const table = new Table({ tableId, name })
    await table.save()
    return res.status(201).send(table)
})

router.post('/club-api/table/bindLogin', [], async (req: Request, res: Response) => {
    if (!rights.isBoardMemberAuthorized(req)) {
        return res.status(401).send();
    }

    try {
        const { username, tableId } = req.body
        if (!username) { return res.status(400).send({message: "'username' not given"}) }
        if (!tableId) { return res.status(400).send({message: "'tableId' not given"})
     }
        const user = await User.findOne({username})
        if (!user) {
            return res.status(400).send({message: "User document not found"})
        }
        const table = await Table.findOne({tableId})
        if (!table) {
            return res.status(400).send({message: "Table document not found"})
        }

        user.tableId = table._id.toString()
        user.save()
        return res.status(200).send(user)
    } catch(ex) {
        return res.status(401).send()    
    }
})

export {
    router as tableRouter
}

/* TODO unbind method */