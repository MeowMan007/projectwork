import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProjectById, getTasks, createTask, updateTask, deleteTask, getAllUsers } from '../services/api';
import AppLayout from '../layouts/AppLayout';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const taskSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  status: z.enum(['TODO', 'IN_PROGRESS', 'COMPLETED']),
  dueDate: z.string().optional(),
  assignedTo: z.string().optional(),
});

const statusConfig = {
  TODO: { label: 'Todo', cls: 'badge-todo', color: '#8a8a8a' },
  IN_PROGRESS: { label: 'In Progress', cls: 'badge-in-progress', color: '#eab308' },
  COMPLETED: { label: 'Completed', cls: 'badge-completed', color: '#22c55e' },
};

const priorityConfig = {
  LOW: { label: 'Low', cls: 'badge-low' },
  MEDIUM: { label: 'Medium', cls: 'badge-medium' },
  HIGH: { label: 'High', cls: 'badge-high' },
};

const TaskModal = ({ task, projectMembers, onClose, onSave }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: task?.title || '',
      description: task?.description || '',
      priority: task?.priority || 'MEDIUM',
      status: task?.status || 'TODO',
      dueDate: task?.dueDate ? task.dueDate.slice(0, 10) : '',
      assignedTo: task?.assignedTo || '',
    },
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">{task ? 'Edit Task' : 'New Task'}</span>
          <button className="btn-icon" onClick={onClose}>
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14 }}>
              <path d="M2 2l12 12M14 2L2 14" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit(onSave)}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Task Title *</label>
              <input className={`form-input ${errors.title ? 'form-input-error' : ''}`} placeholder="What needs to be done?" {...register('title')} />
              {errors.title && <span className="form-error">{errors.title.message}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-input" rows={3} placeholder="Add more details..." {...register('description')} style={{ resize: 'vertical' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Priority</label>
                <select className="form-input filter-select" {...register('priority')} style={{ cursor: 'pointer' }}>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-input filter-select" {...register('status')} style={{ cursor: 'pointer' }}>
                  <option value="TODO">Todo</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Due Date</label>
                <input type="date" className="form-input" {...register('dueDate')} style={{ colorScheme: 'dark' }} />
              </div>
              <div className="form-group">
                <label className="form-label">Assign To</label>
                <select className="form-input filter-select" {...register('assignedTo')} style={{ cursor: 'pointer' }}>
                  <option value="">Unassigned</option>
                  {projectMembers.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">{task ? 'Save Changes' : 'Create Task'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [view, setView] = useState('kanban'); // 'kanban' | 'table'

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [projRes, taskRes] = await Promise.all([
        getProjectById(id),
        getTasks({ projectId: id }),
      ]);
      setProject(projRes.data);
      setTasks(taskRes.data);
    } catch {
      toast.error('Failed to load project');
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, [id]);

  const handleSaveTask = async (data) => {
    try {
      if (modal?.id) {
        await updateTask(modal.id, data);
        toast.success('Task updated');
      } else {
        await createTask({ ...data, projectId: id });
        toast.success('Task created');
      }
      setModal(null);
      fetchAll();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Operation failed');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await deleteTask(taskId);
      toast.success('Task deleted');
      fetchAll();
    } catch {
      toast.error('Failed to delete task');
    }
  };

  const handleStatusChange = async (taskId, status) => {
    try {
      await updateTask(taskId, { status });
      fetchAll();
    } catch {
      toast.error('Failed to update status');
    }
  };

  if (loading) return (
    <AppLayout title="Loading...">
      <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" style={{ width: 32, height: 32 }} /></div>
    </AppLayout>
  );

  const columns = ['TODO', 'IN_PROGRESS', 'COMPLETED'];

  return (
    <AppLayout
      title={project?.title}
      actions={
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ display: 'flex', border: '1px solid var(--border-default)', borderRadius: 6, overflow: 'hidden' }}>
            {['kanban', 'table'].map((v) => (
              <button
                key={v}
                className={`btn btn-ghost btn-sm`}
                onClick={() => setView(v)}
                style={{
                  borderRadius: 0,
                  background: view === v ? 'var(--bg-hover)' : 'transparent',
                  color: view === v ? 'var(--text-primary)' : 'var(--text-tertiary)',
                  textTransform: 'capitalize',
                }}
              >
                {v}
              </button>
            ))}
          </div>
          {isAdmin && (
            <button className="btn btn-primary" onClick={() => setModal('create')}>
              + New Task
            </button>
          )}
        </div>
      }
    >
      {/* Project Description */}
      {project?.description && (
        <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', marginBottom: 24, maxWidth: 700 }}>
          {project.description}
        </p>
      )}

      {tasks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 24, height: 24, color: 'var(--text-tertiary)' }}>
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 104 0M9 5a2 2 0 114 0" />
            </svg>
          </div>
          <p className="empty-state-title">No tasks yet</p>
          <p className="empty-state-description">Create your first task for this project.</p>
          {isAdmin && <button className="btn btn-primary" onClick={() => setModal('create')}>Add Task</button>}
        </div>
      ) : view === 'kanban' ? (
        <div className="kanban-board">
          {columns.map((col) => {
            const colTasks = tasks.filter((t) => t.status === col);
            const cfg = statusConfig[col];
            return (
              <div key={col} className="kanban-column">
                <div className="kanban-column-header">
                  <span className="kanban-column-title" style={{ color: cfg.color }}>{cfg.label}</span>
                  <span className="kanban-column-count">{colTasks.length}</span>
                </div>
                {colTasks.length === 0 ? (
                  <div style={{ padding: '20px 16px', textAlign: 'center', fontSize: 12, color: 'var(--text-tertiary)' }}>
                    No tasks
                  </div>
                ) : (
                  colTasks.map((task) => (
                    <div key={task.id} className="kanban-card" onClick={() => isAdmin && setModal(task)}>
                      <p className="kanban-card-title">{task.title}</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className={`badge ${priorityConfig[task.priority].cls}`}>{priorityConfig[task.priority].label}</span>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          {task.assignee && (
                            <div className="avatar-sm" title={task.assignee.name} style={{ width: 20, height: 20, fontSize: 9, background: `hsl(${task.assignee.name.charCodeAt(0) * 7 % 360},60%,50%)` }}>
                              {task.assignee.name[0]}
                            </div>
                          )}
                          {!isAdmin && task.assignedTo === user.id && (
                            <select
                              className="filter-select"
                              value={task.status}
                              onChange={(e) => handleStatusChange(task.id, e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              style={{ fontSize: 11, padding: '2px 6px' }}
                            >
                              {columns.map((c) => <option key={c} value={c}>{statusConfig[c].label}</option>)}
                            </select>
                          )}
                          {isAdmin && (
                            <button
                              className="btn-icon"
                              onClick={(e) => { e.stopPropagation(); handleDeleteTask(task.id); }}
                              style={{ color: 'var(--accent-red)', width: 20, height: 20 }}
                            >
                              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 11, height: 11 }}>
                                <path d="M2 4h12M6 4V2h4v2M5 4l1 10h4l1-10" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                      {task.dueDate && (
                        <p style={{ fontSize: 11, color: new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED' ? 'var(--accent-red)' : 'var(--text-tertiary)', marginTop: 6 }}>
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Task</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Assignee</th>
                <th>Due Date</th>
                {isAdmin && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id}>
                  <td style={{ fontWeight: 500, maxWidth: 300 }}>{task.title}</td>
                  <td><span className={`badge ${priorityConfig[task.priority].cls}`}>{priorityConfig[task.priority].label}</span></td>
                  <td>
                    {!isAdmin && task.assignedTo === user.id ? (
                      <select
                        className="filter-select"
                        value={task.status}
                        onChange={(e) => handleStatusChange(task.id, e.target.value)}
                        style={{ fontSize: 12 }}
                      >
                        {columns.map((c) => <option key={c} value={c}>{statusConfig[c].label}</option>)}
                      </select>
                    ) : (
                      <span className={`badge ${statusConfig[task.status].cls}`}>{statusConfig[task.status].label}</span>
                    )}
                  </td>
                  <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                    {task.assignee?.name || '—'}
                  </td>
                  <td style={{ fontSize: 12, color: task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED' ? 'var(--accent-red)' : 'var(--text-secondary)' }}>
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}
                  </td>
                  {isAdmin && (
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="btn-icon" onClick={() => setModal(task)}>
                          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 13, height: 13 }}>
                            <path d="M11.5 2.5a1.5 1.5 0 012 2l-8 8L2 14l1.5-3.5 8-8z" />
                          </svg>
                        </button>
                        <button className="btn-icon" onClick={() => handleDeleteTask(task.id)} style={{ color: 'var(--accent-red)' }}>
                          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 13, height: 13 }}>
                            <path d="M2 4h12M6 4V2h4v2M5 4l1 10h4l1-10" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(modal === 'create' || (modal && modal.id)) && (
        <TaskModal
          task={modal === 'create' ? null : modal}
          projectMembers={project?.members || []}
          onClose={() => setModal(null)}
          onSave={handleSaveTask}
        />
      )}
    </AppLayout>
  );
};

export default ProjectDetail;
