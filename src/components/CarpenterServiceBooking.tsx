import React, { useState } from 'react';
import {
  Wrench,
  Clock,
  MapPin,
  Calendar,
  CheckCircle2,
  Upload,
  Sparkles,
  Phone,
  ShieldCheck,
  Star,
  Check,
} from 'lucide-react';
import { User, ServiceCategory } from '../types';
import { INITIAL_SERVICES } from '../data/mockData';
import { api } from '../services/api';
import confetti from 'canvas-confetti';

interface CarpenterServiceBookingProps {
  currentUser: User;
  onBookingSuccess: () => void;
}

export const CarpenterServiceBooking: React.FC<CarpenterServiceBookingProps> = ({
  currentUser,
  onBookingSuccess,
}) => {
  const [selectedServiceId, setSelectedServiceId] = useState<string>(
    INITIAL_SERVICES[0]?.id || 'srv-1'
  );
  const [scheduledDate, setScheduledDate] = useState<string>('2026-08-25');
  const [scheduledTimeSlot, setScheduledTimeSlot] = useState<string>('10:00 AM - 01:00 PM');
  const [address, setAddress] = useState<string>(
    currentUser.address || '742 Evergreen Terrace, Springfield, OR'
  );
  const [landmark, setLandmark] = useState<string>('Near Central Oak Park');
  const [problemDescription, setProblemDescription] = useState<string>(
    'Dining chair backrest tenon joint loose and wooden wardrobe drawer sliding rail stuck.'
  );
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [confirmedBooking, setConfirmedBooking] = useState<any>(null);

  const currentServiceMeta =
    INITIAL_SERVICES.find((s) => s.id === selectedServiceId) || INITIAL_SERVICES[0];

  const handleBookService = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const booking = await api.createBooking({
        customerId: currentUser.id,
        customerName: currentUser.name,
        customerPhone: currentUser.phone,
        customerEmail: currentUser.email,
        serviceId: currentServiceMeta.id,
        serviceName: currentServiceMeta.name,
        problemDescription,
        photos: photoUrl ? [photoUrl] : [],
        address: {
          street: address,
          city: 'Springfield',
          state: 'OR',
          postalCode: '97477',
          landmark,
        },
        preferredDate: scheduledDate,
        preferredTimeSlot: scheduledTimeSlot,
        estimatedCost: currentServiceMeta.startingPrice,
        paymentStatus: 'pay_on_service',
      });

      setConfirmedBooking(booking);
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#065f46', '#10b981', '#78350f', '#f59e0b'],
      });
      onBookingSuccess();
    } catch (err) {
      console.error('Booking failed:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div id="carpenter-services-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#d1fae5] border border-[#a7f3d0] text-[#065f46] text-xs font-semibold mb-3">
          <Wrench className="w-3.5 h-3.5 text-[#059669]" />
          <span>Verified Master Carpenters & On-Demand Site Visits</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#291e14]">
          Book a Professional Carpenter
        </h2>
        <p className="text-sm text-[#6e5d52] mt-2 leading-relaxed">
          From fixing squeaky solid wood joints to complete modular kitchen fittings, french polishing, and custom door locks. Transparent hourly pricing and certified tooling.
        </p>
      </div>

      {confirmedBooking ? (
        <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-[#bbf7d0] p-8 text-center shadow-xl">
          <div className="w-16 h-16 rounded-full bg-[#dcfce7] text-[#15803d] flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#15803d]">
            Service Booking Confirmed
          </span>
          <h3 className="text-2xl font-serif font-bold text-[#291e14] mt-1">
            Booking #{confirmedBooking.bookingNumber}
          </h3>
          <p className="text-xs text-[#57483f] mt-2 max-w-md mx-auto leading-relaxed">
            Our dispatch coordinator has assigned a master carpenter for <strong>{confirmedBooking.serviceName}</strong> on <strong>{confirmedBooking.preferredDate}</strong> ({confirmedBooking.preferredTimeSlot}).
          </p>

          <div className="mt-6 p-4 bg-[#fdfbf7] rounded-2xl border border-[#f0eae1] text-xs text-left space-y-2 max-w-md mx-auto">
            <div className="flex justify-between">
              <span className="text-[#8c7e75]">Service:</span>
              <span className="font-semibold text-[#291e14]">{confirmedBooking.serviceName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8c7e75]">Address:</span>
              <span className="font-semibold text-[#291e14]">{confirmedBooking.address?.street || confirmedBooking.address}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8c7e75]">Estimated Minimum:</span>
              <span className="font-bold text-[#15803d]">${confirmedBooking.estimatedCost}</span>
            </div>
          </div>

          <button
            onClick={() => setConfirmedBooking(null)}
            className="mt-6 px-6 py-2.5 bg-[#78350f] text-white text-xs font-semibold rounded-xl hover:bg-[#5c280a]"
          >
            Book Another Service
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: 8 Carpentry Service Cards */}
          <div className="lg:col-span-7 space-y-4">
            <h3 className="text-lg font-serif font-bold text-[#291e14] mb-2">
              1. Select Carpentry Service:
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {INITIAL_SERVICES.map((srv) => (
                <div
                  key={srv.id}
                  onClick={() => setSelectedServiceId(srv.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                    selectedServiceId === srv.id
                      ? 'bg-[#fdf3e7] border-[#b45309] shadow-md ring-1 ring-[#b45309]'
                      : 'bg-white border-[#e7dfd5] hover:bg-[#fdfbf7] hover:border-[#cfc3b3]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#78350f] bg-[#fef3c7] px-2 py-0.5 rounded-md">
                        From ${srv.startingPrice}
                      </span>
                    </div>

                    <h4 className="text-sm font-serif font-bold text-[#291e14] mt-2">
                      {srv.name}
                    </h4>

                    <p className="text-xs text-[#6e5d52] mt-1 leading-relaxed line-clamp-2">
                      {srv.shortDesc}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-[#f0eae1] flex items-center justify-between text-[11px] text-[#8c7e75]">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#b45309]" />
                      <span>{srv.estimatedHours}</span>
                    </div>
                    {selectedServiceId === srv.id && (
                      <span className="text-[#b45309] font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Selected
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Service Guarantees */}
            <div className="mt-6 p-5 bg-[#fdfbf7] rounded-2xl border border-[#e7dfd5] grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-[#57483f]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#15803d]" />
                <span>Background-verified joiners</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-[#d97706]" />
                <span>4.85+ Average rating</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#b45309]" />
                <span>30-Day Service warranty</span>
              </div>
            </div>
          </div>

          {/* Right Column: Schedule & Address Form */}
          <div className="lg:col-span-5">
            <form
              onSubmit={handleBookService}
              className="bg-white rounded-3xl border border-[#e7dfd5] p-6 shadow-lg space-y-5"
            >
              <div className="border-b border-[#f0eae1] pb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#92400e]">
                  Step 2 & 3
                </span>
                <h3 className="text-lg font-serif font-bold text-[#291e14]">
                  Schedule Visit & Address
                </h3>
              </div>

              {/* Selected Service Snippet */}
              <div className="p-3 bg-[#fdf3e7] rounded-xl border border-[#fde68a] flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-[#8c7e75] uppercase font-bold">Service Chosen:</p>
                  <p className="text-xs font-bold text-[#78350f]">{currentServiceMeta.name}</p>
                </div>
                <span className="text-base font-bold text-[#291e14]">
                  ${currentServiceMeta.startingPrice} <span className="text-[10px] font-normal text-[#8c7e75]">est.</span>
                </span>
              </div>

              {/* Date & Time Slot */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#291e14] block mb-1">
                    Preferred Date:
                  </label>
                  <input
                    type="date"
                    required
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full p-2.5 bg-[#fdfbf7] border border-[#dfd4c5] rounded-xl text-xs font-semibold text-[#291e14] focus:outline-hidden focus:border-[#78350f]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#291e14] block mb-1">
                    Time Slot:
                  </label>
                  <select
                    value={scheduledTimeSlot}
                    onChange={(e) => setScheduledTimeSlot(e.target.value)}
                    className="w-full p-2.5 bg-[#fdfbf7] border border-[#dfd4c5] rounded-xl text-xs font-semibold text-[#291e14] focus:outline-hidden focus:border-[#78350f]"
                  >
                    <option value="09:00 AM - 12:00 PM">09:00 AM - 12:00 PM (Morning)</option>
                    <option value="12:00 PM - 03:00 PM">12:00 PM - 03:00 PM (Afternoon)</option>
                    <option value="03:00 PM - 06:00 PM">03:00 PM - 06:00 PM (Evening)</option>
                  </select>
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="text-xs font-bold text-[#291e14] block mb-1">
                  Service Address:
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Apartment, Street, Locality"
                  className="w-full p-2.5 bg-[#fdfbf7] border border-[#dfd4c5] rounded-xl text-xs text-[#291e14] focus:outline-hidden focus:border-[#78350f]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#291e14] block mb-1">
                  Landmark / Building Name:
                </label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="Near Central Oak Park"
                  className="w-full p-2.5 bg-[#fdfbf7] border border-[#dfd4c5] rounded-xl text-xs text-[#291e14] focus:outline-hidden focus:border-[#78350f]"
                />
              </div>

              {/* Problem Description */}
              <div>
                <label className="text-xs font-bold text-[#291e14] block mb-1">
                  Problem Description / Issue Details:
                </label>
                <textarea
                  rows={2}
                  value={problemDescription}
                  onChange={(e) => setProblemDescription(e.target.value)}
                  placeholder="Describe what needs repair or assembly..."
                  className="w-full p-2.5 bg-[#fdfbf7] border border-[#dfd4c5] rounded-xl text-xs text-[#291e14] focus:outline-hidden focus:border-[#78350f]"
                />
              </div>

              {/* Optional Photo */}
              <div>
                <label className="text-xs font-bold text-[#291e14] block mb-1">
                  Photo URL of Broken Joint / Room (Optional):
                </label>
                <input
                  type="text"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full p-2.5 bg-[#fdfbf7] border border-[#dfd4c5] rounded-xl text-xs text-[#291e14] focus:outline-hidden focus:border-[#78350f]"
                />
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                id="submit-carpenter-booking-btn"
                disabled={submitting}
                className="w-full py-3.5 px-6 bg-[#065f46] hover:bg-[#044e39] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Wrench className="w-4 h-4" />
                <span>{submitting ? 'Confirming Dispatch...' : 'Confirm Carpenter Booking'}</span>
              </button>

              <p className="text-[10px] text-[#8c7e75] text-center">
                💳 Pay in cash, card or UPI after service completion and quality inspection.
              </p>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
