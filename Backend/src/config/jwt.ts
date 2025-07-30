import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_here';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface JWTPayload {
  userId: string;
  email: string;
  role: 'user' | 'admin';
}

export const generateToken = (payload: JWTPayload): string => {
  // @ts-ignore
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const verifyToken = (token: string): JWTPayload => {
  // @ts-ignore
  return jwt.verify(token, JWT_SECRET) as JWTPayload;
};

export { JWT_SECRET, JWT_EXPIRES_IN }; 