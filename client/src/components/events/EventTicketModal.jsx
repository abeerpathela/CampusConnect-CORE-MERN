import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Badge from '../common/Badge';
import { Calendar, Clock, MapPin, CheckCircle, Download, Sparkles, ShieldCheck } from 'lucide-react';
import { formatDate, formatTime } from '../../utils/formatDate';

export default function EventTicketModal({ isOpen, onClose, ticket }) {
  if (!ticket) return null;

  const handlePrint = () => {
    window.print();
  };

  const qrValue =
    ticket.qrCodeData ||
    `CAMPUSCONNECT-TICKET-${ticket.ticketNumber}-${(ticket.studentName || 'STUDENT').toUpperCase().replace(/\s+/g, '-')}`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Verified Digital Admission Pass"
      subtitle="Official campus entry badge with live scannable QR verification."
      maxWidth="max-w-md"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
          <Button variant="primary" size="sm" icon={Download} onClick={handlePrint}>
            Print / Save Pass
          </Button>
        </>
      }
    >
      <div className="bg-gradient-to-b from-[#1e3a5f] to-[#0f243e] text-white rounded-2xl p-6 border border-[#2c5282] shadow-xl relative overflow-hidden space-y-6">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between border-b border-white/20 pb-4">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-amber-300 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> CampusConnect Verified
            </span>
            <p className="text-xs font-mono font-bold text-slate-100 mt-0.5 tracking-wide">
              {ticket.ticketNumber}
            </p>
          </div>
          <Badge variant="success" size="sm" dot>
            Confirmed Entry
          </Badge>
        </div>

        <div className="space-y-1">
          <h4 className="text-lg font-bold text-white leading-snug">
            {ticket.eventTitle}
          </h4>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/15">
          <div>
            <span className="text-[10px] text-slate-300 uppercase font-semibold">Attendee</span>
            <p className="font-semibold text-white mt-0.5">{ticket.studentName}</p>
            {ticket.rollNo && (
              <p className="text-[11px] text-slate-300 mt-0.5">Roll: {ticket.rollNo}</p>
            )}
          </div>
          <div>
            <span className="text-[10px] text-slate-300 uppercase font-semibold">Department</span>
            <p className="font-medium text-slate-100 line-clamp-1 mt-0.5">{ticket.department || 'General'}</p>
          </div>
          <div>
            <span className="text-[10px] text-slate-300 uppercase font-semibold">Date &amp; Time</span>
            <p className="font-semibold text-white mt-0.5">{formatDate(ticket.eventDate)}</p>
            <p className="text-[11px] text-amber-300 mt-0.5">{formatTime(ticket.eventTime)}</p>
          </div>
          <div>
            <span className="text-[10px] text-slate-300 uppercase font-semibold">Venue</span>
            <p className="font-semibold text-white line-clamp-1 mt-0.5">{ticket.eventVenue}</p>
          </div>
        </div>

        {/* Real Dynamic QR Code */}
        <div className="flex flex-col items-center justify-center p-5 bg-white rounded-xl gap-3 shadow-inner">
          <div className="p-2 bg-white rounded-lg border-2 border-slate-200 shadow-sm">
            <QRCodeSVG
              value={qrValue}
              size={148}
              level="H"
              includeMargin={true}
              fgColor="#0f172a"
              bgColor="#ffffff"
            />
          </div>
          <div className="text-center">
            <p className="text-[11px] font-mono font-bold text-slate-800 tracking-wider">
              {ticket.ticketNumber}
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 inline" />
              Scannable at event entrance desk
            </p>
          </div>
        </div>

        <p className="text-[11px] text-center text-slate-300 leading-relaxed">
          Keep this digital QR pass handy on your phone or print a physical copy for check-in.
        </p>
      </div>
    </Modal>
  );
}
