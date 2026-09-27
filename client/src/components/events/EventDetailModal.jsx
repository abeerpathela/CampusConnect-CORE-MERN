import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Badge from '../common/Badge';
import EventTicketModal from './EventTicketModal';
import { useAuth } from '../../hooks/useAuth';
import { useAlert } from '../../hooks/useAlert';
import { eventService } from '../../services/eventService';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  Ticket,
  UserCheck,
  FileCheck,
} from 'lucide-react';
import { formatDate, formatTime } from '../../utils/formatDate';

export default function EventDetailModal({ isOpen, onClose, event, onEventUpdated }) {
  const { user, isAuthenticated, updateUserProfile } = useAuth();
  const { showToast } = useAlert();

  const [loading, setLoading] = useState(false);
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [generatedTicket, setGeneratedTicket] = useState(null);

  if (!event) return null;

  const isRegistered = Boolean(
    user?.registeredEvents?.some((e) =>
      typeof e === 'object' && e !== null ? e._id === event._id : e === event._id
    )
  );
  const capacity = event.capacity || 100;
  const registeredCount = event.registeredCount || 0;
  const isFull = registeredCount >= capacity;

  const handleRegister = async () => {
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
        showToast('Registered! Pass available in dashboard.', 'info');
      }
      return;
    }

    if (isFull) {
      showToast('Event has reached capacity!', 'error');
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
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        maxWidth="max-w-2xl"
        footer={
          <div className="flex items-center justify-between w-full">
            <div className="text-xs text-slate-500 font-medium">
              Capacity:{' '}
              <span className="font-semibold text-slate-800">
                {registeredCount} / {capacity} registered
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={onClose}>
                Close
              </Button>
              <Button
                variant={isRegistered ? 'success' : isFull ? 'secondary' : 'primary'}
                size="sm"
                icon={isRegistered ? Ticket : CheckCircle2}
                isLoading={loading}
                disabled={isFull && !isRegistered}
                onClick={handleRegister}
              >
                {isRegistered ? 'View Admission Pass' : isFull ? 'Sold Out' : 'Confirm Registration'}
              </Button>
            </div>
          </div>
        }
      >
        <div className="space-y-6">
          <div className="relative h-56 rounded-xl overflow-hidden bg-slate-100">
            <img
              src={event.bannerImage}
              alt={event.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />

            <div className="absolute top-4 left-4 flex items-center gap-2">
              <Badge variant="primary" size="sm">
                {event.category}
              </Badge>
              <Badge variant="default" size="sm">
                {event.fee || 'Free Registration'}
              </Badge>
            </div>

            <div className="absolute bottom-4 left-4 right-4">
              <span className="text-xs font-semibold text-amber-300 uppercase tracking-wider">
                {event.clubName}
              </span>
              <h2 className="text-xl sm:text-2xl font-semibold text-white leading-snug mt-0.5">
                {event.title}
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 font-medium block">Date</span>
              <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-[#1e3a5f]" />
                {formatDate(event.date)}
              </span>
            </div>
            <div>
              <span className="text-slate-500 font-medium block">Time</span>
              <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                <Clock className="w-3.5 h-3.5 text-[#1e3a5f]" />
                {formatTime(event.time)}
              </span>
            </div>
            <div className="col-span-2">
              <span className="text-slate-500 font-medium block">Location / Venue</span>
              <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-[#1e3a5f]" />
                {event.venue}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-900">Event Overview</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {event.description}
            </p>
          </div>

          {(event.speaker || (event.requirements && event.requirements.length > 0)) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {event.speaker && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-[#1e3a5f]" />
                    Guest Speaker / Judge
                  </span>
                  <p className="text-slate-700 font-medium">{event.speaker}</p>
                </div>
              )}
              {event.requirements && event.requirements.length > 0 && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <FileCheck className="w-3.5 h-3.5 text-slate-500" />
                    Things to Bring
                  </span>
                  <p className="text-slate-600">{event.requirements.join(' • ')}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>

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
