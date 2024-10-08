import mongoose, { Date, Document, ObjectId, Schema } from 'mongoose';

interface IRating extends Document {
    userId: string;   // The ID of the user who gives the rating
    agentId: string;  // The ID of the agent who receives the rating
    rating: number;   // The rating value, typically between 1 and 5
    feedback?: string; // Optional feedback or comments about the agent
    createdAt: Date;  // Timestamp of when the rating was created
}

const RatingSchema: Schema = new Schema({
    userId: { type: String, ref: 'User', required: true }, // Corrected to ObjectId
  agentId: { type: String, ref: 'UserAsAgent', required: true }, // Corrected to ObjectId
  rating: { type: Number, required: true, min: 1, max: 5 },
  feedback: { type: String, required: false },
  createdAt: { type: Date, default: Date.now }
  });
  

const AgentRating = mongoose.model<IRating>('AgentRating', RatingSchema);

export default AgentRating;
