import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const registerValidation = [
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Invalid email address'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  // body('age').isInt({ min: 1 }).withMessage('Age must be a positive number'),
  // body('height').isFloat({ min: 0 }).withMessage('Height must be a positive number'),
  // body('sports').isArray({ min: 1 }).withMessage('At least one sport is required'),
  // body('gender').notEmpty().withMessage('Gender is required'),
  // body('futureGoals').notEmpty().withMessage('Future goals are required'),
  // body('achievements').notEmpty().withMessage('Achievements are required'),
];

export const loginValidation = [
  body('email').isEmail().withMessage('Invalid email address'),
  body('password').notEmpty().withMessage('Password is required'),
];

export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
