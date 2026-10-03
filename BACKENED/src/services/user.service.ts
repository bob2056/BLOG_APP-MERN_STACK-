import { User, IUser } from '../models/User';
import { Post } from '../models/Post';
import { Follow } from '../models/Follow';
import { UpdateProfileInput } from '../validators/user.validator';
import { AppError } from '../utils/appError';

export interface UserProfileResponse {
  user: Record<string, unknown>;
  stats: {
    postsCount: number;
    followersCount: number;
    followingCount: number;
  };
}

export class UserService {
  static async getProfileByUsername(username: string): Promise<UserProfileResponse> {
    const normalizedUsername = username.trim().toLowerCase();

    const user = await User.findOne({ username: normalizedUsername });
    if (!user) {
      throw AppError.notFound(`User '@${normalizedUsername}' not found.`);
    }

    if (!user.isActive) {
      throw AppError.notFound('This account is currently inactive.');
    }

    // Aggregate statistics
    const [postsCount, followersCount, followingCount] = await Promise.all([
      Post.countDocuments({ author: user._id, status: 'PUBLISHED' }),
      Follow.countDocuments({ following: user._id }),
      Follow.countDocuments({ follower: user._id }),
    ]);

    return {
      user: user.toJSON(),
      stats: {
        postsCount,
        followersCount,
        followingCount,
      },
    };
  }

  static async updateProfile(userId: string, input: UpdateProfileInput): Promise<IUser> {
    const user = await User.findById(userId);
    if (!user) {
      throw AppError.notFound('User not found.');
    }

    // Check if new username is taken
    if (input.username && input.username !== user.username) {
      const normalizedUsername = input.username.trim().toLowerCase();
      const existing = await User.findOne({
        username: normalizedUsername,
        _id: { $ne: userId },
      }).lean();

      if (existing) {
        throw AppError.conflict('Username is already taken by another user.', {
          username: 'Username is already taken',
        });
      }
      user.username = normalizedUsername;
    }

    if (input.name !== undefined) user.name = input.name;
    if (input.bio !== undefined) user.bio = input.bio;

    await user.save();
    return user;
  }

  static async updateAvatar(userId: string, avatarUrl: string): Promise<IUser> {
    const user = await User.findById(userId);
    if (!user) {
      throw AppError.notFound('User not found.');
    }

    user.avatar = avatarUrl;
    await user.save();
    return user;
  }
}
