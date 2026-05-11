import { useEffect, useState } from 'react';
import { getTasks, updateTask, deleteTask } from '../services/api';
import AppLayout from '../layouts/AppLayout';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const statusConfig = {
  TODO: { label: 'Todo', cls: 'badge-todo' },
  IN_PROGRESS: { label: 'In Progress', cls: 'badge-in-progress' },
  COMPLETED: { label: 'Completed', cls: 'badge-completed' },
};

const priorityConfig = {
  LOW: { label: 'Low', cls: 'badge-low' },
  MEDIUM: { label: 'Medium', cls: 'badge-medium' },
  HIGH: { label: 'High', cls: 'badge-high' },
};

const Tasks = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', priority: '', overdue: '' });

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.priority) params.priority = filters.priority;
      if (filters.overdue) params.overdue = 'true';
      const res = await getTasks(params);
      setTasks(res.data);
    } catch {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTasks(); }, [filters]);

  const handleStatusChange = async (taskId, status) => {
    try {
      await updateTask(taskId, { status });
      fetchTasks();
      toast.success('Status updated');
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await deleteTask(id);
      toast.success('Task deleted');
      fetchTasks();
    } catch {
      toast.error('Failed to delete task');
    }
  };

  const clearFilters = () => setFilters({ status: '', priority: '', overdue: '' });

  return (
    <AppLayout title="My Tasks">
      {/* Filter Bar */}
      <div className="filter-bar" style={{ marginBottom: 20 }}>
        <select
          className="filter-select"
          value={filters.status}
          onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
        >
          <option value="">All Statuses</option>
          <option value="TODO">Todo</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
        </select>
        <select
          className="filter-select"
          value={filters.priority}
          onChange={(e) => setFilters((f) => ({ ...f, priority: e.target.value }))}
        >
          <option value="">All Priorities</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
        </select>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: 'var(--text-secondary)', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={!!filters.overdue}
            onChange={(e) => setFilters((f) => ({ ...f, overdue: e.target.checked ? '1' : '' }))}
            style={{ accentColor: 'var(--accent-red)' }}
          />
          Overdue only
        </label>
        {(filters.status || filters.priority || filters.overdue) && (
          <button className="btn btn-ghost btn-sm" onClick={clearFilters}>
            Clear filters
          </button>
        )}
        <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-tertiary)' }}>
          {tasks.length} task{tasks.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Task Table */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <div className="spinner" style={{ width: 32, height: 32 }} />
        </div>
      ) : tasks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 24, height: 24, color: 'var(--text-tertiary)' }}>
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 104 0M9 5a2 2 0 114 0M9 12l2 2 4-4" />
            </svg>
          </div>
          <p className="empty-state-title">No tasks found</p>
          <p className="empty-state-description">
            {Object.values(filters).some(Boolean) ? 'Try removing some filters.' : 'You have no tasks assigned yet.'}
          </p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Task</th>
                <th>Project</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Assignee</th>
                <th>Due Date</th>
                {isAdmin && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => {
                const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED';
                return (
                  <tr key={task.id}>
                    <td>
                      <div>
                        <p style={{ fontWeight: 500 }}>{task.title}</p>
                        {task.description && (
                          <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 280 }}>
                            {task.description}
                          </p>
                        )}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>
                        {task.project?.title || '—'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${priorityConfig[task.priority].cls}`}>
                        {priorityConfig[task.priority].label}
                      </span>
                    </td>
                    <td>
                      {(!isAdmin && task.assignedTo === user.id) ? (
                        <select
                          className="filter-select"
                          value={task.status}
                          onChange={(e) => handleStatusChange(task.id, e.target.value)}
                          style={{ fontSize: 12 }}
                        >
                          <option value="TODO">Todo</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="COMPLETED">Completed</option>
                        </select>
                      ) : (
                        <span className={`badge ${statusConfig[task.status].cls}`}>
                          {statusConfig[task.status].label}
                        </span>
                      )}
                    </td>
                    <td>
                      {task.assignee ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                          <div
                            className="avatar-sm"
                            style={{ width: 22, height: 22, fontSize: 9, background: `hsl(${task.assignee.name.charCodeAt(0) * 7 % 360},60%,50%)` }}
                          >
                            {task.assignee.name[0]}
                          </div>
                          <span style={{ fontSize: 12.5 }}>{task.assignee.name}</span>
                        </div>
                      ) : (
                        <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Unassigned</span>
                      )}
                    </td>
                    <td style={{ fontSize: 12.5, color: isOverdue ? 'var(--accent-red)' : 'var(--text-secondary)', fontWeight: isOverdue ? 600 : 400 }}>
                      {task.dueDate ? (
                        <span>{new Date(task.dueDate).toLocaleDateString()}{isOverdue ? ' ⚠' : ''}</span>
                      ) : '—'}
                    </td>
                    {isAdmin && (
                      <td>
                        <button className="btn-icon" onClick={() => handleDelete(task.id)} style={{ color: 'var(--accent-red)' }}>
                          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 13, height: 13 }}>
                            <path d="M2 4h12M6 4V2h4v2M5 4l1 10h4l1-10" />
                          </svg>
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </AppLayout>
  );
};

export default Tasks;
