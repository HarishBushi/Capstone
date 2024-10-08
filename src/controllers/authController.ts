import { Request, Response } from 'express';
import { registerUser, loginUser, sportsList, searchByNames, registerUserAsAgent, agentSearches, getRecommendedUsers, getRecommendedForAgents, ratingForAgents, ratingForAthlets, getAthletRating, getAgentRating } from '../services/authService';
import { blacklist } from '../middleware/authMiddleware';
import ProfilePicture from '../models/ProfilePicture';
export const register = async (req: Request, res: Response) => {
  try {
  
    const user = req.body.isAthlet ? await registerUser(req.body):await registerUserAsAgent(req.body);
    res.status(201).json({ message: 'User registered successfully', user });
  } catch (error:any) {
    res.status(400).json({ error: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { token, userDetails } = await loginUser(req.body.email, req.body.password,req.body.isAthlet);
    res.json({ token, userDetails });
  } catch (error:any) {
    res.status(400).json({ error: error.message });
  }
};
export const getSports= async(req:Request,res:Response)=>{
  try {
    const list = await sportsList(req,res);
    res.json(list);
  } catch (error:any) {
    res.status(400).json({ error: error.message });
  }
}

export const searchByName = async(req:Request,res:Response)=>{
  try{
    const details = await searchByNames(req);
    res.json(details);
  }catch (error:any) {
    res.status(400).json({ error: error.message });
  }
}
export const searchByNameForAgent = async(req:Request,res:Response)=>{
  try{
    const details = await agentSearches(req);
    res.json(details);
  }catch (error:any) {
    res.status(400).json({ error: error.message });
  }
}
export const getAthletRatings = async(req:Request,res:Response)=>{
  try{
    const details = await getAthletRating(req,res);
    res.json(details);
  }catch (error:any) {
    res.status(400).json({ error: error.message });
  }
}
export const getAgentRatings = async(req:Request,res:Response)=>{
  try{
    const details = await getAgentRating(req,res);
    res.json(details);
  }catch (error:any) {
    res.status(400).json({ error: error.message });
  }
}
export const getRecommendedUser = async(req:Request,res:Response)=>{
  try {
    const users = await getRecommendedUsers(req);
    res.json(users);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}
export const getRecommendedForAgent = async(req:Request,res:Response)=>{
  try {
    const users = await getRecommendedForAgents(req);
    res.json(users);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}
export const ratingForAgent = async (req: Request, res: Response) => {
  try {
    const rate = await ratingForAgents(req.body);
    res.status(200).json({ message: 'Rated Successfully', rate });
  } catch (error:any) {
    res.status(400).json({ error: error.message });
  }
};
export const ratingForAthlet = async (req: Request, res: Response) => {
  try {
    const rate = await ratingForAthlets(req.body);
    res.status(200).json({ message: 'Rated Successfully', rate });
  } catch (error:any) {
    res.status(400).json({ error: error.message });
  }
};
export const logout = (req: Request, res: Response) => {
  const token = req.header('Authorization')?.split(' ')[1];

  if (!token) {
    return res.status(400).json({ message: 'No token provided' });
  }

  // Add the token to the blacklist
  blacklist.add(token);

  res.status(200).json({ message: 'User logged out successfully' });
};
export const uploadProfilePicture = async (req: Request, res: Response) => {
  try {
    if (!req.body.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { email } = req.body; // Get the email from the request body
    const filePath = req.body.file.path; // Get the file path from the uploaded file

    // Find if an existing profile picture entry is present for the user
    const existingProfilePic = await ProfilePicture.findOne({ email });

    if (existingProfilePic) {
      // Update the existing entry
      existingProfilePic.imagePath = filePath;
      existingProfilePic.uploadedAt = new Date();
      await existingProfilePic.save();
    } else {
      // Create a new profile picture entry
      const newProfilePicture = new ProfilePicture({ email, imagePath: filePath });
      await newProfilePicture.save();
    }

    res.json({ message: 'Profile picture uploaded successfully', profilePicture: filePath });
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    res.status(500).json({ message: 'Error uploading profile picture', error });
  }
};
