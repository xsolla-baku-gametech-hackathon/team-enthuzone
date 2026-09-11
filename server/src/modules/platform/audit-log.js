const { AuditLog } = require("./models");

const AUDIT_ACTIONS = Object.freeze({
  AUTH_REGISTER: "AUTH_REGISTER",
  AUTH_LOGIN_SUCCESS: "AUTH_LOGIN_SUCCESS",
  AUTH_LOGIN_FAILED: "AUTH_LOGIN_FAILED",
  WORKSPACE_CREATED: "WORKSPACE_CREATED",
  WORKSPACE_UPDATED: "WORKSPACE_UPDATED",
  WORKSPACE_DELETED: "WORKSPACE_DELETED",
  CONNECTION_CREATED: "CONNECTION_CREATED",
  CONNECTION_TOGGLED: "CONNECTION_TOGGLED",
  CONNECTION_DELETED: "CONNECTION_DELETED",
  ISSUE_STATUS_CHANGED: "ISSUE_STATUS_CHANGED",
  ISSUE_RECOMMENDATION_REQUESTED: "ISSUE_RECOMMENDATION_REQUESTED",
  ADMIN_LOGS_VIEWED: "ADMIN_LOGS_VIEWED",
});

async function recordAuditLog({
  orgId,
  actorUserId,
  actorEmail,
  action,
  resourceType,
  resourceId,
  metadata,
  ip,
} = {}) {
  try {
    await AuditLog.create({
      orgId,
      actorUserId,
      actorEmail,
      action,
      resourceType,
      resourceId,
      metadata,
      ip,
    });
  } catch (error) {
    console.error("audit-log: failed to record event", {
      action,
      error: error?.message,
    });
  }
}

async function listAuditLogs({
  orgId,
  action,
  actorUserId,
  from,
  to,
  page = 1,
  pageSize = 50,
} = {}) {
  const query = {};
  if (orgId) query.orgId = orgId;
  if (action) query.action = action;
  if (actorUserId) query.actorUserId = actorUserId;
  if (from || to) {
    query.createdAt = {};
    if (from) query.createdAt.$gte = new Date(from);
    if (to) query.createdAt.$lte = new Date(to);
  }
  const limit = Math.min(Math.max(Number(pageSize) || 50, 1), 200);
  const currentPage = Math.max(Number(page) || 1, 1);
  const skip = (currentPage - 1) * limit;
  const [items, total] = await Promise.all([
    AuditLog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    AuditLog.countDocuments(query),
  ]);
  return { items, total, page: currentPage, pageSize: limit };
}

module.exports = { AUDIT_ACTIONS, recordAuditLog, listAuditLogs };
