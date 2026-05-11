import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { useState } from 'react';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      await login(data);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">T</div>
          <span className="auth-logo-text">TaskManager</span>
        </div>

        <h1 className="auth-title">Sign in to your workspace</h1>
        <p className="auth-subtitle">Enter your credentials to continue</p>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Email address</label>
            <input
              id="login-email"
              type="email"
              className={`form-input ${errors.email ? 'form-input-error' : ''}`}
              placeholder="you@example.com"
              {...register('email')}
            />
            {errors.email && <span className="form-error">{errors.email.message}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              className={`form-input ${errors.password ? 'form-input-error' : ''}`}
              placeholder="••••••••"
              {...register('password')}
            />
            {errors.password && <span className="form-error">{errors.password.message}</span>}
          </div>

          <button
            id="login-submit"
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
          >
            {loading ? <span className="spinner" style={{ width: 16, height: 16 }} /> : 'Sign in'}
          </button>
        </form>

        <div className="divider" />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', textAlign: 'center' }}>
            Demo credentials:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div style={{ background: 'var(--bg-tertiary)', borderRadius: 6, padding: '8px 12px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: 11, color: 'var(--accent-purple)', fontWeight: 600, marginBottom: 3 }}>ADMIN</div>
              <div style={{ fontSize: 11.5, color: 'var(--text-secondary)' }}>admin@example.com</div>
              <div style={{ fontSize: 11.5, color: 'var(--text-tertiary)' }}>admin123</div>
            </div>
            <div style={{ background: 'var(--bg-tertiary)', borderRadius: 6, padding: '8px 12px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: 11, color: 'var(--accent-blue)', fontWeight: 600, marginBottom: 3 }}>MEMBER</div>
              <div style={{ fontSize: 11.5, color: 'var(--text-secondary)' }}>sarah@example.com</div>
              <div style={{ fontSize: 11.5, color: 'var(--text-tertiary)' }}>member123</div>
            </div>
          </div>
        </div>

        <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-secondary)', marginTop: 20 }}>
          Don't have an account?{' '}
          <Link to="/signup" style={{ color: 'var(--accent-purple)', fontWeight: 500 }}>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
