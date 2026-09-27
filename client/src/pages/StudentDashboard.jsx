import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { clubService } from '../services/clubService';
import { eventService } from '../services/eventService';
import Sidebar from '../components/common/Sidebar';
import StatsCard from '../components/dashboard/StatsCard';
import QuickActions from '../components/dashboard/QuickActions';
import ClubCard from '../components/clubs/ClubCard';
import EventTicketModal from '../components/events/EventTicketModal';
import AnnouncementList from '../components/announcements/AnnouncementList';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import {
  Users,
  Calendar,
  Ticket,
  Bell,
  QrCode,
  ArrowRight,
  Compass,
} from 'lucide-react';
import { formatDate, formatTime } from '../utils/formatDate';

/**
 * StudentDashboard provides students with tabs to view:
 * 1. Overview KPI statistics (Joined clubs count, event passes, notices)
 * 2. My Subscribed Clubs (manage joined clubs)
 * 3. My Event Passes (view and display QR admission badges)
 * 4. Campus Bulletins & Announcements
 */
export default function StudentDashboard() {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('overview');
  const [joinedClubsList, setJoinedClubsList] = useState([]);
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketModalOpen, setTicketModalOpen] = useState(false);

  // Load student's enrolled clubs and registered event tickets
  const loadUserData = useCallback(async () => {
    if (!user) return;
    try {
      const allClubs = await clubService.getAllClubs();
      const userClubIds = user.joinedClubs || [];
      const userClubs = allClubs.filter((c) =>
        userClubIds.some((uc) =>
          typeof uc === 'object' && uc !== null
            ? (uc._id === c._id || uc.slug === c.slug || uc._id === c.slug)
            : (uc === c._id || uc === c.slug)
        )
      );
      setJoinedClubsList(userClubs);

      const userRegs = await eventService.getUserRegistrations(user._id, user.email);
      setMyRegistrations(Array.isArray(userRegs) ? userRegs : []);
    } catch (err) {
      console.error('Error loading student dashboard data', err);
    }
  }, [user]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  const handleOpenTicket = (reg) => {
    setSelectedTicket(reg);
    setTicketModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16">
      {/* Welcome Banner */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
            alt={user?.name}
            className="w-14 h-14 rounded-lg object-cover border-2 border-slate-200"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                Welcome back, {user?.name}!
              </h1>
              <Badge variant="primary" size="sm">
                Student
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Roll #{user?.rollNo || '2310990001'} • {user?.department || 'CSE'} • {user?.semester || '4th Semester'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/events">
            <Button size="sm" variant="primary" icon={Calendar}>
              Find New Events
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Dashboard Layout */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Left: Sidebar */}
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} mode="student" />

        {/* Right: Content Area */}
        <main className="flex-1 w-full space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Counters */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatsCard
                  title="Joined Clubs"
                  value={joinedClubsList.length}
                  subtitle="Subscribed societies"
                  icon={Users}
                  variant="indigo"
                />
                <StatsCard
                  title="Event Passes"
                  value={myRegistrations.length}
                  subtitle="Confirmed admissions"
                  icon={Ticket}
                  variant="emerald"
                />
                <StatsCard
                  title="Campus Notices"
                  value="3 Unread"
                  subtitle="Latest updates"
                  icon={Bell}
                  variant="purple"
                />
              </div>

              {/* Quick Actions */}
              <QuickActions mode="student" />

              {/* My Registered Events Passes Preview */}
              <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                    <QrCode className="w-5 h-5 text-[#1e3a5f]" />
                    My Active Event Admission Passes
                  </h3>
                  <button
                    onClick={() => setActiveTab('events')}
                    className="text-xs font-medium text-[#1e3a5f] hover:underline flex items-center gap-1"
                  >
                    View all ({myRegistrations.length}) <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {myRegistrations.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 rounded-md border border-slate-200">
                    <p className="text-xs text-slate-500">You haven't registered for any events yet.</p>
                    <Link to="/events" className="mt-2 inline-block">
                      <Button size="sm" variant="outline">
                        Explore Upcoming Events
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {myRegistrations.slice(0, 2).map((reg) => (
                      <div
                        key={reg._id}
                        className="bg-[#1e3a5f] text-white p-5 rounded-lg border border-[#2c5282] flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] uppercase font-semibold text-amber-300">
                              Pass #{reg.ticketNumber}
                            </span>
                            <Badge variant="success" size="sm">
                              Confirmed
                            </Badge>
                          </div>
                          <h4 className="text-sm font-semibold text-white mt-2 line-clamp-1">
                            {reg.eventTitle}
                          </h4>
                          <p className="text-xs text-slate-300 mt-1">
                            {formatDate(reg.eventDate)} • {formatTime(reg.eventTime)}
                          </p>
                          <p className="text-xs text-slate-200 mt-0.5 truncate">{reg.eventVenue}</p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between">
                          <span className="text-[11px] text-slate-300">QR Ready</span>
                          <Button
                            size="sm"
                            variant="secondary"
                            icon={QrCode}
                            onClick={() => handleOpenTicket(reg)}
                          >
                            View QR Pass
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* My Subscribed Clubs Preview */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Users className="w-5 h-5 text-indigo-600" />
                    My Subscribed Clubs
                  </h3>
                  <button
                    onClick={() => setActiveTab('clubs')}
                    className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
                  >
                    Manage ({joinedClubsList.length}) <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {joinedClubsList.length === 0 ? (
                  <div className="bg-white p-8 rounded-lg border border-slate-200 text-center">
                    <p className="text-xs text-slate-500">You haven't joined any clubs yet.</p>
                    <Link to="/clubs" className="mt-2 inline-block">
                      <Button size="sm" variant="outline">
                        Browse Clubs
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {joinedClubsList.slice(0, 2).map((club) => (
                      <ClubCard key={club._id} club={club} onClubUpdated={loadUserData} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: MY CLUBS */}
          {activeTab === 'clubs' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">My Subscribed Clubs</h2>
                  <p className="text-xs text-slate-500">
                    Clubs and student societies you are an active member of.
                  </p>
                </div>
                <Link to="/clubs">
                  <Button size="sm" variant="outline" icon={Compass}>
                    Discover More Clubs
                  </Button>
                </Link>
              </div>

              {joinedClubsList.length === 0 ? (
                <div className="bg-white p-12 rounded-lg border border-slate-200 text-center space-y-3">
                  <Users className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="text-sm font-semibold text-slate-700">No joined clubs</p>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Join technical coding societies, cultural groups, or athletic teams to stay
                    connected with meetings and initiatives.
                  </p>
                  <Link to="/clubs">
                    <Button size="sm" variant="primary">
                      Explore All Clubs
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {joinedClubsList.map((club) => (
                    <ClubCard key={club._id} club={club} onClubUpdated={loadUserData} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: MY EVENT PASSES */}
          {activeTab === 'events' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">My Event Admission Passes</h2>
                  <p className="text-xs text-slate-500">
                    Present these digital QR passes at event reception desks for fast verified check-in.
                  </p>
                </div>
                <Link to="/events">
                  <Button size="sm" variant="outline" icon={Calendar}>
                    Explore Events
                  </Button>
                </Link>
              </div>

              {myRegistrations.length === 0 ? (
                <div className="bg-white p-12 rounded-lg border border-slate-200 text-center space-y-3">
                  <Ticket className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="text-sm font-semibold text-slate-700">No registered events yet</p>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Register for upcoming hackathons, workshops, and fests to generate your official
                    e-tickets.
                  </p>
                  <Link to="/events">
                    <Button size="sm" variant="primary">
                      Browse Upcoming Events
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {myRegistrations.map((reg) => (
                    <div
                      key={reg._id}
                      className="bg-white rounded-lg border border-slate-200 shadow-sm p-5 space-y-4 hover:border-slate-300 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-semibold text-[#1e3a5f] bg-[#1e3a5f]/5 px-2 py-0.5 rounded">
                            {reg.ticketNumber}
                          </span>
                          <Badge variant="success" size="sm" dot>
                            Confirmed
                          </Badge>
                        </div>

                        <h3 className="text-base font-semibold text-slate-900 mt-2">
                          {reg.eventTitle}
                        </h3>

                        <div className="mt-3 space-y-1 text-xs text-slate-600">
                          <p>📅 Date: <strong className="text-slate-800">{formatDate(reg.eventDate)}</strong></p>
                          <p>⏰ Time: <strong className="text-slate-800">{formatTime(reg.eventTime)}</strong></p>
                          <p>📍 Venue: <strong className="text-slate-800">{reg.eventVenue}</strong></p>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[11px] text-slate-500">
                          Booked {formatDate(reg.registeredAt)}
                        </span>
                        <Button
                          size="sm"
                          variant="primary"
                          icon={QrCode}
                          onClick={() => handleOpenTicket(reg)}
                        >
                          Show QR Pass
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: ANNOUNCEMENTS */}
          {activeTab === 'announcements' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Campus Bulletins & Notices</h2>
                <p className="text-xs text-slate-500">
                  Official notices issued by campus administration and club leads.
                </p>
              </div>

              <AnnouncementList showFilter={true} />
            </div>
          )}
        </main>
      </div>

      {/* Ticket Pass Modal */}
      {selectedTicket && (
        <EventTicketModal
          isOpen={ticketModalOpen}
          onClose={() => setTicketModalOpen(false)}
          ticket={selectedTicket}
        />
      )}
    </div>
  );
}
