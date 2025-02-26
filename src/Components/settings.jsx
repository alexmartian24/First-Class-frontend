import React, { useState } from "react";

function Settings() {
  const [notifications, setNotifications] = useState(true);
  const [language, setLanguage] = useState("English");

  const toggleNotifications = () => {
    setNotifications(!notifications);
  };

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
  };

  return (
    <div className="settings-container">
      <h1>Settings</h1>

      <div className="settings-section">
        <h2>Preferences</h2>
        <div className="setting-item">
          <label>Enable Notifications:</label>
          <input
            type="checkbox"
            checked={notifications}
            onChange={toggleNotifications}
          />
        </div>

        <div className="setting-item">
          <label>Language:</label>
          <select value={language} onChange={handleLanguageChange}>
            <option value="English">English</option>
            <option value="Spanish">Spanish</option>
            <option value="French">French</option>
            <option value="Korean">Korean</option>
          </select>
        </div>
      </div>

      <div className="settings-section">
        <h2>Account</h2>
        <button>Change Password</button>
        <button>Delete Account</button>
      </div>
    </div>
  );
}

export default Settings;
