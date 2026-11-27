import mongoose from 'mongoose';
import { Activity, Team, User, Workout } from '../models/index.js';

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(input: unknown) {
  if (!input || typeof input !== 'object') {
    throw Object.assign(new Error('Activity data is required'), { status: 400 });
  }

  const { userId, teamId, type, minutes } = input as Record<string, unknown>;

  if (!userId || !teamId || !type || minutes === undefined) {
    throw Object.assign(new Error('userId, teamId, type, and minutes are required'), { status: 400 });
  }

  if (!mongoose.Types.ObjectId.isValid(userId as string)) {
    throw Object.assign(new Error('userId must be a valid ID'), { status: 400 });
  }

  if (!mongoose.Types.ObjectId.isValid(teamId as string)) {
    throw Object.assign(new Error('teamId must be a valid ID'), { status: 400 });
  }

  const user = await User.findById(userId);
  if (!user) {
    throw Object.assign(new Error('User not found'), { status: 400 });
  }

  const team = await Team.findById(teamId);
  if (!team) {
    throw Object.assign(new Error('Team not found'), { status: 400 });
  }

  const points = Math.max(1, Math.round((minutes as number) * 1.0));
  const activity = await Activity.create({
    user: userId,
    team: teamId,
    type,
    minutes,
    points,
    occurredAt: new Date(),
  });

  return activity.toObject();
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(_input: unknown) {
  throw Object.assign(new Error('Team validation is not implemented yet'), { status: 501 });
}

export async function getLeaderboard() {
  return [];
}

export async function suggestWorkouts(_userEmail: string) {
  return Workout.find().limit(1).lean();
}

export { User };
