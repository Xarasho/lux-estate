"use client";

import React, { useState } from "react";
import { PropertyAgent } from "@/types/property";

export interface ActionButtonsProps {
  propertyTitle: string;
  propertyPrice: string;
  agent?: PropertyAgent;
}

export function ActionButtons({
  propertyTitle,
  propertyPrice,
  agent,
}: ActionButtonsProps) {
  const [activeModal, setActiveModal] = useState<"visit" | "contact" | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    time: "11:00 AM",
    message: `Hello, I am interested in ${propertyTitle} listed at ${propertyPrice}. Please send me more details.`,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setActiveModal(null);
    }, 2000);
  };

  const agentName = agent?.name || "Sarah Jenkins";
  const agentPhone = agent?.phone || "+1 (555) 234-5678";

  return (
    <>
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => setActiveModal("visit")}
          className="w-full bg-mosque hover:bg-emerald-800 text-white py-4 px-6 rounded-lg font-medium transition-all shadow-lg shadow-mosque/20 flex items-center justify-center gap-2 group cursor-pointer"
        >
          <span className="material-icons text-xl group-hover:scale-110 transition-transform">
            calendar_today
          </span>
          Schedule Visit
        </button>

        <button
          type="button"
          onClick={() => setActiveModal("contact")}
          className="w-full bg-transparent border border-nordic/10 hover:border-mosque text-nordic/80 hover:text-mosque py-4 px-6 rounded-lg font-medium transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span className="material-icons text-xl">mail_outline</span>
          Contact Agent
        </button>
      </div>

      {/* Modal Dialog */}
      {activeModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-mosque/10 relative">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              aria-label="Close dialog"
              className="absolute top-4 right-4 p-2 text-nordic/50 hover:text-nordic transition-colors cursor-pointer"
            >
              <span className="material-icons">close</span>
            </button>

            {submitted ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-14 h-14 mx-auto rounded-full bg-mosque/10 text-mosque flex items-center justify-center">
                  <span className="material-icons text-3xl">check</span>
                </div>
                <h3 className="text-xl font-bold text-nordic">
                  {activeModal === "visit" ? "Visit Scheduled!" : "Message Sent!"}
                </h3>
                <p className="text-sm text-nordic/70">
                  {agentName} has received your request and will contact you promptly at{" "}
                  {formData.phone || formData.email || "your contact number"}.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="mb-2">
                  <h3 className="text-xl font-bold text-nordic">
                    {activeModal === "visit" ? "Schedule a Private Visit" : `Contact ${agentName}`}
                  </h3>
                  <p className="text-xs text-nordic/60 mt-1">
                    {activeModal === "visit"
                      ? "Select your preferred date & time to tour this property."
                      : `Direct inquiry for ${propertyTitle}`}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-nordic/80 uppercase mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Jane Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-nordic/15 text-sm focus:outline-none focus:border-mosque"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-nordic/80 uppercase mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="jane@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-nordic/15 text-sm focus:outline-none focus:border-mosque"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-nordic/80 uppercase mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+1 (555) 000-0000"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-nordic/15 text-sm focus:outline-none focus:border-mosque"
                    />
                  </div>
                </div>

                {activeModal === "visit" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-nordic/80 uppercase mb-1">
                        Tour Date
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-nordic/15 text-sm focus:outline-none focus:border-mosque"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-nordic/80 uppercase mb-1">
                        Time Slot
                      </label>
                      <select
                        value={formData.time}
                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-nordic/15 text-sm focus:outline-none focus:border-mosque bg-white"
                      >
                        <option>10:00 AM</option>
                        <option>11:30 AM</option>
                        <option>02:00 PM</option>
                        <option>04:00 PM</option>
                        <option>05:30 PM</option>
                      </select>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-nordic/80 uppercase mb-1">
                    Message
                  </label>
                  <textarea
                    rows={3}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-nordic/15 text-sm focus:outline-none focus:border-mosque resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-mosque hover:bg-emerald-800 text-white font-semibold rounded-lg shadow-md transition-all cursor-pointer"
                >
                  {activeModal === "visit" ? "Confirm Visit Request" : "Send Inquiry"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
