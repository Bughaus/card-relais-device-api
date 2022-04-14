import jwt, { JwtPayload } from 'jsonwebtoken'
import dotenv from 'dotenv'
import express_jwt from 'express-jwt'

declare global {
    namespace NodeJS {
      interface ProcessEnv {
        TOKEN_SECRET: string;
      }
    }
}

dotenv.config()

const authenticateWithExpressJWT = express_jwt({
  secret: process.env.TOKEN_SECRET, 
  algorithms: ['HS256']
})

function generateAccessToken(userData : Object) : string {
    return jwt.sign(userData, process.env.TOKEN_SECRET, { expiresIn: '30m' });
}

export default {
  generateAccessToken,
  authenticateWithExpressJWT
}