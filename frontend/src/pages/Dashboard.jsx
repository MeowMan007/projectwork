import { useEffect, useState } from 'react';
import { getDashboardStats } from '../services/api';
import AppLayout from '../layouts/AppLayout';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const StatCard = ({ label, value, color, icon }) => (
  <div className="stat-card">
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span className="stat-label">{label}</span>
      <span style={{ fontSize: 20, filter: 'grayscale(0.1)' }}>{icon}</span>
    </div>
    <div className="stat-value" style={{ color }}>
      {value ?? <span className="spinner" style={{ display: 'inline-block', margin: '6px 0' }} />}
    </div>
  </div>
);

const statusBadge = {
  TODO: <span className="badge badge-todo">Todo</span>,
  IN_PROGRESS: <span className="badge badge-in-progress">In Progress</span>,
  COMPLETED: <span className="badge badge-completed">Completed</span>,
};

const priorityBadge = {
  LOW: <span className="badge badge-low">Low</span>,
  MEDIUM: <span className="badge badge-medium">Medium</span>,
  HIGH: <span className="badge badge-high">High</span>,
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-default)', borderRadius: 6, padding: '8px 12px' }}>
        <p style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 4 }}>{label}</p>
        {payload.map((p) => (
          <p key={p.name} style={{ fontSize: 12, color: p.fill }}>{p.name}: {p.value}</p>
        ))}
      </div>
    );
  }
  return null;
};

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then((res) => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const chartData = stats?.projectStats?.map((p) => ({
    name: p.title.length > 16 ? p.title.slice(0, 16) + '…' : p.title,
    Completed: p.completed,
    'In Progress': p.inProgress,
    Todo: p.todo,
  })) || [];

  return (
    <AppLayout title="Dashboard">
      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
        <StatCard label="Total Tasks" value={stats?.totalTasks} color="var(--text-primary)" icon="📋" />
        <StatCard label="Completed" value={stats?.completedTasks} color="var(--accent-green)" icon="✅" />
        <StatCard label="In Progress" value={stats?.inProgressTasks} color="var(--accent-yellow)" icon="⚡" />
        <StatCard label="Overdue" value={stats?.overdueTasks} color="var(--accent-red)" icon="🔴" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16, marginBottom: 32 }}>
        {/* Chart */}
        {chartData.length > 0 && (
          <div className="card">
            <div className="section-header" style={{ marginBottom: 16 }}>
              <span className="section-title">Project Progress</span>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} barGap={4} barCategoryGap="30%">
                <XAxis dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bg-hover)' }} />
                <Bar dataKey="Completed" fill="var(--accent-green)" radius={[3, 3, 0, 0]} />
                <Bar dataKey="In Progress" fill="var(--accent-yellow)" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Todo" fill="var(--text-tertiary)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Project Stats Table */}
        <div className="card">
          <div className="section-header" style={{ marginBottom: 12 }}>
            <span className="section-title">Projects Overview</span>
          </div>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
              <div className="spinner" />
            </div>
          ) : stats?.projectStats?.length === 0 ? (
            <div className="empty-state" style={{ padding: '30px 20px' }}>
              <p className="empty-state-description">No projects yet</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {stats?.projectStats?.map((p) => {
                const pct = p.total > 0 ? Math.round((p.completed / p.total) * 100) : 0;
                return (
                  <div key={p.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--text-primary)' }}>{p.title}</span>
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{pct}%</span>
                    </div>
                    <div className="progress-bar-bg">
                      <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
                    </div>
                    <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                      <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{p.total} tasks</span>
                      <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>·</span>
                      <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{p.memberCount} members</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="section-header" style={{ marginBottom: 0 }}>
          <span className="section-title">Recent Tasks</span>
        </div>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
            <div className="spinner" />
          </div>
        ) : stats?.recentTasks?.length === 0 ? (
          <div className="empty-state">
            <p className="empty-state-description">No recent activity</p>
          </div>
        ) : (
          <div style={{ marginTop: 16 }}>
            {stats?.recentTasks?.map((task) => (
              <div key={task.id} className="task-row">
                <div className="task-title">{task.title}</div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                  {priorityBadge[task.priority]}
                  {statusBadge[task.status]}
                  <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{task.project?.title}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Dashboard;
