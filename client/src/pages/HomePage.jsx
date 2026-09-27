import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { clubService } from '../services/clubService';
import { eventService } from '../services/eventService';
import { announcementService } from '../services/announcementService';
import ClubCard from '../components/clubs/ClubCard';
import EventCard from '../components/events/EventCard';
import AnnouncementCard from '../components/announcements/AnnouncementCard';
import Button from '../components/common/Button';
import {
  Calendar,
  ArrowRight,
  Compass,
  Bell,
  Ticket,
  Award,
  Building2,
} from 'lucide-react';
import campusImage from '../assets/image.png';

export default function HomePage() {
  const [allClubs, setAllClubs] = useState([]);
  const [events, setEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [c, e, a] = await Promise.all([
          clubService.getAllClubs(),
          eventService.getAllEvents(),
          announcementService.getAllAnnouncements(),
        ]);
        setAllClubs(c);
        setEvents(e.slice(0, 4));
        setAnnouncements(a.slice(0, 3));
      } catch (err) {
        console.error(err);
      }
    };
    loadHomeData();
  }, []);
  

  const stats = {
    clubs: allClubs.length || 18,
    events: 42,
    registrations: 3850,
    passes: 100,
  };

  return (
    <div className="flex flex-col bg-[#f5f7fa]">
      <section className="relative">
        <div className="relative h-[620px] overflow-hidden">
          <img
            src={campusImage}
            alt="Chitkara University Campus"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/70 via-slate-900/45 to-slate-900/25" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-transparent" />

          <div className="relative z-10 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-16">
            <div className="max-w-3xl space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-white/15 border border-white/20 text-xs font-medium text-white backdrop-blur-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0"></span>
                <span>Chitkara University • Student Activity Portal</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-[1.15]">
                Your Campus. Your Community.
                <br />
                <span className="text-amber-200">One Platform.</span>
              </h1>

              <p className="text-[15px] sm:text-base text-slate-100/95 max-w-2xl leading-relaxed">
                Explore the 18 official student clubs, register for workshops and campus fests,
                read the latest notices, and get instant digital passes for every event.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Link to="/events">
                  <Button
                    size="lg"
                    variant="primary"
                    icon={Calendar}
                    iconRight={ArrowRight}
                  >
                    Explore Events
                  </Button>
                </Link>
                <Link to="/clubs">
                  <Button
                    size="lg"
                    variant="secondary"
                    icon={Compass}
                    className="bg-white/10 text-white border-white/30 hover:bg-white/20 hover:text-white"
                  >
                    Browse Clubs
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="relative -mt-10 z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg border border-slate-200 shadow-md overflow-hidden">
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-slate-200">
              <div className="px-5 py-5 text-center">
                <p className="text-2xl font-semibold text-slate-900">
                  {stats.clubs}
                </p>
                <p className="text-xs text-slate-500 mt-1 font-medium">Active Clubs</p>
              </div>
              <div className="px-5 py-5 text-center">
                <p className="text-2xl font-semibold text-slate-900">
                  {stats.events}+
                </p>
                <p className="text-xs text-slate-500 mt-1 font-medium">Events / Year</p>
              </div>
              <div className="px-5 py-5 text-center">
                <p className="text-2xl font-semibold text-slate-900">
                  {stats.registrations.toLocaleString()}+
                </p>
                <p className="text-xs text-slate-500 mt-1 font-medium">Registrations</p>
              </div>
              <div className="px-5 py-5 text-center">
                <p className="text-2xl font-semibold text-slate-900">
                  {stats.passes}%
                </p>
                <p className="text-xs text-slate-500 mt-1 font-medium">Digital Passes</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-8 w-full">
        <div className="flex items-end justify-between border-b border-slate-200 pb-3">
          <div>
            <span className="text-xs font-semibold text-[#1e3a5f] uppercase tracking-wider">
              Student Organizations
            </span>
            <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 mt-1">
              Explore Our Clubs
            </h2>
            <p className="text-sm text-slate-600 mt-1.5 max-w-xl">
              Browse all 18 official Chitkara University clubs — from technical societies
              to cultural groups, sports councils, and more.
            </p>
          </div>
          <Link
            to="/clubs"
            className="text-sm font-medium text-[#1e3a5f] hover:underline flex items-center gap-1 hidden sm:flex"
          >
            View directory <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {allClubs.map((club) => (
            <ClubCard key={club._id} club={club} />
          ))}
        </div>

        <div className="text-center sm:hidden">
          <Link to="/clubs">
            <Button variant="outline" icon={Compass}>
              View all {allClubs.length || 18} clubs
            </Button>
          </Link>
        </div>
      </section>

      <section className="bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-8 w-full">
          <div className="flex items-end justify-between border-b border-slate-200 pb-3">
            <div>
              <span className="text-xs font-semibold text-[#1e3a5f] uppercase tracking-wider">
                On The Calendar
              </span>
              <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 mt-1">
                Upcoming Campus Events
              </h2>
              <p className="text-sm text-slate-600 mt-1.5 max-w-xl">
                Hackathons, cultural fests, sports leagues, and workshops scheduled for this semester.
              </p>
            </div>
            <Link
              to="/events"
              className="text-sm font-medium text-[#1e3a5f] hover:underline flex items-center gap-1 hidden sm:flex"
            >
              Full calendar <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {events.map((evt) => (
              <EventCard key={evt._id} event={evt} />
            ))}
          </div>
        </div>
      </section>

      {announcements.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-6 w-full">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <Bell className="w-5 h-5 text-[#8b6914]" />
                Latest Campus Notices
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Important updates from the Dean of Student Affairs and club committees.
              </p>
            </div>
            <Link
              to="/announcements"
              className="text-sm font-medium text-[#1e3a5f] hover:underline"
            >
              Notice Board
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {announcements.map((anc) => (
              <AnnouncementCard key={anc._id} announcement={anc} />
            ))}
          </div>
        </section>
      )}

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 w-full">
        <div className="bg-white border border-slate-200 rounded-md p-8 sm:p-10 space-y-8">
          <div className="max-w-2xl">
            <span className="text-xs font-semibold text-[#1e3a5f] uppercase tracking-wider">
              Built for Chitkara University
            </span>
            <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 mt-1">
              Designed for real campus life.
            </h2>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              CampusConnect is the official student activity system — built for how students
              and faculty actually work. Clean, practical, and always accessible.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-5 rounded-md border border-slate-200 bg-slate-50 space-y-3">
              <div className="w-9 h-9 rounded bg-[#1e3a5f]/10 text-[#1e3a5f] flex items-center justify-center">
                <Building2 className="w-4.5 h-4.5" />
              </div>
              <h4 className="text-sm font-semibold text-slate-900">
                Centralized Directory
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                All 18 university clubs with verified schedules, contact details, and
                faculty advisors — in one searchable directory.
              </p>
            </div>

            <div className="p-5 rounded-md border border-slate-200 bg-slate-50 space-y-3">
              <div className="w-9 h-9 rounded bg-[#1e3a5f]/10 text-[#1e3a5f] flex items-center justify-center">
                <Ticket className="w-4.5 h-4.5" />
              </div>
              <h4 className="text-sm font-semibold text-slate-900">
                Instant QR Passes
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Register for any event in one click. Receive a scannable digital ticket
                and save it for event-day entry verification.
              </p>
            </div>

            <div className="p-5 rounded-md border border-slate-200 bg-slate-50 space-y-3">
              <div className="w-9 h-9 rounded bg-[#1e3a5f]/10 text-[#1e3a5f] flex items-center justify-center">
                <Award className="w-4.5 h-4.5" />
              </div>
              <h4 className="text-sm font-semibold text-slate-900">
                Admin Oversight
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Faculty and coordinators can broadcast notices, manage attendee rosters,
                and track registrations with CSV exports.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
