import jwt from 'jsonwebtoken';
import { IUser } from '../models/User';

// Generate JWT Token
export const generateToken = (user: IUser): string => {
  return jwt.sign(
    {
      _id: user._id,
      username: user.username,
      email: user.email,
      isAdmin: user.isAdmin,
    },
    process.env.JWT_SECRET as string,
    {
      expiresIn: '30d',
    }
  );
};

// Verify JWT Token
export const verifyToken = (token: string): any => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    return decoded;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};
