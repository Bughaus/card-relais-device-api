import express, { NextFunction } from 'express'
import { json } from 'body-parser'
import mongoose from 'mongoose'
import helmet from 'helmet'
import cors from 'cors'
import morgan from 'morgan'
import https from 'https'
import http from 'http'
import fs  from 'fs';
import dotenv from 'dotenv'
import auth from './helper/jwt'
import unless from 'express-unless'
import jwt from 'express-jwt'
import cluster from 'cluster'

const PRICE_PER_MINUTE = "5" // 5ct per minute if not flatrate

declare global {
    namespace NodeJS {
      interface ProcessEnv {
        TOKEN_SECRET: string;
      }
    }
}

// routes
import { memberRouter } from './routes/member.route'
import { tableRouter } from './routes/table.route'
import { userRouter } from './routes/users.route'
import { mainRouter } from './routes/main.route'
import { sessionRouter } from './routes/session.route'

if (cluster.isMaster) {

    // Count the machine's CPUs
    var cpuCount = require('os').cpus().length;

    // Create a worker for each CPU
    for (var i = 0; i < cpuCount; i += 1) {
        cluster.fork();
    }

    // Listen for dying workers
    cluster.on('exit', function (worker) {

        // Replace the dead worker, we're not sentimental
        console.log('Worker ' + worker.id + ' died :(');
        cluster.fork();

    });
}

else {

dotenv.config()

// ssl cert
const privateKey = fs.readFileSync('ssl/localhost.decrypted.key');
const certificate = fs.readFileSync('ssl/localhost.crt');
const credentials = {key: privateKey, cert: certificate};

// define app
const app = express()
app.use(json())
app.use(helmet())
app.use(cors({origin: "http://localhost:8081"}))
app.use(morgan('combined'))

// auth for middleware
app.use(auth.authenticateWithExpressJWT.unless({
    path: [
        { url: '/club-api/info', methods: ['GET'] },
        { url: '/club-api/users/register', methods: ['POST'] },
        { url: '/club-api/users/authenticate', methods: ['POST'] }
    ]
}
))

// catch auth errors
app.use((err: any, req: any, res: any, next: NextFunction) => {
    if(err.name === 'UnauthorizedError') {
      (<any>res).status(err.status).send({error:err.message});
    }
    else {
        next();
    }
});

// init routes
app.use(memberRouter)
app.use(tableRouter)
app.use(userRouter)
app.use(mainRouter)
app.use(sessionRouter)

// connect to mongo
mongoose.connect(<string>process.env.DSC_API_MONGODB_CONNSTR, {
    user: process.env.DSC_API_PROCESS_USER,
    pass: process.env.DSC_API_PROCESS_PWD
}, (err) => {
    if (err) {
        console.log(err)
    }
    else {
        console.log('connected to db')
    }
}
)

// listen
http.createServer(app).listen(3000, () => {
    console.log('HTTP is listening on port 3000')
})

}
