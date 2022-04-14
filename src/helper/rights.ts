
import { Request } from 'express'

export default {
    isBoardMemberAuthorized(req: Request) : boolean {
        if (typeof (<any>req.user).role == 'undefined') {
            return false;
        }

        if ((<any>req.user).role === 'board') {
            return true;
        }
        return false;
    },

    isProcessScoreBoard(req: Request) : boolean {
        if (typeof (<any>req.user).role == 'undefined') {
            return false;
        }

        if ((<any>req.user).role === 'process_scoreboard') {
            return true;
        }
        return false;
    },

    isProcessTableLogger(req: Request) : boolean {
        if (typeof (<any>req.user).role == 'undefined') {
            return false;
        }

        if ((<any>req.user).role === 'process_table') {
            return true;
        }
        return false;
    }
}