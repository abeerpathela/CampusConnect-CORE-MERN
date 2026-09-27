import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useAlert } from '../../hooks/useAlert';
import Input from '../common/Input';
import Button from '../common/Button';
import Badge from '../common/Badge';
import { Mail, Lock, Shield, GraduationCap, ArrowRight, Sparkles } from 'lucide-react';
import { validateEmail, validatePassword } from '../../utils/validators';
import { DEMO_USERS, USER_ROLES } from '../../utils/constants';

export default function LoginForm() {
  const { login, switchDemoRole } = useAuth();
  const { showToast } = useAlert();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/student/dashboard';

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const errs = {};
    const emailErr = validateEmail(formData.email);
    if (emailErr) errs.email = emailErr;
    const passErr = validatePassword(formData.password);
    if (passErr) errs.password = passErr;
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await login(formData);
      showToast('Welcome back! Successfully signed in.', 'success');
      if (res.user?.role === USER_ROLES.ADMIN) {
        navigate('/admin/dashboard');
      } else {
        navigate(from === '/admin/dashboard' ? '/student/dashboard' : from);
      }
    } catch (err) {
      showToast(err.message || 'Failed to sign in', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (role) => {
    setLoading(true);
    try {
      const res = await switchDemoRole(role);
      showToast(
        `Logged in as ${role === USER_ROLES.ADMIN ? 'Admin (Dean of Student Affairs)' : 'Student (Aarav Sharma)'}`,
        'success'
      );
      if (role === USER_ROLES.ADMIN) {
        navigate('/admin/dashboard');
      } else {
        navigate(from === '/admin/dashboard' ? '/student/dashboard' : from);
      }
    } catch (err) {
      showToast(err.message || 'Demo login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-lg">
      <div className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-lg">
        <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-slate-700 uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          Quick Demo Access (1-Click)
        </div>
        <p className="text-xs text-slate-500 mb-3">
          For evaluation & live testing, click a preset role to sign in immediately:
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleQuickDemo(USER_ROLES.STUDENT)}
            className="flex flex-col items-start p-2.5 bg-white border border-slate-200 rounded-md hover:border-[#1e3a5f] hover:bg-[#1e3a5f]/5 transition-colors text-left cursor-pointer group"
          >
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 group-hover:text-[#1e3a5f]">
              <GraduationCap className="w-4 h-4 text-[#1e3a5f]" />
              Student Demo
            </div>
            <span className="text-[11px] text-slate-500 mt-0.5">Aarav (Roll 231099)</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickDemo(USER_ROLES.ADMIN)}
            className="flex flex-col items-start p-2.5 bg-white border border-slate-200 rounded-md hover:border-[#1e3a5f] hover:bg-[#1e3a5f]/5 transition-colors text-left cursor-pointer group"
          >
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 group-hover:text-[#1e3a5f]">
              <Shield className="w-4 h-4 text-purple-700" />
              Faculty / Admin
            </div>
            <span className="text-[11px] text-slate-500 mt-0.5">Dr. Rajesh Verma</span>
          </button>
        </div>
      </div>

      <div className="relative flex py-2 items-center mb-6">
        <div className="flex-grow border-t border-slate-200"></div>
        <span className="flex-shrink mx-4 text-xs font-medium text-slate-400 uppercase">
          Or sign in with email
        </span>
        <div className="flex-grow border-t border-slate-200"></div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="College Email"
          name="email"
          type="email"
          placeholder="e.g. yourname@chitkara.edu.in"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          icon={Mail}
          required
        />

        <Input
          label="Password"
          name="password"
          type="password"
          placeholder="••••••••"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          icon={Lock}
          required
        />

        <div className="flex items-center justify-between text-xs">
          <label className="flex items-center gap-2 cursor-pointer text-slate-600">
            <input
              type="checkbox"
              defaultChecked
              className="rounded border-slate-300 bg-white text-[#1e3a5f] focus:ring-[#1e3a5f]"
            />
            Remember me
          </label>
          <a
            href="#forgot"
            onClick={(e) => {
              e.preventDefault();
              showToast('Demo mode: Use password "chitkara123" or 1-Click login', 'info');
            }}
            className="text-[#1e3a5f] font-semibold hover:underline"
          >
            Forgot password?
          </a>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="md"
          className="w-full mt-2"
          isLoading={loading}
          iconRight={ArrowRight}
        >
          Sign In to Portal
        </Button>
      </form>

      <p className="mt-6 text-center text-xs text-slate-500">
        Don't have an account yet?{' '}
        <Link to="/register" className="text-[#1e3a5f] font-semibold hover:underline">
          Register here
        </Link>
      </p>
    </div>
  );
}
