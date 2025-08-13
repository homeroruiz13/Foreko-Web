import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../db';

export interface User {
  id: string;
  name: string;
  email: string;
  password_hash?: string;
  status: 'pending' | 'active' | 'suspended';
  email_verified_at?: Date;
  last_login_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
}

export interface LoginUserData {
  email: string;
  password: string;
}

export interface CreateUserDataOAuth {
  name: string;
  email: string;
  status?: 'pending' | 'active' | 'suspended';
  email_verified_at?: Date;
}

export class UserModel {
  static async createUser(userData: CreateUserData): Promise<User> {
    const { name, email, password } = userData;
    
    const existingUser = await this.findByEmail(email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const passwordHash = await bcrypt.hash(password, 12);
    
    const result = await query(
      `INSERT INTO auth.users (name, email, password_hash, status, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, NOW(), NOW()) 
       RETURNING id, name, email, status, email_verified_at, last_login_at, created_at, updated_at`,
      [name, email, passwordHash, 'pending']
    );

    return result.rows[0];
  }

  static async findByEmail(email: string): Promise<User | null> {
    const result = await query(
      'SELECT id, name, email, password_hash, status, email_verified_at, last_login_at, created_at, updated_at FROM auth.users WHERE email = $1',
      [email]
    );

    return result.rows[0] || null;
  }

  static async findById(id: string): Promise<User | null> {
    const result = await query(
      'SELECT id, name, email, status, email_verified_at, last_login_at, created_at, updated_at FROM auth.users WHERE id = $1',
      [id]
    );

    return result.rows[0] || null;
  }

  static async authenticateUser(loginData: LoginUserData): Promise<User | null> {
    const { email, password } = loginData;
    
    const result = await query(
      'SELECT id, name, email, password_hash, status, email_verified_at, last_login_at, created_at, updated_at FROM auth.users WHERE email = $1',
      [email]
    );

    const user = result.rows[0];
    if (!user || !user.password_hash) {
      return null;
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return null;
    }

    // Update last login
    await query(
      'UPDATE auth.users SET last_login_at = NOW(), updated_at = NOW() WHERE id = $1',
      [user.id]
    );

    // Remove password_hash from returned user object
    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  static verifyToken(token: string): any {
    try {
      return jwt.verify(token, process.env.JWT_SECRET!);
    } catch (error) {
      return null;
    }
  }

  // OAuth-specific methods
  static async create(userData: CreateUserDataOAuth): Promise<User> {
    const { name, email, status = 'pending', email_verified_at } = userData;
    
    const result = await query(
      `INSERT INTO auth.users (name, email, status, email_verified_at, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, NOW(), NOW()) 
       RETURNING id, name, email, status, email_verified_at, last_login_at, created_at, updated_at`,
      [name, email, status, email_verified_at]
    );

    return result.rows[0];
  }

  static async updateEmailVerified(userId: string): Promise<User> {
    const result = await query(
      `UPDATE auth.users 
       SET status = 'active', email_verified_at = NOW(), updated_at = NOW() 
       WHERE id = $1 
       RETURNING id, name, email, status, email_verified_at, last_login_at, created_at, updated_at`,
      [userId]
    );

    return result.rows[0];
  }

  static generateToken(userIdOrUser: string | User): string {
    let payload;
    
    if (typeof userIdOrUser === 'string') {
      payload = { userId: userIdOrUser };
    } else {
      payload = {
        userId: userIdOrUser.id,
        email: userIdOrUser.email,
        name: userIdOrUser.name
      };
    }

    return jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: '7d'
    });
  }
}