import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useAlert } from '../../hooks/useAlert';
import { eventService } from '../../services/eventService';
import Badge from '../common/Badge';
import Button from '../common/Button';
import EventTicketModal from './EventTicketModal';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  Ticket,
  ArrowRight,
} from 'lucide-react';
import { formatDate, formatTime } from '../../utils/formatDate';

export default function EventCard({ event, onEventUpdated, onSelectEvent }) {
  const { user, isAuthenticated, updateUserProfile } = useAuth();
  const { showToast } = useAlert();

  const [loading, setLoading] = useState(false);
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [generatedTicket, setGeneratedTicket] = useState(null);

  const isRegistered = Boolean(
    user?.registeredEvents?.some((e) =>
      typeof e === 'object' && e !== null ? e._id === event._id : e === event._id
    ) || event.userRegistered
  );

  const capacity = event.capacity || 100;
  const registeredCount = event.registeredCount || 0;
  const percentFilled = Math.min(100, Math.round((registeredCount / capacity) * 100));
  const isFull = registeredCount >= capacity;

  const getCategoryVariant = (cat) => {
    switch (cat) {
      case 'Technical':
        return 'primary';
      case 'Cultural':
        return 'purple';
      case 'Sports':
        return 'success';
      case 'Arts':
        return 'cyan';
      case 'Entrepreneurship':
        return 'info';
      case 'Literary':
      case 'Culinary':
        return 'warning';
      case 'Hostel':
      case 'Day Scholar':
      case 'Health':
      case 'Wellness':
      case 'Media':
      case 'Professional':
      default:
        return 'default';
    }
  };

  const handleRegister = async (e) => {
    e.stopPropagation();

    if (!isAuthenticated) {
      showToast('Please sign in as a student to register for events', 'warning');
      return;
    }

    if (isRegistered) {
      try {
        const userRegistrations = await eventService.getUserRegistrations(user._id, user.email);
        const match = Array.isArray(userRegistrations)
          ? userRegistrations.find((r) =>
              typeof r.eventId === 'object' && r.eventId !== null
                ? r.eventId._id === event._id
                : r.eventId === event._id
            )
          : null;
        if (match) {
          setGeneratedTicket(match);
          setTicketModalOpen(true);
        } else {
          showToast('Already registered! Pass is in your dashboard.', 'info');
        }
      } catch {
        showToast('Ticket pass active in dashboard', 'info');
      }
      return;
    }

    if (isFull) {
      showToast('This event has reached full capacity!', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await eventService.registerForEvent(event._id, user);
      showToast('Registration confirmed! Your digital admission pass is ready.', 'success');
      setGeneratedTicket(res.registration);
      setTicketModalOpen(true);

      if (user) {
        const registeredEvents = [...(user.registeredEvents || []), event._id];
        updateUserProfile({ registeredEvents });
      }

      if (onEventUpdated) onEventUpdated();
    } catch (err) {
      showToast(err.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        onClick={() => onSelectEvent && onSelectEvent(event)}
        className="bg-white rounded-lg border border-slate-200 overflow-hidden flex flex-col hover:border-slate-300 card-hover group cursor-pointer"
      >
        <div className="relative h-40 w-full overflow-hidden bg-slate-100">
          <img
            src={event.bannerImage}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/55 via-slate-900/10 to-transparent" />

          <div className="absolute top-2.5 left-2.5">
            <Badge variant={getCategoryVariant(event.category)} size="sm">
              {event.category}
            </Badge>
          </div>
          <div className="absolute top-2.5 right-2.5 bg-white text-slate-700 px-2 py-0.5 rounded border border-slate-200 text-xs font-semibold">
            {event.fee || 'Free'}
          </div>

          <div className="absolute bottom-2.5 left-2.5 bg-white text-slate-800 border border-slate-200 px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#1e3a5f]" />
            <span>{formatDate(event.date)}</span>
          </div>
        </div>

        <div className="p-4 flex-1 flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#1e3a5f] uppercase tracking-wider">
              {event.clubName}
            </span>
            <h3 className="text-sm font-semibold text-slate-900 line-clamp-1 group-hover:text-[#1e3a5f] transition-colors mt-0.5">
              {event.title}
            </h3>
            <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
              {event.shortDescription || event.description}
            </p>

            <div className="mt-2.5 space-y-1 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span>{formatTime(event.time)}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span className="truncate">{event.venue}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 space-y-2.5">
            <div>
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1">
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" /> Seats
                </span>
                <span className={isFull ? 'text-red-600' : 'text-slate-700'}>
                  {registeredCount} / {capacity}
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded overflow-hidden">
                <div
                  className={`h-full rounded transition-all duration-500 ${
                    percentFilled > 85 ? 'bg-red-500' : percentFilled > 60 ? 'bg-amber-500' : 'bg-emerald-600'
                  }`}
                  style={{ width: `${percentFilled}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-0.5">
              <button
                type="button"
                className="text-xs font-semibold text-slate-500 group-hover:text-[#1e3a5f] flex items-center gap-1 transition-colors"
              >
                Full Details <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <Button
                size="sm"
                variant={isRegistered ? 'success' : isFull ? 'secondary' : 'primary'}
                icon={isRegistered ? Ticket : CheckCircle2}
                isLoading={loading}
                disabled={isFull && !isRegistered}
                onClick={handleRegister}
              >
                {isRegistered ? 'View Pass' : isFull ? 'Sold Out' : 'Register Now'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {generatedTicket && (
        <EventTicketModal
          isOpen={ticketModalOpen}
          onClose={() => setTicketModalOpen(false)}
          ticket={generatedTicket}
        />
      )}
    </>
  );
}
