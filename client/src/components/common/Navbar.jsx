import React, { useState } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useAlert } from '../../hooks/useAlert';
import Button from './Button';
import Badge from './Badge';
import Logo from './Logo';
import {
  Compass,
  Calendar,
  Bell,
  LayoutDashboard,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  Home,
  GraduationCap,
  User,
  ChevronDown,
} from 'lucide-react';
import { USER_ROLES, DEMO_USERS } from '../../utils/constants';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout, switchDemoRole } = useAuth();
  const { showToast } = useAlert();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const isHome = location.pathname === '/';

  const handleRoleToggle = async () => {
    const nextRole = isAdmin ? USER_ROLES.STUDENT : USER_ROLES.ADMIN;
    await switchDemoRole(nextRole);
    showToast(
      `Switched to ${nextRole === USER_ROLES.ADMIN ? 'Admin (Dean/Faculty)' : 'Student'} mode`,
      'info'
    );
    if (nextRole === USER_ROLES.ADMIN) {
      navigate('/admin/dashboard');
    } else {
      navigate('/student/dashboard');
    }
    setUserDropdownOpen(false);
  };

  const handleLogout = () => {
    logout();
    showToast('You have been logged out', 'info');
    navigate('/login');
    setUserDropdownOpen(false);
  };

  const navLinks = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/clubs', label: 'Clubs', icon: Compass },
    { to: '/events', label: 'Events', icon: Calendar },
    { to: '/announcements', label: 'Notices', icon: Bell },
  ];

  return (
    <header
      className={`sticky top-0 z-40 border-b shadow-sm ${
        isHome
          ? 'bg-white/95 border-slate-200 backdrop-blur'
          : 'bg-white border-slate-200'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link
            to="/"
            className="flex items-center group focus:outline-none"
            onClick={() => setMobileMenuOpen(false)}
          >
            <Logo light={false} size="md" showSubtitle={true} />
          </Link>

          <nav className="hidden lg:flex items-center gap-0.5">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-1.5 px-2.5 py-2 text-sm font-medium transition-colors border-b-2 ${
                    isActive
                      ? 'text-[#1e3a5f] border-[#1e3a5f]'
                      : 'text-slate-600 border-transparent hover:text-[#1e3a5f] hover:border-slate-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </NavLink>
              );
            })}

            {isAuthenticated && !isAdmin && (
              <NavLink
                to="/student/dashboard"
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-2.5 py-2 text-sm font-medium transition-colors border-b-2 ${
                    isActive
                      ? 'text-[#1e3a5f] border-[#1e3a5f]'
                      : 'text-slate-600 border-transparent hover:text-[#1e3a5f] hover:border-slate-300'
                  }`
                }
              >
                <GraduationCap className="w-4 h-4" />
                Dashboard
              </NavLink>
            )}
          </nav>

          <div className="flex items-center gap-2">
            {/* Quick 1-Click Demo Toggle Button */}
            <button
              type="button"
              onClick={handleRoleToggle}
              title="Click to switch between Student & Admin Demo View"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100 hover:bg-[#1e3a5f]/10 text-slate-700 hover:text-[#1e3a5f] border border-slate-200 transition-all cursor-pointer shadow-xs"
            >
              {isAdmin ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                  <span className="hidden sm:inline">Admin Mode</span>
                  <span className="text-[10px] text-[#1e3a5f] font-bold underline">Switch to Student</span>
                </>
              ) : (
                <>
                  <GraduationCap className="w-3.5 h-3.5 text-[#1e3a5f]" />
                  <span className="hidden sm:inline">Student Mode</span>
                  <span className="text-[10px] text-purple-700 font-bold underline">Switch to Admin</span>
                </>
              )}
            </button>

            {isAuthenticated && (
              <Link
                to={isAdmin ? '/admin/dashboard' : '/student/dashboard'}
                className="hidden lg:inline-flex"
              >
                <Button
                  variant="primary"
                  size="sm"
                  icon={LayoutDashboard}
                >
                  Dashboard
                </Button>
              </Link>
            )}

            {isAuthenticated ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className={`flex items-center gap-2 pl-1 pr-2 py-1 rounded-md transition-colors cursor-pointer border ${
                    userDropdownOpen
                      ? 'bg-slate-100 border-slate-300'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <img
                    src={user?.avatar || DEMO_USERS.STUDENT.avatar}
                    alt={user?.name || 'User'}
                    className="w-7 h-7 rounded object-cover border border-slate-200"
                  />
                  <span className="hidden sm:block text-sm font-medium text-slate-700">
                    {user?.name?.split(' ')[0] || 'User'}
                  </span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-500 transition-transform ${
                      userDropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {userDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setUserDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-md border border-slate-200 py-1 z-20">
                      <div className="px-4 py-3 border-b border-slate-100">
                        <p className="text-sm font-semibold text-slate-900 truncate">
                          {user?.name}
                        </p>
                        <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                        <div className="mt-2 flex items-center gap-1.5">
                          <Badge variant={isAdmin ? 'purple' : 'primary'} size="sm">
                            {isAdmin ? 'Faculty / Admin' : 'Student'}
                          </Badge>
                          {user?.rollNo && (
                            <span className="text-[11px] text-slate-500">
                              #{user.rollNo}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="py-1">
                        <Link
                          to={isAdmin ? '/admin/dashboard' : '/student/dashboard'}
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4 text-slate-500" />
                          Dashboard
                        </Link>

                        <Link
                          to={isAdmin ? '/admin/dashboard' : '/student/dashboard'}
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <User className="w-4 h-4 text-slate-500" />
                          Profile
                        </Link>

                        <button
                          type="button"
                          onClick={handleRoleToggle}
                          className="w-full flex items-center justify-between px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-slate-500" />
                            <span>Switch View</span>
                          </div>
                          <span className="text-xs font-medium text-[#1e3a5f]">
                            {isAdmin ? 'Student' : 'Admin'}
                          </span>
                        </button>
                      </div>

                      <div className="pt-1 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button
                    variant="ghost"
                    size="sm"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button
                    variant="primary"
                    size="sm"
                  >
                    Register
                  </Button>
                </Link>
              </div>
            )}

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`md:hidden p-2 rounded-md focus:outline-none cursor-pointer ${
                'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md ${
                      isActive
                        ? 'bg-[#1e3a5f]/5 text-[#1e3a5f]'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </NavLink>
              );
            })}

            {isAuthenticated && (
              <>
                <NavLink
                  to={isAdmin ? '/admin/dashboard' : '/student/dashboard'}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md ${
                      isActive
                        ? 'bg-[#1e3a5f]/5 text-[#1e3a5f]'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`
                  }
                >
                  <GraduationCap className="w-4 h-4" />
                  Student View
                </NavLink>

                <NavLink
                  to={isAdmin ? '/admin/dashboard' : '/student/dashboard'}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md ${
                      isActive
                        ? 'bg-[#1e3a5f]/5 text-[#1e3a5f]'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`
                  }
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </NavLink>

                <NavLink
                  to={isAdmin ? '/admin/dashboard' : '/student/dashboard'}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md ${
                      isActive
                        ? 'bg-[#1e3a5f]/5 text-[#1e3a5f]'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`
                  }
                >
                  <User className="w-4 h-4" />
                  Profile
                </NavLink>
              </>
            )}

            {isAuthenticated && (
              <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    handleRoleToggle();
                    setMobileMenuOpen(false);
                  }}
                  className="text-xs font-medium text-[#1e3a5f] bg-slate-50 px-3 py-2 rounded-md border border-slate-200 cursor-pointer"
                >
                  Switch to {isAdmin ? 'Student View' : 'Admin View'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-xs font-medium text-red-600 hover:bg-red-50 px-3 py-2 rounded-md cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
