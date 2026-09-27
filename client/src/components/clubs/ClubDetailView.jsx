import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { clubService } from '../../services/clubService';
import { eventService } from '../../services/eventService';
import { useAuth } from '../../hooks/useAuth';
import { useAlert } from '../../hooks/useAlert';
import Badge from '../common/Badge';
import Button from '../common/Button';
import EventCard from '../events/EventCard';
import Loader from '../common/Loader';
import {
  Users,
  Calendar,
  Clock,
  Mail,
  UserCheck,
  Shield,
  ArrowLeft,
  CheckCircle,
  Sparkles,
  Building2,
} from 'lucide-react';

export default function ClubDetailView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, updateUserProfile } = useAuth();
  const { showToast } = useAlert();

  const [club, setClub] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchClubData = useCallback(async () => {
    setLoading(true);
    try {
      const clubData = await clubService.getClubById(id);
      setClub(clubData);
      const clubEvents = await eventService.getAllEvents({ clubId: clubData._id });
      setEvents(clubEvents);
    } catch (err) {
      showToast('Club not found', 'error');
      navigate('/clubs');
    } finally {
      setLoading(false);
    }
  }, [id, navigate, showToast]);

  useEffect(() => {
    fetchClubData();
  }, [fetchClubData]);

  if (loading) return <Loader text="Loading club details..." />;
  if (!club) return null;

  const isMember = Boolean(
    user?.joinedClubs?.some((c) =>
      typeof c === 'object' && c !== null
        ? (c._id === club._id || c._id === club.slug || c.slug === club.slug)
        : (c === club._id || c === club.slug)
    )
  );

  const handleToggleJoin = async () => {
    if (!isAuthenticated) {
      showToast('Please sign in as a student to join this club', 'warning');
      return;
    }

    try {
      if (isMember) {
        const res = await clubService.leaveClub(club._id, user);
        if (res.user) updateUserProfile(res.user);
        setClub((prev) => ({ ...prev, membersCount: Math.max(0, (prev.membersCount || 1) - 1) }));
        showToast(`You left ${club.name}`, 'info');
      } else {
        const res = await clubService.joinClub(club._id, user);
        if (res.user) updateUserProfile(res.user);
        setClub((prev) => ({ ...prev, membersCount: (prev.membersCount || 0) + 1 }));
        showToast(`Welcome to ${club.name}!`, 'success');
      }
    } catch (err) {
      showToast(err.message || 'Failed to update membership', 'error');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <Link
        to="/clubs"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to all clubs
      </Link>

      {/* Hero Banner Header */}
      <div className="relative rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-sm">
        <div className="h-56 sm:h-72 w-full relative">
          <img
            src={club.bannerImage}
            alt={club.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent" />
        </div>

        <div className="relative p-6 sm:p-8 -mt-20 sm:-mt-24 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6">
          <div className="flex items-start gap-4 sm:gap-6">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white shadow-md border-2 border-slate-200 flex items-center justify-center text-4xl sm:text-5xl flex-shrink-0">
              {club.logo || '🎓'}
            </div>
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="primary" size="sm">
                  {club.category}
                </Badge>
                <span className="text-xs text-slate-500">Est. {club.foundedYear || 2021}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                {club.name}
              </h1>
              <p className="text-sm text-slate-600 max-w-xl leading-relaxed">
                {club.tagline}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button
              size="lg"
              variant={isMember ? 'success' : 'primary'}
              icon={isMember ? CheckCircle : Sparkles}
              onClick={handleToggleJoin}
            >
              {isMember ? 'Joined (Member)' : 'Join Club'}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* About Club */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#1e3a5f]" />
              About the Club
            </h2>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {club.description}
            </p>

            {club.tags && (
              <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-2">
                {club.tags.map((t, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Hosted Events by Club */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#1e3a5f]" />
                Upcoming Events by {club.name}
              </h2>
              <span className="text-xs text-slate-500">
                {events.length} Event{events.length === 1 ? '' : 's'}
              </span>
            </div>

            {events.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 text-sm shadow-sm">
                No upcoming events scheduled right now. Check back soon!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {events.map((evt) => (
                  <EventCard key={evt._id} event={evt} onEventUpdated={fetchClubData} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar: Quick Info */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5 shadow-sm">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Club Coordination
            </h3>

            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 text-[#1e3a5f] flex items-center justify-center flex-shrink-0">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-slate-500">Student Coordinator</p>
                  <p className="font-medium text-slate-900 text-sm mt-0.5">
                    {club.leadCoordinator || 'Lead Coordinator'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-slate-500">Faculty Advisor</p>
                  <p className="font-medium text-slate-900 text-sm mt-0.5">
                    {club.facultyAdvisor || 'Dr. Faculty Member'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 text-[#1e3a5f] flex items-center justify-center flex-shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-slate-500">Regular Meetings</p>
                  <p className="font-medium text-slate-900 mt-0.5">
                    {club.meetingSchedule || 'Weekly sessions'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 text-[#1e3a5f] flex items-center justify-center flex-shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-slate-500">Active Membership</p>
                  <p className="font-medium text-slate-900 mt-0.5">
                    {club.membersCount || 0} Registered Students
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-slate-500">Official Contact</p>
                  <p className="font-medium text-slate-900 mt-0.5 break-words">{club.email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
