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
  const teams = await Team.find().populate('members').lean();
  return teams.map((team) => ({
    ...team,
    members: (team.members as any[]).map((m) => m._id ?? m),
  }));
}

export async function createTeam(input: unknown) {
  if (!input || typeof input !== 'object') {
    throw Object.assign(new Error('Team data is required'), { status: 400 });
  }

  const { name, mascot, members } = input as Record<string, unknown>;

  if (!name) {
    throw Object.assign(new Error('Team name is required'), { status: 400 });
  }

  const team = await Team.create({
    name,
    mascot: mascot ?? '',
    members: members ?? [],
  });

  return team.toObject();
}

export async function getLeaderboard() {
  const teams = await Team.find().lean();
  
  const leaderboard = await Promise.all(
    teams.map(async (team) => {
      const totalPoints = await Activity.aggregate([
        { $match: { team: team._id } },
        { $group: { _id: null, sum: { $sum: '$points' } } },
      ]);
      
      return {
        teamName: team.name,
        totalPoints: totalPoints[0]?.sum ?? 0,
        team: team._id,
      };
    })
  );

  return leaderboard
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .map((entry, index) => ({
      teamName: entry.teamName,
      totalPoints: entry.totalPoints,
      rank: index + 1,
    }));
}

export async function suggestWorkouts(userEmail: string) {
  const user = await User.findOne({ email: userEmail }).lean();
  
  if (!user) {
    throw Object.assign(new Error('User not found'), { status: 404 });
  }

  const recentActivities = await Activity.find({ user: user._id }).sort({ occurredAt: -1 }).limit(5).lean();
  
  let focus = user.fitnessGoal;
  if (recentActivities.length > 0) {
    const activityCounts: Record<string, number> = {};
    for (const activity of recentActivities) {
      activityCounts[activity.type] = (activityCounts[activity.type] ?? 0) + 1;
    }
    
    const dominantType = Object.entries(activityCounts).sort(([, a], [, b]) => b - a)[0]?.[0];
    if (dominantType === 'run' || dominantType === 'walk') {
      focus = 'endurance';
    } else if (dominantType === 'strength') {
      focus = 'strength';
    } else if (dominantType === 'cycle') {
      focus = 'endurance';
    }
  }

  const workouts = await Workout.find({ focus }).lean();
  
  return workouts.map((workout) => ({
    ...workout,
    reason: recentActivities.length > 0
      ? `Matches your recent ${recentActivities[0].type} activity`
      : `Matches your ${focus} fitness goal`,
  }));
}

export { User };
