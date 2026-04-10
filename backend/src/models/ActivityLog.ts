// src/models/ActivityLog.ts
import mongoose, { Schema } from 'mongoose';
import { IActivityLog } from '../types';

const activityLogSchema = new Schema<IActivityLog>(
  {
    taskId: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      required: true,
      // e.g., 'created', 'moved', 'assigned', 'commented', 'edited', 'deleted'
    },
    fromColumn: { type: String, default: null },
    toColumn: { type: String, default: null },
    details: { type: String, default: null },
  },
  {
    timestamps: true,
  }
);

activityLogSchema.index({ taskId: 1, createdAt: -1 });
activityLogSchema.index({ userId: 1 });

export default mongoose.model<IActivityLog>('ActivityLog', activityLogSchema);
