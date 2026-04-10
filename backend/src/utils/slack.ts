// src/utils/slack.ts
import https from 'https';
import { getColumnTitle } from './columns';

const WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL || '';
const APP_URL = process.env.FRONTEND_URL || 'https://taskflow-frontend-cubq.onrender.com';

const PRIORITY_EMOJI: Record<string, string> = {
  urgent: '🔴',
  high:   '🟠',
  medium: '🟡',
  low:    '🟢',
};

const COLUMN_EMOJI: Record<string, string> = {
  'uiux-design-todo':               '🎨',
  'uiux-design-done':               '✅',
  'design-start':                   '🖌️',
  'design-done':                    '✅',
  'testing-local-krish':            '🧪',
  'testing-local-uiux-team':        '🧪',
  'testing-local-Project-Manager':  '🧪',
  'development-start':              '💻',
  'development-done':               '✅',
  'testing-krish':                  '🔍',
  'testing-Project-Manager':        '🔍',
  'ready-for-deployment':           '🚀',
  'deployed':                       '🌐',
  'post-deploy-testing-krish':      '🔍',
  'post-deploy-testing Project-Manager': '🔍',
  'completed':                      '🏁',
};

function postToSlack(payload: object): void {
  if (!WEBHOOK_URL) return; // silently skip if webhook not configured

  const body = JSON.stringify(payload);
  const url = new URL(WEBHOOK_URL);

  const options = {
    hostname: url.hostname,
    path: url.pathname,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
    },
  };

  const req = https.request(options, (res) => {
    // fire and forget — don't block the API response
  });
  req.on('error', (err) => {
    console.error('Slack notification failed:', err.message);
  });
  req.write(body);
  req.end();
}

export function notifyTaskCreated(task: {
  _id: string;
  title: string;
  columnId: string;
  priority: string;
  assignees: { name: string }[];
  createdBy: { name: string };
}): void {
  const priorityEmoji = PRIORITY_EMOJI[task.priority] || '⚪';
  const columnEmoji = COLUMN_EMOJI[task.columnId] || '📋';
  const columnTitle = getColumnTitle(task.columnId);
  const taskUrl = `${APP_URL}/board`;
  const assigneeNames = task.assignees.length
    ? task.assignees.map((a) => a.name).join(', ')
    : 'Unassigned';

  postToSlack({
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '✨ New Task Created',
          emoji: true,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*<${taskUrl}|${task.title}>*`,
        },
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Stage:*\n${columnEmoji} ${columnTitle}`,
          },
          {
            type: 'mrkdwn',
            text: `*Priority:*\n${priorityEmoji} ${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}`,
          },
          {
            type: 'mrkdwn',
            text: `*Created by:*\n👤 ${task.createdBy.name}`,
          },
          {
            type: 'mrkdwn',
            text: `*Assigned to:*\n👥 ${assigneeNames}`,
          },
        ],
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: { type: 'plain_text', text: '🔗 View Task on Board', emoji: true },
            url: taskUrl,
            style: 'primary',
          },
        ],
      },
      { type: 'divider' },
    ],
  });
}

export function notifyTaskMoved(task: {
  _id: string;
  title: string;
  priority: string;
  assignees: { name: string }[];
}, fromColumnId: string, toColumnId: string, movedBy: string): void {
  const priorityEmoji = PRIORITY_EMOJI[task.priority] || '⚪';
  const fromEmoji = COLUMN_EMOJI[fromColumnId] || '📋';
  const toEmoji = COLUMN_EMOJI[toColumnId] || '📋';
  const fromTitle = getColumnTitle(fromColumnId);
  const toTitle = getColumnTitle(toColumnId);
  const taskUrl = `${APP_URL}/board`;
  const assigneeNames = task.assignees.length
    ? task.assignees.map((a) => a.name).join(', ')
    : 'Unassigned';

  postToSlack({
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '🔄 Task Moved',
          emoji: true,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*<${taskUrl}|${task.title}>*`,
        },
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*From:*\n${fromEmoji} ${fromTitle}`,
          },
          {
            type: 'mrkdwn',
            text: `*To:*\n${toEmoji} ${toTitle}`,
          },
          {
            type: 'mrkdwn',
            text: `*Priority:*\n${priorityEmoji} ${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}`,
          },
          {
            type: 'mrkdwn',
            text: `*Assigned to:*\n👥 ${assigneeNames}`,
          },
        ],
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `Moved by *${movedBy}*`,
          },
        ],
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: { type: 'plain_text', text: '🔗 View Task on Board', emoji: true },
            url: taskUrl,
            style: 'primary',
          },
        ],
      },
      { type: 'divider' },
    ],
  });
}
