import { User, IUser } from '../models/User';
import { RegisterInput, LoginInput, ChangePasswordInput } from '../validators/auth.validator';
import { hashPassword, comparePassword } from '../utils/password';
import { signToken } from '../utils/jwt';
import { AppError } from '../utils/appError';

export interface AuthResult {
  user: Record<string, unknown>;
  token: string;
}

export class AuthService {
  static async register(input: RegisterInput): Promise<AuthResult> {
    const normalizedEmail = input.email.trim().toLowerCase();
    const normalizedUsername = input.username.trim().toLowerCase();

    // Check if email already exists
    const existingEmail = await User.findOne({ email: normalizedEmail }).lean();
    if (existingEmail) {
      throw AppError.conflict('An account with this email address already exists.', {
        email: 'Email is already registered',
      });
    }

    // Check if username already exists
    const existingUsername = await User.findOne({ username: normalizedUsername }).lean();
    if (existingUsername) {
      throw AppError.conflict('This username is already taken. Please choose another.', {
        username: 'Username is already taken',
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(input.password);

    // Create user
    const newUser = await User.create({
      name: input.name.trim(),
      username: normalizedUsername,
      email: normalizedEmail,
      password: hashedPassword,
      avatar: input.avatar || '',
      bio: input.bio || '',
      role: 'USER',
      isActive: true,
    });

    // Generate JWT
    const token = signToken({
      userId: newUser._id.toString(),
      email: newUser.email,
      username: newUser.username,
      role: newUser.role,
    });

    const userObj = newUser.toJSON();

    return {
      user: userObj,
      token,
    };
  }

  static async login(input: LoginInput): Promise<AuthResult> {
    const normalizedEmail = input.email.trim().toLowerCase();

    // Find user by email and explicitly include password field
    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    if (!user) {
      throw AppError.unauthorized('Invalid email or password.');
    }

    if (!user.isActive) {
      throw AppError.forbidden('Your account has been deactivated. Please contact support.');
    }

    // Compare password
    const isMatch = await comparePassword(input.password, user.password || '');
    if (!isMatch) {
      throw AppError.unauthorized('Invalid email or password.');
    }

    // Generate JWT
    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
      username: user.username,
      role: user.role,
    });

    const userObj = user.toJSON();

    return {
      user: userObj,
      token,
    };
  }

  static async getMe(userId: string): Promise<IUser> {
    const user = await User.findById(userId);
    if (!user) {
      throw AppError.notFound('User not found.');
    }
    return user;
  }

  static async changePassword(userId: string, input: ChangePasswordInput): Promise<void> {
    const user = await User.findById(userId).select('+password');
    if (!user) {
      throw AppError.notFound('User not found.');
    }

    const isMatch = await comparePassword(input.currentPassword, user.password || '');
    if (!isMatch) {
      throw AppError.badRequest('Incorrect current password.', {
        currentPassword: 'The current password you provided does not match.',
      });
    }

    if (input.currentPassword === input.newPassword) {
      throw AppError.badRequest('New password must be different from current password.', {
        newPassword: 'New password cannot be identical to current password.',
      });
    }

    user.password = await hashPassword(input.newPassword);
    await user.save();
  }
}
