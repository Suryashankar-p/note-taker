import React, { useState, useEffect } from "react";
import InitialsAvatar from "../../components/Initials";
import FeatureCard from "../../components/FeatureCard";

const Settings: React.FC = () => {
  const [userData, setUserData] = useState({ name: "Pooja K.", email: "pooja.k@thermax.com" });
  const [autoEmail, setAutoEmail] = useState(() => {
    const saved = localStorage.getItem("notetaker_auto_email");
    return saved !== null ? saved === "true" : true;
  });

  const handleToggleAutoEmail = () => {
    const newValue = !autoEmail;
    setAutoEmail(newValue);
    localStorage.setItem("notetaker_auto_email", String(newValue));
  };

  useEffect(() => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      if (storedUser?.name || storedUser?.first_name || storedUser?.email) {
        const name = storedUser.name || `${storedUser.first_name || "Pooja"} ${(storedUser.last_name || "K.").charAt(0)}.`;
        const email = storedUser.email || "pooja.k@thermax.com";
        setUserData({ name, email });
      }
    } catch (e) {
      console.error("Error loading user profile:", e);
    }
  }, []);

  return (
    <div className="w-full px-8 md:px-12 py-6">
      {/* Header Title & Subtitle */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary_text tracking-tight">Settings</h1>
        <p className="text-xs text-faint_text mt-1 font-normal">Manage your account preferences, integrations, and data.</p>
      </div>

      <div className="flex flex-col gap-6">
        {/* Profile Details Card calling FeatureCard */}
        <FeatureCard title="Profile Details">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-full overflow-hidden shrink-0 border border-[#E5E7EB] shadow-sm bg-[#F3F4F6] flex items-center justify-center">
              <InitialsAvatar name={userData.name} size={64} fontSize="22px" bgColor="#ED3438" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-semibold text-primary_text">{userData.name}</span>
              <span className="text-xs text-faint_text mt-0.5">{userData.email}</span>
            </div>
          </div>
        </FeatureCard>

        {/* Bot Permissions Card calling FeatureCard */}
        <FeatureCard title="Bot Permissions">
          <div className="flex items-center justify-between">
            <div className="flex flex-col pr-6">
              <span className="text-sm font-semibold text-primary_text">Auto Email</span>
              <span className="text-xs text-faint_text mt-1">
                Thermax Bot will automatically send email to meeting attendees after meeting.
              </span>
            </div>

            {/* Toggle Switch */}
            <button
              type="button"
              onClick={handleToggleAutoEmail}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                autoEmail ? "bg-danger" : "bg-[#D1D5DB]"
              }`}
              role="switch"
              aria-checked={autoEmail}
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-flex items-center justify-center h-5 w-5 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out ${
                  autoEmail ? "translate-x-5" : "translate-x-0"
                }`}
              >
                {autoEmail && (
                  <span className="w-3.5 h-3.5 rounded-full bg-[#0284C7] flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                )}
              </span>
            </button>
          </div>
        </FeatureCard>
      </div>
    </div>
  );
};

export default Settings;
