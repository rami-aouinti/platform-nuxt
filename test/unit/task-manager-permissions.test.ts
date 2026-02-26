import { describe, expect, it } from 'vitest'
import {
  canCancelTaskRequest,
  canManageProject,
  canManageTask,
  canReviewTaskRequest,
} from '../../app/utils/permissions/task-manager'

describe('task-manager permissions', () => {
  const project = { ownerId: 'owner', managerIds: ['manager'] }
  const task = { assigneeId: 'assignee' }
  const request = { requesterId: 'requester' }

  it('allows admin/root to manage project/task/request', () => {
    const admin = { id: 'x', roles: ['ROLE_ADMIN'] }
    const root = { id: 'x', roles: ['ROLE_ROOT'] }

    expect(canManageProject(admin, project)).toBe(true)
    expect(canManageTask(admin, task, project)).toBe(true)
    expect(canReviewTaskRequest(admin, request, { task, project })).toBe(true)
    expect(canCancelTaskRequest(admin, request)).toBe(true)

    expect(canManageProject(root, project)).toBe(true)
    expect(canManageTask(root, task, project)).toBe(true)
    expect(canReviewTaskRequest(root, request, { task, project })).toBe(true)
    expect(canCancelTaskRequest(root, request)).toBe(true)
  })

  it('allows owner and manager to manage project', () => {
    expect(canManageProject({ id: 'owner', roles: [] }, project)).toBe(true)
    expect(canManageProject({ id: 'manager', roles: [] }, project)).toBe(true)
    expect(canManageProject({ id: 'other', roles: [] }, project)).toBe(false)
  })

  it('allows assignee to manage task and review requests for that task', () => {
    const assignee = { id: 'assignee', roles: [] }

    expect(canManageTask(assignee, task, project)).toBe(true)
    expect(canReviewTaskRequest(assignee, request, { task, project })).toBe(true)
  })

  it('allows requester to cancel only their own request', () => {
    expect(canCancelTaskRequest({ id: 'requester', roles: [] }, request)).toBe(true)
    expect(canCancelTaskRequest({ id: 'other', roles: [] }, request)).toBe(false)
  })

  it('denies anonymous users by default', () => {
    expect(canManageProject(null, project)).toBe(false)
    expect(canManageTask(undefined, task, project)).toBe(false)
    expect(canReviewTaskRequest(undefined, request, { task, project })).toBe(false)
    expect(canCancelTaskRequest(undefined, request)).toBe(false)
  })
})
