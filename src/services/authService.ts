// services/authService.ts

import User from '../models/User';
import UserAsAgent from '../models/UserAsAgent';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import Sport from '../models/Soprts';
import AgentRating from '../models/AgentRating';
import AthletRating from '../models/athletRating';

dotenv.config();

interface RegisterUser {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  age: number;
  height:number;
  gender:string;
  sports: string[];
  futureGoals?:string;
  achievements?:string;
  isAthlet?: boolean;
}
interface registerUserAsAgent {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  professionalBackground:string;
  descriptions:string;
  specialization:string
  isAthlet?: boolean;
}
interface agentRating {
  userId: string;   
    agentId: string;  
    rating: number;   
    feedback?: string; 
    createdAt: Date;  
}
interface athletRating {
  agentId : string;   
  userId: string;  
    rating: number;   
    feedback?: string; 
    createdAt: Date;  
}

export const registerUser = async (userData: RegisterUser) => {
  // Check if a user already exists with the same firstName and lastName (case-insensitive)
  const existingUser = await User.findOne({
    email: { $regex: new RegExp(`^${userData.email}$`, "i") }
  });

  if (existingUser) {
    throw new Error("User with the same email already exists.");
  }

  const user = new User(userData);
  return await user.save();
};
export const registerUserAsAgent = async(userData: registerUserAsAgent)=>{
  const existingUser = await UserAsAgent.findOne({
    email: { $regex: new RegExp(`^${userData.email}$`, "i") }
  });

  if (existingUser) {
    throw new Error("User as agent with the same email already exists.");
  }

  const user = new UserAsAgent(userData);
  return await user.save();
}


export const loginUser = async (email: string, password: string,isAthlet:boolean) => {
  const user = isAthlet?await User.findOne({ email }):await UserAsAgent.findOne({ email });
  if (!user) throw new Error('Invalid credentials');

  const isMatch = await user.matchPassword(password);
  if (!isMatch) throw new Error('Invalid credentials');

  // Generate JWT token
  const token = jwt.sign(
    { id: user._id, isAthlet: user.isAthlet },
    process.env.JWT_SECRET!,
    { expiresIn: '1h' }
  );

  return { token, userDetails: user };
};

export const sportsList = async (req: any, res: any) => {
  try {
    const sportsList = await Sport.find(); // Query to get all sports documents
    console.log('List Of Sports', JSON.stringify(sportsList));
    res.json(sportsList); // Send the sports list as JSON
  } catch (error) {
    throw new Error("User with the same email already exists.");
    }
};

export const searchByNames = async (req: any) => {
  let users; // To handle multiple results

  const searchTerm = req.query.searchTerm; // The search term from query parameters

  // If no search term is provided, return an empty response or error
  if (!searchTerm) {
    throw new Error('Please provide a search term.');
  }

  // Use the $or operator to search in firstName, lastName, and email fields
  const query = {
    $or: [
      { firstName: { $regex: searchTerm, $options: 'i' } }, // Case-insensitive search in firstName
      { lastName: { $regex: searchTerm, $options: 'i' } },  // Case-insensitive search in lastName
      { email: { $regex: searchTerm, $options: 'i' } }      // Case-insensitive search in email
    ]
  };

  // Fetch the users based on the dynamic query
  users = await User.find(query);

  if (!users || users.length === 0) {
    throw new Error('No users found'); // Return error if no user matches
  }

  console.log(users);
  return users; // Return the list of users
};
export const agentSearches = async (req: any) => {
  let users; // To handle multiple results

  const searchTerm = req.query.searchTerm; // The search term from query parameters

  // If no search term is provided, return an empty response or error
  if (!searchTerm) {
    throw new Error('Please provide a search term.');
  }

  // Use the $or operator to search in firstName, lastName, and email fields
  const query = {
    $or: [
      { firstName: { $regex: searchTerm, $options: 'i' } }, // Case-insensitive search in firstName
      { lastName: { $regex: searchTerm, $options: 'i' } },  // Case-insensitive search in lastName
      { email: { $regex: searchTerm, $options: 'i' } }      // Case-insensitive search in email
    ]
  };

  // Fetch the users based on the dynamic query
  users = await UserAsAgent.find(query);

  if (!users || users.length === 0) {
    throw new Error('No users found'); // Return error if no user matches
  }

  console.log(users);
  return users; // Return the list of users
};

// Function to get recommended users based on matching sports
export const getRecommendedUsers = async (req: any) => {
  // Extract email from query parameters
  const { email } = req.query;

  if (!email) {
    throw new Error('Email parameter is required.');
  }

  // Find the user by email
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error('User not found.');
  }

  const sportsList = user.sports; // Get the sports list from the found user

  if (!sportsList || sportsList.length === 0) {
    throw new Error('User has no sports associated.');
  }

  // Create a query to find users whose sports match any of the provided sports
  const query = {
    specialization: { $in: sportsList }, // Use MongoDB's $in operator to match any sport in the sports array
  };

  // Fetch users who match the query
  const users = await UserAsAgent.find(query);

  if (!users || users.length === 0) {
    return [];
  }

  return users; // Return the list of users
};
export const getRecommendedForAgents = async (req: any) => {
  // Extract email from query parameters
  const { email } = req.query;

  if (!email) {
    throw new Error('Email parameter is required.');
  }

  // Find the user by email
  const user = await UserAsAgent.findOne({ email });

  if (!user) {
    throw new Error('User not found.');
  }

  const sportsList = user.specialization; // Get the sports list from the found user

  if (!sportsList || sportsList.length === 0) {
    throw new Error('User has no sports associated.');
  }

  // Create a query to find users whose sports match any of the provided sports
  const query = {
    sports: { $in: sportsList }, // Use MongoDB's $in operator to match any sport in the sports array
  };

  // Fetch users who match the query
  const users = await User.find(query);

  if (!users || users.length === 0) {
   return [];
  }

  return users; // Return the list of users
};
export const ratingForAgents=async (rating:agentRating) => {
  const rate = new AgentRating(rating);
  await rate.save();
  return ;

};
export const ratingForAthlets=async (rating:athletRating) => {
  const rate = new AthletRating(rating);
  await rate.save();
  return ;

};
export const getAthletRating=async (req:any,res:any) => {
  const query = {
    userId: req.query.userId, // Use MongoDB's $in operator to match any sport in the sports array
  };
  const ratings = await AthletRating.find(query)
  const averageRating = await AthletRating.aggregate([
    { $match: { userId: req.query.userId } }, // Filter by the agentId
    {
      $group: {
        _id: "$userId", // Group by agentId
        averageRating: { $avg: "$rating" } // Calculate the average rating
      }
    }
  ]);
  
  if (!ratings || ratings.length === 0) {
    throw new Error('No ratings are there for the athlet');
  }
  return {ratings,averageRating};

};
export const getAgentRating=async (req:any,res:any) => {
  const query = {
    agentId: req.query.agentId, // Use MongoDB's $in operator to match any sport in the sports array
  };
  const ratings = await AgentRating.find(query)
  const averageRating = await AgentRating.aggregate([
    { $match: { agentId: req.query.agentId } }, // Filter by the agentId
    {
      $group: {
        _id: "$agentId", // Group by agentId
        averageRating: { $avg: "$rating" } // Calculate the average rating
      }
    }
  ]);
  
  if (!ratings || ratings.length === 0) {
    throw new Error('No ratings are there for the agent');
  }
  return {ratings,averageRating};

};