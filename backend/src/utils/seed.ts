// src/utils/seed.ts
// Run: npm run seed
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';
import Task from '../models/Task';
import ActivityLog from '../models/ActivityLog';
import { WORKFLOW_COLUMNS } from './columns';

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/taskflow');
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Task.deleteMany({});
    await ActivityLog.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create users
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@taskflow.com',
      password: 'password123',
      role: 'admin',
    });

    const krish = await User.create({
      name: 'Krish',
      email: 'krish@taskflow.com',
      password: 'password123',
      role: 'member',
    });

    const raj = await User.create({
      name: 'Raj',
      email: 'raj@taskflow.com',
      password: 'password123',
      role: 'member',
    });

    const uiuxTeam = await User.create({
      name: 'UI/UX Team',
      email: 'uiux@taskflow.com',
      password: 'password123',
      role: 'member',
    });

    console.log('👥 Users created');

    // Create sample tasks across various columns
    const tasks = [
      {
        title: 'Design Homepage Wireframes',
        description: 'Create low-fidelity wireframes for the new homepage redesign.',
        columnId: WORKFLOW_COLUMNS[0].id, // UI/UX Design To Do
        priority: 'high',
        assignees: [uiuxTeam._id],
        createdBy: admin._id,
        tags: ['wireframes', 'homepage'],
        order: 0,
      },
      {
        title: 'Mobile Navigation Redesign',
        description: 'Redesign the mobile navigation to improve UX for smaller screens.',
        columnId: WORKFLOW_COLUMNS[1].id, // UI/UX Design Done
        priority: 'medium',
        assignees: [uiuxTeam._id, krish._id],
        createdBy: admin._id,
        tags: ['mobile', 'navigation'],
        order: 0,
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
      {
        title: 'Dashboard UI Mockups',
        description: 'High-fidelity mockups for the analytics dashboard.',
        columnId: WORKFLOW_COLUMNS[2].id, // Design Start
        priority: 'urgent',
        assignees: [uiuxTeam._id],
        createdBy: krish._id,
        tags: ['dashboard', 'mockups'],
        order: 0,
      },
      {
        title: 'Design System Color Palette',
        description: 'Define and document the new color palette for the design system.',
        columnId: WORKFLOW_COLUMNS[3].id, // Design Done
        priority: 'low',
        assignees: [uiuxTeam._id],
        createdBy: admin._id,
        tags: ['design-system', 'colors'],
        order: 0,
      },
      {
        title: 'Login Flow Testing',
        description: 'Test the complete login and signup user flows locally.',
        columnId: WORKFLOW_COLUMNS[4].id, // Testing by Local Krish
        priority: 'high',
        assignees: [krish._id],
        createdBy: admin._id,
        tags: ['auth', 'testing'],
        order: 0,
      },
      {
        title: 'Button Component Library',
        description: 'Review all button variants for consistency with new design system.',
        columnId: WORKFLOW_COLUMNS[5].id, // Testing by Local UI/UX Team
        priority: 'medium',
        assignees: [uiuxTeam._id],
        createdBy: krish._id,
        tags: ['components', 'ui'],
        order: 0,
      },
      {
        title: 'API Response Format Review',
        description: 'Review API response formats for consistency.',
        columnId: WORKFLOW_COLUMNS[6].id, // Testing by Local Raj
        priority: 'medium',
        assignees: [raj._id],
        createdBy: admin._id,
        tags: ['api', 'backend'],
        order: 0,
      },
      {
        title: 'Implement Task Drag & Drop',
        description: 'Build the Kanban drag-and-drop functionality using @hello-pangea/dnd.',
        columnId: WORKFLOW_COLUMNS[7].id, // Development Start
        priority: 'urgent',
        assignees: [krish._id, raj._id],
        createdBy: admin._id,
        tags: ['frontend', 'kanban'],
        order: 0,
        deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      },
      {
        title: 'JWT Authentication Middleware',
        description: 'Build and test the JWT-based authentication system.',
        columnId: WORKFLOW_COLUMNS[8].id, // Development Done
        priority: 'high',
        assignees: [raj._id],
        createdBy: admin._id,
        tags: ['auth', 'backend'],
        order: 0,
      },
      {
        title: 'Notification System',
        description: 'Real-time notifications when tasks are assigned or moved.',
        columnId: WORKFLOW_COLUMNS[9].id, // Testing by Krish
        priority: 'medium',
        assignees: [krish._id],
        createdBy: admin._id,
        tags: ['notifications', 'backend'],
        order: 0,
      },
      {
        title: 'File Upload Feature',
        description: 'Allow users to attach files to tasks with size and type validation.',
        columnId: WORKFLOW_COLUMNS[10].id, // Testing by Raj
        priority: 'low',
        assignees: [raj._id],
        createdBy: krish._id,
        tags: ['uploads', 'feature'],
        order: 0,
      },
      {
        title: 'Performance Optimization',
        description: 'Optimize database queries and add proper indexing.',
        columnId: WORKFLOW_COLUMNS[11].id, // Ready for Deployment
        priority: 'high',
        assignees: [krish._id, raj._id],
        createdBy: admin._id,
        tags: ['performance', 'database'],
        order: 0,
      },
      {
        title: 'CI/CD Pipeline Setup',
        description: 'Set up GitHub Actions for automated testing and deployment.',
        columnId: WORKFLOW_COLUMNS[12].id, // Deployed
        priority: 'medium',
        assignees: [raj._id],
        createdBy: admin._id,
        tags: ['devops', 'ci/cd'],
        order: 0,
      },
      {
        title: 'User Onboarding Flow',
        description: 'Post-deployment verification of the complete user onboarding flow.',
        columnId: WORKFLOW_COLUMNS[13].id, // Post-Deploy Testing by Krish
        priority: 'high',
        assignees: [krish._id],
        createdBy: admin._id,
        tags: ['onboarding', 'testing'],
        order: 0,
      },
      {
        title: 'Email Notification Templates',
        description: 'Verify email notification templates render correctly in production.',
        columnId: WORKFLOW_COLUMNS[14].id, // Post-Deploy Testing by Raj
        priority: 'medium',
        assignees: [raj._id],
        createdBy: admin._id,
        tags: ['email', 'notifications'],
        order: 0,
      },
      {
        title: 'v1.0 Release',
        description: 'Initial production release of TaskFlow completed successfully.',
        columnId: WORKFLOW_COLUMNS[15].id, // Completed
        priority: 'urgent',
        assignees: [admin._id, krish._id, raj._id],
        createdBy: admin._id,
        tags: ['release', 'milestone'],
        order: 0,
      },
    ];

    const createdTasks = await Task.insertMany(tasks);
    console.log(`✅ ${createdTasks.length} tasks created`);

    // Create some activity logs
    const logs = createdTasks.map((task, i) => ({
      taskId: task._id,
      userId: admin._id,
      action: 'created',
      toColumn: task.columnId,
      details: `Task created`,
    }));
    await ActivityLog.insertMany(logs);
    console.log('📋 Activity logs created');

    console.log('\n🎉 Seed complete!\n');
    console.log('👤 Login credentials:');
    console.log('   Admin:     admin@taskflow.com   / password123');
    console.log('   Krish:     krish@taskflow.com   / password123');
    console.log('   Raj:       raj@taskflow.com     / password123');
    console.log('   UI/UX:     uiux@taskflow.com    / password123\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
};

seed();
