// routes/authRoutes.ts

import express from 'express';
import  { Request, Response } from 'express';
import { registerValidation, loginValidation, validate } from '../utils/validate';
import { register, login, getSports, searchByName, logout, uploadProfilePicture, searchByNameForAgent, getRecommendedUser, getRecommendedForAgent, ratingForAgent, ratingForAthlet, getAthletRatings, getAgentRatings, setEvent, getUserEvents, getProfile, getAgentProfile, delEvent, rescheduleEvent, validateOTP, subscribeUser } from '../controllers/authController';
import { verifyToken } from '../middleware/authMiddleware'; // Import the middleware
import Sport from '../models/Soprts';
import multer, { StorageEngine } from 'multer';
import path from 'path';
import User from '../models/User';
import UserAsAgent from '../models/UserAsAgent';
import mongoose from 'mongoose';
import { subscribe } from 'diagnostics_channel';

const router = express.Router();
const storage: StorageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Directory to save uploaded files
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}${path.extname(file.originalname)}`); // Add a timestamp to the filename
  },
});


const upload = multer({ storage });

// router.post('/register', upload.single('profilePic'),upload.single('certificate'),registerValidation, validate, register);
router.post('/register', 
  upload.fields([
    { name: 'profilePic', maxCount: 1 }, 
    { name: 'certificate', maxCount: 1 }
  ]), 
  registerValidation, 
  validate, 
  register
);

router.post('/login', loginValidation, validate, login);
router.post('/agentRating',verifyToken,ratingForAgent);
router.post('/athletRating',verifyToken,ratingForAthlet);
router.post('/setEvent',setEvent);
router.delete('/cancelEvent',verifyToken,delEvent);
router.put('/rescheduleEvent',verifyToken,rescheduleEvent);
router.post('/validate-otp',validateOTP);
router.post('/subscribe',verifyToken,subscribeUser);
// Apply the `verifyToken` middleware to protect these routes
router.get('/sports', getSports);
router.get('/athletSearch', verifyToken, searchByName);
router.get('/agentSearch', verifyToken, searchByNameForAgent);
router.get('/logout', verifyToken, logout);
router.get('/recommendations',verifyToken,getRecommendedUser);
router.get('/recommendationsForAgent',verifyToken,getRecommendedForAgent);
router.get('/getAthletRating',verifyToken,getAthletRatings);
router.get('/getAgentRating',verifyToken,getAgentRatings);
router.get('/getEventsOfUser',verifyToken,getUserEvents);
router.get('/getUserProfile',verifyToken,getProfile)
router.get('/getAgentProfile',verifyToken,getAgentProfile)

// router.post('/uploadProfilePic', upload.single('profilePic'), uploadProfilePicture)


// interface UpdateUserProfileRequest extends Request {
//   body: {
//     email: string; // Use email instead of userId
//     firstName?: string;
//     lastName?: string;
//     age?:number;
//     height?:number;
//     weight?:number;
//     gender?:string;
//     school?: string;
//     sports?: string[];
//     dob?:string;
//     location?:string;
//     position?:string;
//     achievements?: string;
//     futureGoals?: string;
//     certificateName?:string;
//   };
//   file?: Express.Multer.File; // Include the file type for Multer
// }
// Update user profile with image upload
// router.put('/profile', upload.single('profilePic'), async (req: UpdateUserProfileRequest, res: Response) => {
//   const { email, firstName, lastName, achievements, futureGoals } = req.body;
//   const profilePic = req.file ? `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}` : undefined;
//   try {
//     // Find user by email and update the fields
//     const updatedUser = await User.findOneAndUpdate(
//       { email }, // Search by email
//       {
//         firstName,
//         lastName,
//         achievements,
//         futureGoals,
//         ...(profilePic && { profilePic }), // Only include profilePic if it was uploaded
//       },
//       { new: true, runValidators: true } // Return the updated document
//     ).select('firstName lastName achievements futureGoals profilePic email age height gender sports school isAthlet');

//     if (!updatedUser) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     // Respond with the updated fields
//     res.json({
//       message: 'Profile updated successfully',
//       user: updatedUser,
//     });
//   } catch (error) {
//     res.status(500).json({ message: 'Error updating profile', error: (error as Error).message });
//   }
// });
interface UpdateUserProfileRequest extends Request {
  body: {
    email: string;
    firstName?: string;
    lastName?: string;
    age?: number;
    height?: number;
    weight?: number;
    gender?: string;
    school?: string;
    sports?: string[];
    dob?: string;
    location?: string;                                                                                                                                                                                                                                                                                                                                                                                        
    position?: string;
    achievements?: string;
    futureGoals?: string;
    certificateName?: string;
    stats?:string;
  };
  files?: {
    profilePic?: Express.Multer.File[]; // Array for profilePic
    certificate?: Express.Multer.File[]; // Array for certificate
  } | {
    [fieldname: string]: Express.Multer.File[]; // For other possible file types
  } | Express.Multer.File[]; // For compatibility with other file array structures
}


router.put(
  '/profile',
  upload.fields([
    { name: 'profilePic', maxCount: 1 },
    { name: 'certificate', maxCount: 1 }
  ]),
  async (req, res: Response) => {
    const request = req as UpdateUserProfileRequest;

    // Type narrow `request.files` to ensure properties exist
    const profilePic =
      request.files &&
      'profilePic' in request.files &&
      request.files.profilePic
        ? `${req.protocol}://${req.get('host')}/uploads/${request.files.profilePic[0].filename}`
        : undefined;

    const certificate =
      request.files &&
      'certificate' in request.files &&
      request.files.certificate
        ? `${req.protocol}://${req.get('host')}/uploads/${request.files.certificate[0].filename}`
        : undefined;

    const {
      email,
      firstName,
      lastName,
      age,
      height,
      weight,
      gender,
      school,
      sports,
      dob,
      location,
      position,
      achievements,
      futureGoals,
      certificateName,
      stats
    } = request.body;

    try {
      const updatedUser = await User.findOneAndUpdate(
        { email },
        {
          firstName,
          lastName,
          age,
          height,
          weight,
          gender,
          school,
          sports,
          dob,
          location,
          position,
          achievements,
          futureGoals,
          certificateName,
          stats,
          ...(profilePic && { profilePic }), // Only include if uploaded
          ...(certificate && { certificate }) // Only include if uploaded
        },
        { new: true, runValidators: true }
      ).select(
        'email firstName lastName age height weight gender school sports dob location position achievements futureGoals profilePic certificate certificateName'
      );

      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({
        message: 'Profile updated successfully',
        user: updatedUser,
      });
    } catch (error) {
      res.status(500).json({ message: 'Error updating profile', error: (error as Error).message });
    }
  }
);



interface UpdateAgentsProfileRequest extends Request {
  body: {
    email: string;
    firstName?: string;
    lastName?: string;
    yoe?:number;
    professionalBackground:string;
    specialization:string[];
    dob?: string;
    location?: string;
    position?: string;
    descriptions?: string[];
    stats?:string;
    certificateName?: string;
  };
  files?: {
    profilePic?: Express.Multer.File[]; // Array for profilePic
    certificate?: Express.Multer.File[]; // Array for certificate
  } | {
    [fieldname: string]: Express.Multer.File[]; // For other possible file types
  } | Express.Multer.File[]; // For compatibility with other file array structures
}
// router.put('/profileAgent', upload.single('profilePic'), async (req: UpdateAgentsProfileRequest, res: Response) => {
//   const { email, firstName, lastName, professionalBackground, descriptions } = req.body;
//   const profilePic = req.file ? `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}` : undefined;
//   try {
//     // Find user by email and update the fields
//     const updatedUser = await UserAsAgent.findOneAndUpdate(
//       { email }, // Search by email
//       {
//         firstName,
//         lastName,
//         professionalBackground,
//         descriptions,
//         ...(profilePic && { profilePic }), // Only include profilePic if it was uploaded
//       },
//       { new: true, runValidators: true } // Return the updated document
//     ).select('firstName lastName achievements futureGoals profilePic email age height gender sports school isAthlet');

//     if (!updatedUser) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     // Respond with the updated fields
//     res.json({
//       message: 'Profile updated successfully',
//       user: updatedUser,
//     });
//   } catch (error) {
//     res.status(500).json({ message: 'Error updating profile', error: (error as Error).message });
//   }
// });
router.put(
  '/profileAgent',
  upload.fields([
    { name: 'profilePic', maxCount: 1 },
    { name: 'certificate', maxCount: 1 }
  ]),
  async (req: UpdateAgentsProfileRequest, res: Response) => {
    const request = req as UpdateAgentsProfileRequest;
    const {
      email,
      firstName,
      lastName,
      yoe,
      professionalBackground,
      specialization,
      dob,
      location,
      position,
      descriptions,
      stats,
      certificateName
    } = request.body;

    // Extract file URLs if they were uploaded
    const profilePic =
      request.files &&
      'profilePic' in request.files &&
      request.files.profilePic
        ? `${req.protocol}://${req.get('host')}/uploads/${request.files.profilePic[0].filename}`
        : undefined;

    const certificate =
      request.files &&
      'certificate' in request.files &&
      request.files.certificate
        ? `${req.protocol}://${req.get('host')}/uploads/${request.files.certificate[0].filename}`
        : undefined;

    try {
      // Find user by email and update the fields
      const updatedUser = await UserAsAgent.findOneAndUpdate(
        { email },
        {
          firstName,
          lastName,
          yoe,
          professionalBackground,
          specialization,
          dob,
          location,
          position,
          descriptions,
          stats,
          certificateName,
          ...(profilePic && { profilePic }), // Only include profilePic if uploaded
          ...(certificate && { certificate }) // Only include certificate if uploaded
        },
        { new: true, runValidators: true } // Return the updated document
      ).select('email firstName lastName yoe professionalBackground specialization dob location position descriptions stats certificateName profilePic certificate');

      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Respond with the updated fields
      res.json({
        message: 'Profile updated successfully',
        user: updatedUser,
      });
    } catch (error) {
      res.status(500).json({ message: 'Error updating profile', error: (error as Error).message });
    }
  }
);

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

router.get('/user/:id', async (req: Request, res: Response) => {
  try {
    // Extract the userId from the request parameters
    const userIdString = req.params.id;

    // Convert the string userId to ObjectId
    const userId = new mongoose.Types.ObjectId(userIdString);

    // Fetch the user by _id
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return the user
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user', error: (error as Error).message });
  }
});
router.get('/userAgent/:id', async (req: Request, res: Response) => {
  try {
    // Extract the userId from the request parameters
    const userIdString = req.params.id;

    // Convert the string userId to ObjectId
    const userId = new mongoose.Types.ObjectId(userIdString);

    // Fetch the user by _id
    const user = await UserAsAgent.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    // Return the user
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user', error: (error as Error).message });
  }
});
export default router;
