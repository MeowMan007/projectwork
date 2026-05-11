// Project List page - added header comment for commit tracking
import { useEffect, useState } from 'react';
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  getAllUsers,
} from '../services/api';
import AppLayout from '../layouts/AppLayout';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';

const schema = z.object({
  title: z.string().min(2, 'Title is required'),
  description: z.string().optional(),
  memberIds: z.array(z.string()).optional(),
});

const ProjectModal = ({ project, users, onClose, onSave }) => {
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: project?.title || '',
      description: project?.description || '',
      memberIds: project?.members?.map((m) => m.id) || [],
    },
  });

  const selectedIds = watch('memberIds') || [];

  const toggleMember = (id) => {
    const next = selectedIds.includes(id)
      ? selectedIds.filter((x) => x !== id)
      : [...selectedIds, id];
    setValue('memberIds', next);
  };

  const onSubmit = async (data) => {
    await onSave(data);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">{project ? 'Edit Project' : 'New Project'}</span>
          <button className="btn-icon" onClick={onClose}>
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14 }}>
              <path d="M2 2l12 12M14 2L2 14" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Project Title *</label>
              <input className={`form-input ${errors.title ? 'form-input-error' : ''}`} placeholder="e.g. Website Redesign" {...register('title')} />
              {errors.title && <span className="form-error">{errors.title.message}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-input" rows={3} placeholder="What is this project about?" {...register('description')} style={{ resize: 'vertical' }} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Members</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
                {users.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => toggleMember(u.id)}
                    style={{
                      padding: '5px 10px',
                      borderRadius: 999,
                      border: '1px solid',
                      borderColor: selectedIds.includes(u.id) ? 'var(--accent-purple)' : 'var(--border-default)',
                      background: selectedIds.includes(u.id) ? 'rgba(110,86,207,0.15)' : 'var(--bg-tertiary)',
                      color: selectedIds.includes(u.id) ? 'var(--accent-purple)' : 'var(--text-secondary)',
                      fontSize: 12.5,
                      cursor: 'pointer',
                      transition: 'all 0.12s',
                      fontFamily: 'inherit',
                    }}
                  >
                    {u.name} <span style={{ opacity: 0.6, fontSize: 11 }}>({u.role})</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">{project ? 'Save Changes' : 'Create Project'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Projects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'create' | project object
  const isAdmin = user?.role === 'ADMIN';

  const fetch = async () => {
    try {
      setLoading(true);
      const res = await getProjects();
      setProjects(res.data);
      if (isAdmin) {
        const uRes = await getAllUsers();
        setUsers(uRes.data);
      }
    } catch (e) {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, []);

  const handleSave = async (data) => {
    try {
      if (modal && modal.id) {
        await updateProject(modal.id, data);
        toast.success('Project updated');
      } else {
        await createProject(data);
        toast.success('Project created');
      }
      setModal(null);
      fetch();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project? All tasks will be removed.')) return;
    try {
      await deleteProject(id);
      toast.success('Project deleted');
      fetch();
    } catch (e) {
      toast.error('Failed to delete project');
    }
  };

  return (
    <AppLayout
      title="Projects"
      actions={
        isAdmin && (
          <button id="new-project-btn" className="btn btn-primary" onClick={() => setModal('create')}>
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14 }}>
              <path d="M8 2v12M2 8h12" />
            </svg>
            New Project
          </button>
        )
      }
    >
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <div className="spinner" style={{ width: 32, height: 32 }} />
        </div>
      ) : projects.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 24, height: 24, color: 'var(--text-tertiary)' }}>
              <path d="M3 7a2 2 0 012-2h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
              <path d="M8 5V3M16 5V3M3 10h18" />
            </svg>
          </div>
          <p className="empty-state-title">No projects yet</p>
          <p className="empty-state-description">
            {isAdmin ? 'Create your first project to get started.' : 'You have not been added to any project yet.'}
          </p>
          {isAdmin && (
            <button className="btn btn-primary" onClick={() => setModal('create')}>Create Project</button>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {projects.map((p) => {
            const total = p.tasks?.length || 0;
            const completed = p.tasks?.filter((t) => t.status === 'COMPLETED').length || 0;
            const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
            return (
              <div key={p.id} className="project-card">
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <Link to={`/projects/${p.id}`} style={{ textDecoration: 'none', flex: 1 }}>
                      <h3 className="project-card-title">{p.title}</h3>
                    </Link>
                    {isAdmin && (
                      <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                        <button className="btn-icon" onClick={() => setModal(p)} title="Edit">
                          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 13, height: 13 }}>
                            <path d="M11.5 2.5a1.5 1.5 0 012 2l-8 8L2 14l1.5-3.5 8-8z" />
                          </svg>
                        </button>
                        <button className="btn-icon" onClick={() => handleDelete(p.id)} title="Delete" style={{ color: 'var(--accent-red)' }}>
                          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 13, height: 13 }}>
                            <path d="M2 4h12M6 4V2h4v2M5 4l1 10h4l1-10" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                  {p.description && (
                    <p className="project-card-description" style={{ marginTop: 6 }}>{p.description}</p>
                  )}
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{completed} / {total} tasks</span>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{pct}%</span>
                  </div>
                  <div className="progress-bar-bg">
                    <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className="avatar-group">
                    {p.members?.slice(0, 4).map((m) => (
                      <div
                        key={m.id}
                        className="avatar-sm"
                        title={m.name}
                        style={{ background: `hsl(${m.name.charCodeAt(0) * 7 % 360},60%,50%)` }}
                      >
                        {m.name[0].toUpperCase()}
                      </div>
                    ))}
                    {p.members?.length > 4 && (
                      <div className="avatar-sm" style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)', fontSize: 9 }}>
                        +{p.members.length - 4}
                      </div>
                    )}
                  </div>
                  <Link
                    to={`/projects/${p.id}`}
                    style={{ fontSize: 12, color: 'var(--accent-purple)', fontWeight: 500, textDecoration: 'none' }}
                  >
                    View →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {(modal === 'create' || (modal && modal.id)) && (
        <ProjectModal
          project={modal === 'create' ? null : modal}
          users={users}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
    </AppLayout>
  );
};

export default Projects;
