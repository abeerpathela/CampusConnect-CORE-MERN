import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useAlert } from '../../hooks/useAlert';
import { clubService } from '../../services/clubService';
import Badge from '../common/Badge';
import Button from '../common/Button';
import { Users, CheckCircle, ArrowUpRight, Sparkles } from 'lucide-react';

export default function ClubCard({ club, onClubUpdated, compact = false }) {
  const { user, isAuthenticated, updateUserProfile } = useAuth();
  const { showToast } = useAlert();
  
  const isMember = Boolean(
    user?.joinedClubs?.some((c) =>
      typeof c === 'object' && c !== null
        ? (c._id === club._id || c._id === club.slug || c.slug === club.slug)
        : (c === club._id || c === club.slug)
    )
  );

  const handleJoin = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      showToast('Please log in as a student to join clubs', 'warning');
      return;
    }

    try {
      if (isMember) {
        const res = await clubService.leaveClub(club._id, user);
        if (res.user) updateUserProfile(res.user);
        showToast(`You left ${club.name}`, 'info');
      } else {
        const res = await clubService.joinClub(club._id, user);
        if (res.user) updateUserProfile(res.user);
        showToast(`You have joined ${club.name}!`, 'success');
      }
      if (onClubUpdated) onClubUpdated();
    } catch (err) {
      showToast(err.message || 'Action failed', 'error');
    }
  };

  const getCategoryVariant = (cat) => {
    switch (cat) {
      case 'Technical':
        return 'primary';
      case 'Theatre':
      case 'Dance':
      case 'Singing':
        return 'purple';
      case 'Sports':
        return 'success';
      case 'Art and Craft':
      case 'Content Creation':
      case 'Film Making':
      case 'Cooking':
        return 'accent';
      case 'Entrepreneurship':
      case 'LinkedIn Club':
      case 'Placement':
        return 'info';
      case 'Literature':
      case 'Poetry':
        return 'warning';
      case 'Health':
      case 'Wellness':
      case 'Hostel Committee':
      case 'Day Scholar':
      default:
        return 'default';
    }
  };

  if (compact) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-4 flex flex-col gap-3 hover:border-slate-300 card-hover">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded bg-slate-50 border border-slate-200 flex items-center justify-center text-xl flex-shrink-0">
            {club.logo || '🎓'}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-slate-900 truncate hover:text-[#1e3a5f] transition-colors">
              {club.name}
            </h3>
            <div className="mt-0.5 flex items-center gap-2 flex-wrap">
              <Badge variant={getCategoryVariant(club.category)} size="sm">
                {club.category}
              </Badge>
              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                <Users className="w-3 h-3" />
                {club.membersCount || 0}
              </span>
            </div>
          </div>
        </div>
        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
          {club.tagline}
        </p>
        <div className="flex items-center justify-between pt-2 mt-auto">
          <Link
            to={`/clubs/${club._id}`}
            className="text-xs font-medium text-[#1e3a5f] hover:underline flex items-center gap-1"
          >
            View Club <ArrowUpRight className="w-3 h-3" />
          </Link>
          <Button
            size="sm"
            variant={isMember ? 'success' : 'outline'}
            onClick={handleJoin}
          >
            {isMember ? 'Joined' : 'Join'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden flex flex-col hover:border-slate-300 card-hover group">
      <div className="relative h-32 w-full overflow-hidden bg-slate-100">
        <img
          src={club.bannerImage}
          alt={club.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/55 via-slate-900/10 to-transparent" />

        <div className="absolute top-2.5 left-2.5">
          <Badge variant={getCategoryVariant(club.category)} size="sm">
            {club.category}
          </Badge>
        </div>

        <div className="absolute top-2.5 right-2.5 bg-white/95 text-slate-700 px-2 py-0.5 rounded text-[11px] font-medium flex items-center gap-1.5 border border-slate-200">
          <Users className="w-3 h-3 text-[#1e3a5f]" />
          <span>{club.membersCount || 0}</span>
        </div>

        <div className="absolute -bottom-4 left-4 w-11 h-11 bg-white rounded border border-slate-200 flex items-center justify-center text-xl">
          {club.logo || '🎓'}
        </div>
      </div>

      <div className="p-4 pt-6 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 line-clamp-1 group-hover:text-[#1e3a5f] transition-colors">
            {club.name}
          </h3>
          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
            {club.tagline || club.description}
          </p>

          {club.tags && club.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {club.tags.slice(0, 3).map((tag, idx) => (
                <span
                  key={idx}
                  className="text-[11px] px-2 py-0.5 rounded bg-slate-50 text-slate-600 border border-slate-200"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
          <Link
            to={`/clubs/${club._id}`}
            className="text-xs font-medium text-slate-600 hover:text-[#1e3a5f] flex items-center gap-1 transition-colors"
          >
            View Club <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>

          <Button
            size="sm"
            variant={isMember ? 'success' : 'primary'}
            icon={isMember ? CheckCircle : Sparkles}
            onClick={handleJoin}
          >
            {isMember ? 'Joined' : 'Join Club'}
          </Button>
        </div>
      </div>
    </div>
  );
}
