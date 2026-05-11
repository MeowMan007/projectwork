import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { useState } from 'react';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['ADMIN', 'MEMBER']),
});

const Signup = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { role: 'MEMBER' },
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      await signup(data);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Signup failed');
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

        <h1 className="auth-title">Create your account</h1>
        <p className="auth-subtitle">Join your team on TaskManager</p>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label className="form-label" htmlFor="signup-name">Full name</label>
            <input
              id="signup-name"
              type="text"
              className={`form-input ${errors.name ? 'form-input-error' : ''}`}
              placeholder="Alex Johnson"
              {...register('name')}
            />
            {errors.name && <span className="form-error">{errors.name.message}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="signup-email">Email address</label>
            <input
              id="signup-email"
              type="email"
              className={`form-input ${errors.email ? 'form-input-error' : ''}`}
              placeholder="you@example.com"
              {...register('email')}
            />
            {errors.email && <span className="form-error">{errors.email.message}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="signup-password">Password</label>
            <input
              id="signup-password"
              type="password"
              className={`form-input ${errors.password ? 'form-input-error' : ''}`}
              placeholder="Min. 6 characters"
              {...register('password')}
            />
            {errors.password && <span className="form-error">{errors.password.message}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="signup-role">Role</label>
            <select
              id="signup-role"
              className={`form-input filter-select ${errors.role ? 'form-input-error' : ''}`}
              style={{ cursor: 'pointer' }}
              {...register('role')}
            >
              <option value="MEMBER">Member</option>
              <option value="ADMIN">Admin</option>
            </select>
            {errors.role && <span className="form-error">{errors.role.message}</span>}
          </div>

          <button
            id="signup-submit"
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
          >
            {loading ? <span className="spinner" style={{ width: 16, height: 16 }} /> : 'Create account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-secondary)', marginTop: 20 }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent-purple)', fontWeight: 500 }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
