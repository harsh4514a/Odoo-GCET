import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { getCurrentUser } from '@/lib/auth';
import { profileUpdateSchema } from '@/lib/validations';

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || currentUser.userId;

    // Non-admins can only view their own profile
    if (userId !== currentUser.userId && currentUser.role !== 'Admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const user = await User.findById(userId).select('-password');

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await request.json();
    const { userId, ...updateData } = body;

    const targetUserId = userId || currentUser.userId;

    // Non-admins can only update their own profile with limited fields
    if (targetUserId !== currentUser.userId && currentUser.role !== 'Admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    let allowedUpdates: Record<string, unknown> = {};

    if (currentUser.role === 'Admin') {
      // Admins can update everything
      if (updateData.profile) {
        allowedUpdates['profile.firstName'] = updateData.profile.firstName;
        allowedUpdates['profile.lastName'] = updateData.profile.lastName;
        allowedUpdates['profile.phone'] = updateData.profile.phone;
        allowedUpdates['profile.address'] = updateData.profile.address;
        allowedUpdates['profile.jobTitle'] = updateData.profile.jobTitle;
        allowedUpdates['profile.department'] = updateData.profile.department;
        allowedUpdates['profile.profilePicture'] = updateData.profile.profilePicture;
      }
    } else {
      // Employees can only update limited fields
      const validatedData = profileUpdateSchema.safeParse(updateData);
      if (!validatedData.success) {
        return NextResponse.json(
          { error: 'Invalid input', details: validatedData.error.issues },
          { status: 400 }
        );
      }

      if (validatedData.data.phone !== undefined) {
        allowedUpdates['profile.phone'] = validatedData.data.phone;
      }
      if (validatedData.data.address !== undefined) {
        allowedUpdates['profile.address'] = validatedData.data.address;
      }
      if (validatedData.data.profilePicture !== undefined) {
        allowedUpdates['profile.profilePicture'] = validatedData.data.profilePicture;
      }
    }

    // Remove undefined values
    allowedUpdates = Object.fromEntries(
      Object.entries(allowedUpdates).filter(([, v]) => v !== undefined)
    );

    const user = await User.findByIdAndUpdate(
      targetUserId,
      { $set: allowedUpdates },
      { new: true }
    ).select('-password');

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Profile updated successfully',
      user,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
