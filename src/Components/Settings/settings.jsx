import React, { useState, useContext } from "react";
import axios from "axios";
import { BACKEND_URL } from "../../constants";
import { ThemeContext } from "../../context/ThemeContext";

const axiosConfig = {
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: false,
};

const PEOPLE_UPDATE_ENDPOINT = (email) =>
  `${BACKEND_URL}/people/update/${encodeURIComponent(email)}`;

function Settings() {
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);

  const [notifications, setNotifications] = useState(true);
  const [language, setLanguage] = useState("English");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleNotifications = () => setNotifications(!notifications);

  const handleLanguageChange = (e) => setLanguage(e.target.value);
  
  const handleDevInfoClick = () => {
    axios
      .get(`${BACKEND_URL}/dev/info`, axiosConfig)
      .then((res) => {
        console.log("Dev Info:", res.data);
        alert("Dev Info fetched — check console for details.");
      })
      .catch((err) => {
        console.error("Failed to fetch dev info:", err);
        alert("Error fetching dev info.");
      });
  };
  
  const openPasswordModal = () => {
    const user = localStorage.getItem("user");
    if (!user) {
      alert("You must be logged in to change your password");
      return;
    }
    setShowPasswordModal(true);
    setPasswords({ current: "", new: "", confirm: "" });
    setPasswordError("");
    setPasswordSuccess("");
  };

  const closePasswordModal = () => setShowPasswordModal(false);

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");
    setIsSubmitting(true);

    if (!passwords.current || !passwords.new || !passwords.confirm) {
      setPasswordError("All fields are required");
      setIsSubmitting(false);
      return;
    }
    if (passwords.new !== passwords.confirm) {
      setPasswordError("New passwords don't match");
      setIsSubmitting(false);
      return;
    }
    if (passwords.new.length < 8) {
      setPasswordError("Password must be at least 8 characters long");
      setIsSubmitting(false);
      return;
    }

    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.email) {
      setPasswordError("You must be logged in to change your password");
      setIsSubmitting(false);
      return;
    }

    const verifyPayload = { email: user.email, password: passwords.current };

    axios
      .post(`${BACKEND_URL}/people/login`, verifyPayload, axiosConfig)
      .then(() => {
        const updatedPerson = {
          name: user.name,
          email: user.email,
          affiliation: user.affiliation,
          role: user.roles?.[0] || '',
          password: passwords.new,
        };
        return axios.put(PEOPLE_UPDATE_ENDPOINT(user.email), updatedPerson, axiosConfig);
      })
      .then(() => {
        setPasswordSuccess("Password successfully changed!");
        setPasswords({ current: "", new: "", confirm: "" });
        setTimeout(closePasswordModal, 2000);
      })
      .catch((error) => {
        if (error.response?.status === 401) {
          setPasswordError("Current password is incorrect");
        } else {
          setPasswordError(`Failed to update password: ${error.message}`);
        }
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const renderToggleSwitch = (checked, onChange) => (
    <label className="switch">
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span className="slider" />
    </label>
  );

  const renderPasswordModal = () => {
    if (!showPasswordModal) return null;

    return (
      <div className="modal-overlay">
        <div className="modal">
          <div className="modal-header">
            <h2>Change Password</h2>
            <button className="close-button" onClick={closePasswordModal}>
              ×
            </button>
          </div>
          <form onSubmit={handlePasswordSubmit}>
            <div className="form-group">
              <label htmlFor="current">Current Password</label>
              <input
                type="password"
                id="current"
                name="current"
                value={passwords.current}
                onChange={handlePasswordChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="new">New Password</label>
              <input
                type="password"
                id="new"
                name="new"
                value={passwords.new}
                onChange={handlePasswordChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirm">Confirm New Password</label>
              <input
                type="password"
                id="confirm"
                name="confirm"
                value={passwords.confirm}
                onChange={handlePasswordChange}
              />
            </div>
            {passwordError && <div className="error-message">{passwordError}</div>}
            {passwordSuccess && <div className="success-message">{passwordSuccess}</div>}
            <div className="modal-footer">
              <button
                type="button"
                className="button secondary"
                onClick={closePasswordModal}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="button primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Updating..." : "Update Password"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="settings-container">
      <div className="card">
        <header>
          <h1>Settings</h1>
          <p>Manage your account preferences and settings</p>
        </header>

        <section className="settings-section">
          <h2>Preferences</h2>

          <div className="setting-field">
            <div>
              <h3>Notifications</h3>
              <p>Receive alerts and updates</p>
            </div>
            {renderToggleSwitch(notifications, toggleNotifications)}
          </div>

          <div className="setting-field">
            <div>
              <h3>Dark Mode</h3>
              <p>Toggle dark interface theme</p>
            </div>
            {renderToggleSwitch(darkMode, toggleDarkMode)}
          </div>

          <div className="setting-field">
            <div>
              <h3>Language</h3>
              <p>Choose your preferred language</p>
            </div>
            <select value={language} onChange={handleLanguageChange}>
              <option value="English">English</option>
              <option value="Spanish">Spanish</option>
              <option value="French">French</option>
              <option value="Korean">Korean</option>
              <option value="Japanese">Japanese</option>
              <option value="German">German</option>
            </select>
          </div>
        </section>

        <section className="settings-section">
          <h2>Account</h2>
          <div className="account-actions">
            <button className="button primary" onClick={openPasswordModal}>
              Change Password
            </button>
            <button
              className="button secondary"
              onClick={() => console.debug("Two-Factor Authentication clicked")}
            >
              Two-Factor Authentication
            </button>
            <button
              className="button secondary"
              onClick={handleDevInfoClick}
            >
              Fetch /dev/info
            </button>
          </div>

          <div className="danger-zone">
            <h3 className="danger-title">Danger Zone</h3>
            <p className="danger-description">This action cannot be undone.</p>
            <button
              className="button danger"
              onClick={() => console.debug("Delete Account clicked")}
            >
              Delete Account
            </button>
          </div>
        </section>

        <div className="footer">
          <button className="button primary" onClick={() => console.debug("Save Changes clicked")}>
            Save Changes
          </button>
        </div>
      </div>

      {renderPasswordModal()}
    </div>
  );
}

export default Settings;
