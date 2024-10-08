// routes/authRoutes.ts

import express from 'express';
import { registerValidation, loginValidation, validate } from '../utils/validate';
import { register, login, getSports, searchByName, logout, uploadProfilePicture, searchByNameForAgent, getRecommendedUser, getRecommendedForAgent, ratingForAgent, ratingForAthlet, getAthletRatings, getAgentRatings } from '../controllers/authController';
import { verifyToken } from '../middleware/authMiddleware'; // Import the middleware
import Sport from '../models/Soprts';

const router = express.Router();

router.post('/register', registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);
router.post('/agentRating',verifyToken,ratingForAgent);
router.post('/athletRating',verifyToken,ratingForAthlet);

// Apply the `verifyToken` middleware to protect these routes
router.get('/sports', getSports);
router.get('/athletSearch', verifyToken, searchByName);
router.get('/agentSearch', verifyToken, searchByNameForAgent);
router.get('/logout', verifyToken, logout);
router.get('/recommendations',verifyToken,getRecommendedUser);
router.get('/recommendationsForAgent',verifyToken,getRecommendedForAgent);
router.get('/getAthletRating',verifyToken,getAthletRatings);
router.get('/getAgentRating',verifyToken,getAgentRatings)

// router.post('/uploadProfilePic', upload.single('profilePic'), uploadProfilePicture)
router.post('/insert-sports', verifyToken, async (req, res) => {
  // Example route to insert sports, protected by the middleware
  const sports = [
    { name: 'Soccer' },
    { name: 'Basketball' },
    { name: 'Baseball' },
    { name: 'Tennis' },
    { name: 'Cricket' },
    { name: 'Rugby' },
    { name: 'Hockey' },
    { name: 'Golf' },
    { name: 'Volleyball' },
    { name: 'Table Tennis' },
    { name: 'Badminton' },
    { name: 'American Football' },
    { name: 'Swimming' },
    { name: 'Boxing' },
    { name: 'Martial Arts' },
    { name: 'Cycling' },
    { name: 'Athletics' },
    { name: 'Gymnastics' },
    { name: 'Skiing' },
    { name: 'Snowboarding' },
    { name: 'Surfing' },
    { name: 'Horse Racing' },
    { name: 'Fencing' },
    { name: 'Rowing' },
    { name: 'Sailing' },
    { name: 'Skateboarding' },
    { name: 'Snooker' },
    { name: 'Archery' },
    { name: 'Triathlon' },
    { name: 'Wrestling' },
    { name: 'Handball' },
    { name: 'Weightlifting' },
    { name: 'Rock Climbing' },
    { name: 'Esports' },
    { name: 'Motorsport' }
  ];

  try {
    const result = await Sport.insertMany(sports);
    res.status(201).json({ message: `${result.length} sports have been inserted successfully.` });
  } catch (error) {
    console.error('Error inserting sports:', error);
    res.status(500).json({ message: 'Failed to insert sports.', error });
  }
});

export default router;
