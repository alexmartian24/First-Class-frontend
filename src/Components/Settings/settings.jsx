import React, { useState } from "react";
import axios from 'axios';
import { BACKEND_URL } from '../../constants';
import { useContext } from "react";
import { ThemeContext } from "../../context/ThemeContext.js";

// Axios configuration for cross-origin requests - same as in People.jsx
const axiosConfig = {
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: false,
};

// Use the same people update endpoint as in People.jsx
const PEOPLE_UPDATE_ENDPOINT = (email) =>
  `${BACKEND_URL}/people/update/${encodeURIComponent(email)}`;

function Settings() {

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
  const [notifications, setNotifications] = useState(true);
  const [language, setLanguage] = useState("English");

  const { darkMode, toggleDarkMode } = useContext(ThemeContext);
  
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: ""
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Debug: Log initial state when component renders (can be removed later)
  console.debug("Settings component rendered - darkMode:", darkMode, "notifications:", notifications, "language:", language);

  const toggleNotifications = () => {
    console.debug("Toggling notifications:", !notifications);
    setNotifications(!notifications);
  };

  const handleLanguageChange = (e) => {
    console.debug("Language changed to:", e.target.value);
    setLanguage(e.target.value);
  };

  const openPasswordModal = () => {
    console.debug("Attempting to open password modal...");
    // Check if user is logged in
    const user = localStorage.getItem('user');
    if (!user) {
      alert("You must be logged in to change your password");
      return;
    }
    console.debug("User found in localStorage.");
    
    setShowPasswordModal(true);
    // Reset form state when opening modal
    setPasswords({ current: "", new: "", confirm: "" });
    setPasswordError("");
    setPasswordSuccess("");
  };

  const closePasswordModal = () => {
    console.debug("Closing password modal.");
    setShowPasswordModal(false);
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    console.debug(`Password field "${name}" changed to:`, value);
    setPasswords(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    console.debug("Submitting password change form with:", passwords);
    setPasswordError("");
    setPasswordSuccess("");
    setIsSubmitting(true);

    // Simple validation
    if (!passwords.current || !passwords.new || !passwords.confirm) {
      console.debug("Validation failed: missing fields");
      setPasswordError("All fields are required");
      setIsSubmitting(false);
      return;
    }

    if (passwords.new !== passwords.confirm) {
      console.debug("Validation failed: new passwords do not match");
      setPasswordError("New passwords don't match");
      setIsSubmitting(false);
      return;
    }

    if (passwords.new.length < 8) {
      console.debug("Validation failed: new password too short");
      setPasswordError("Password must be at least 8 characters long");
      setIsSubmitting(false);
      return;
    }

    // Get the current user from localStorage
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (!user || !user.email) {
      console.debug("User not logged in or missing email.");
      setPasswordError("You must be logged in to change your password");
      setIsSubmitting(false);
      return;
    }

    // First verify the current password using the login endpoint
    const verifyPayload = {
      email: user.email,
      password: passwords.current
    };

    console.debug("=== PASSWORD CHANGE DEBUG INFO ===");
    console.debug("User from localStorage:", JSON.stringify(user, null, 2));
    console.debug("Login verification payload:", JSON.stringify(verifyPayload, null, 2));
    console.debug("Login endpoint:", `${BACKEND_URL}/people/login`);
    console.debug("Current password entered:", passwords.current);
    console.debug("New password entered:", passwords.new);
    console.debug("Confirmation password entered:", passwords.confirm);
    console.debug("===================================");

    // Use the login endpoint to verify current password
    axios
      .post(`${BACKEND_URL}/people/login`, verifyPayload, axiosConfig)
      .then(() => {
        console.debug("Current password verified, proceeding with update");
        // Prepare update payload
        const updatedPerson = {
          name: user.name,
          email: user.email,
          affiliation: user.affiliation,
          role: user.roles && user.roles.length > 0 ? user.roles[0] : '',
          password: passwords.new
        };
        
        console.debug("=== PASSWORD UPDATE INFO ===");
        console.debug("Update payload:", updatedPerson);
        console.debug("Update endpoint:", PEOPLE_UPDATE_ENDPOINT(user.email));
        console.debug("=============================");

        // Make the API call to update the person with the new password
        return axios.put(PEOPLE_UPDATE_ENDPOINT(user.email), updatedPerson, axiosConfig);
      })
      .then(() => {
        console.debug("Password update successful");
        setPasswordSuccess("Password successfully changed!");
        
        // Reset form after success
        setPasswords({ current: "", new: "", confirm: "" });
        
        // Close modal after 2 seconds
        setTimeout(() => {
          closePasswordModal();
        }, 2000);
      })
      .catch((error) => {
        console.error("Operation failed:", error);
        
        // Handle login verification failures
        if (error.response && error.response.status === 401) {
          setPasswordError("Current password is incorrect");
        } else {
          // Handle other errors
          setPasswordError(`Failed to update password: ${error.message}`);
        }
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  // Inline styles to avoid requiring external CSS
  const styles = {
    container: {
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      maxWidth: '800px',
      margin: '0 auto',
      padding: '20px',
      backgroundColor: darkMode ? '#1a1a1a' : '#f7f7f7',
      color: darkMode ? '#f7f7f7' : '#333',
      minHeight: '100vh'
    },
    card: {
      backgroundColor: darkMode ? '#2d2d2d' : '#ffffff',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
      padding: '24px',
      marginBottom: '20px'
    },
    header: {
      borderBottom: `1px solid ${darkMode ? '#444' : '#eaeaea'}`,
      paddingBottom: '16px',
      marginBottom: '24px'
    },
    title: {
      fontSize: '24px',
      fontWeight: 'bold',
      margin: '0 0 8px 0',
      color: darkMode ? '#ffffff' : '#333333'
    },
    subtitle: {
      fontSize: '14px',
      color: darkMode ? '#aaaaaa' : '#717171',
      margin: '0'
    },
    sectionTitle: {
      fontSize: '18px',
      fontWeight: '600',
      marginBottom: '16px',
      color: darkMode ? '#dddddd' : '#444444'
    },
    settingRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '16px',
      backgroundColor: darkMode ? '#3a3a3a' : '#f9f9f9',
      borderRadius: '8px',
      marginBottom: '12px'
    },
    settingInfo: {
      flex: '1'
    },
    settingLabel: {
      fontSize: '16px',
      fontWeight: '500',
      marginBottom: '4px',
      color: darkMode ? '#ffffff' : '#333333'
    },
    settingDescription: {
      fontSize: '14px',
      color: darkMode ? '#aaaaaa' : '#717171',
      margin: '0'
    },
    select: {
      padding: '8px 12px',
      borderRadius: '4px',
      border: `1px solid ${darkMode ? '#555' : '#ddd'}`,
      backgroundColor: darkMode ? '#444' : '#fff',
      color: darkMode ? '#fff' : '#333',
      fontSize: '14px',
      minWidth: '120px'
    },
    toggleSwitch: {
      position: 'relative',
      display: 'inline-block',
      width: '50px',
      height: '26px'
    },
    toggleInput: {
      opacity: 0,
      width: 0,
      height: 0
    },
    toggleSlider: {
      position: 'absolute',
      cursor: 'pointer',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: darkMode ? '#555' : '#ccc',
      borderRadius: '34px',
      transition: '0.4s'
    },
    toggleSliderChecked: {
      backgroundColor: '#4CAF50'
    },
    toggleSliderBefore: {
      position: 'absolute',
      content: '""',
      height: '18px',
      width: '18px',
      left: '4px',
      bottom: '4px',
      backgroundColor: 'white',
      borderRadius: '50%',
      transition: '0.4s'
    },
    toggleSliderBeforeChecked: {
      transform: 'translateX(24px)'
    },
    buttonGroup: {
      marginTop: '16px',
      display: 'flex',
      gap: '12px',
      flexWrap: 'wrap'
    },
    button: {
      padding: '10px 16px',
      borderRadius: '4px',
      border: 'none',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'background-color 0.2s'
    },
    primaryButton: {
      backgroundColor: '#4CAF50',
      color: 'white'
    },
    secondaryButton: {
      backgroundColor: darkMode ? '#555' : '#e0e0e0',
      color: darkMode ? 'white' : '#333'
    },
    dangerButton: {
      backgroundColor: '#f44336',
      color: 'white'
    },
    dangerZone: {
      padding: '16px',
      backgroundColor: darkMode ? '#3a2a2a' : '#fff8f8',
      border: `1px solid ${darkMode ? '#5a3a3a' : '#ffdddd'}`,
      borderRadius: '8px'
    },
    dangerTitle: {
      color: '#d32f2f',
      fontWeight: '500',
      marginBottom: '8px'
    },
    dangerDescription: {
      color: darkMode ? '#cc9999' : '#d32f2f',
      fontSize: '14px',
      marginBottom: '16px'
    },
    footer: {
      marginTop: '32px',
      paddingTop: '16px',
      borderTop: `1px solid ${darkMode ? '#444' : '#eaeaea'}`,
      display: 'flex',
      justifyContent: 'flex-end'
    },
    // Modal styles
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    },
    modal: {
      backgroundColor: darkMode ? '#2d2d2d' : '#ffffff',
      borderRadius: '8px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
      padding: '24px',
      width: '100%',
      maxWidth: '450px',
      position: 'relative'
    },
    modalHeader: {
      borderBottom: `1px solid ${darkMode ? '#444' : '#eaeaea'}`,
      paddingBottom: '16px',
      marginBottom: '24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    modalTitle: {
      fontSize: '20px',
      fontWeight: 'bold',
      margin: 0,
      color: darkMode ? '#ffffff' : '#333333'
    },
    closeButton: {
      backgroundColor: 'transparent',
      border: 'none',
      cursor: 'pointer',
      fontSize: '20px',
      color: darkMode ? '#aaa' : '#666'
    },
    formGroup: {
      marginBottom: '16px'
    },
    label: {
      display: 'block',
      marginBottom: '8px',
      fontSize: '14px',
      fontWeight: '500',
      color: darkMode ? '#dddddd' : '#444444'
    },
    input: {
      width: '100%',
      padding: '10px 12px',
      borderRadius: '4px',
      border: `1px solid ${darkMode ? '#555' : '#ddd'}`,
      backgroundColor: darkMode ? '#444' : '#fff',
      color: darkMode ? '#fff' : '#333',
      fontSize: '14px'
    },
    errorText: {
      color: '#f44336',
      fontSize: '14px',
      marginTop: '8px'
    },
    successText: {
      color: '#4CAF50',
      fontSize: '14px',
      marginTop: '8px'
    },
    modalFooter: {
      marginTop: '24px',
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '12px'
    }
  };

  // Function to render a toggle switch
  const renderToggleSwitch = (checked, onChange) => {
    const sliderStyle = {
      ...styles.toggleSlider,
      ...(checked ? styles.toggleSliderChecked : {})
    };
    
    const sliderBeforeStyle = {
      ...styles.toggleSliderBefore,
      ...(checked ? styles.toggleSliderBeforeChecked : {})
    };
    
    return (
      <label style={styles.toggleSwitch}>
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          style={styles.toggleInput}
        />
        <span style={sliderStyle}>
          <span style={sliderBeforeStyle}></span>
        </span>
      </label>
    );
  };

  // Password change modal
  const renderPasswordModal = () => {
    if (!showPasswordModal) return null;

    return (
      <div style={styles.modalOverlay}>
        <div style={styles.modal}>
          <div style={styles.modalHeader}>
            <h2 style={styles.modalTitle}>Change Password</h2>
            <button 
              style={styles.closeButton}
              onClick={closePasswordModal}
            >
              ×
            </button>
          </div>

          <form onSubmit={handlePasswordSubmit}>
            <div style={styles.formGroup}>
              <label style={styles.label} htmlFor="current">Current Password</label>
              <input
                style={styles.input}
                type="password"
                id="current"
                name="current"
                value={passwords.current}
                onChange={handlePasswordChange}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label} htmlFor="new">New Password</label>
              <input
                style={styles.input}
                type="password"
                id="new"
                name="new"
                value={passwords.new}
                onChange={handlePasswordChange}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label} htmlFor="confirm">Confirm New Password</label>
              <input
                style={styles.input}
                type="password"
                id="confirm"
                name="confirm"
                value={passwords.confirm}
                onChange={handlePasswordChange}
              />
            </div>

            {passwordError && <div style={styles.errorText}>{passwordError}</div>}
            {passwordSuccess && <div style={styles.successText}>{passwordSuccess}</div>}

            <div style={styles.modalFooter}>
              <button 
                type="button"
                style={{...styles.button, ...styles.secondaryButton}}
                onClick={closePasswordModal}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button 
                type="submit"
                style={{...styles.button, ...styles.primaryButton}}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <header style={styles.header}>
          <h1 style={styles.title}>Settings</h1>
          <p style={styles.subtitle}>Manage your account preferences and settings</p>
        </header>

        <section>
          <h2 style={styles.sectionTitle}>Preferences</h2>
          
          <div style={styles.settingRow}>
            <div style={styles.settingInfo}>
              <h3 style={styles.settingLabel}>Notifications</h3>
              <p style={styles.settingDescription}>Receive alerts and updates</p>
            </div>
            {renderToggleSwitch(notifications, toggleNotifications)}
          </div>

          <div style={styles.settingRow}>
            <div style={styles.settingInfo}>
              <h3 style={styles.settingLabel}>Dark Mode</h3>
              <p style={styles.settingDescription}>Toggle dark interface theme</p>
            </div>
            {renderToggleSwitch(darkMode, toggleDarkMode)}
          </div>

          <div style={styles.settingRow}>
            <div style={styles.settingInfo}>
              <h3 style={styles.settingLabel}>Language</h3>
              <p style={styles.settingDescription}>Choose your preferred language</p>
            </div>
            <select
              style={styles.select}
              value={language}
              onChange={handleLanguageChange}
            >
              <option value="English">English</option>
              <option value="Spanish">Spanish</option>
              <option value="French">French</option>
              <option value="Korean">Korean</option>
              <option value="Japanese">Japanese</option>
              <option value="German">German</option>
            </select>
          </div>
        </section>

        <section style={{ marginTop: '32px' }}>
          <h2 style={styles.sectionTitle}>Account</h2>
          
          <div style={{ ...styles.settingRow, display: 'block' }}>
            <h3 style={styles.settingLabel}>Security</h3>
              <div style={styles.buttonGroup}>
              <button 
                style={{...styles.button, ...styles.primaryButton}}
                onClick={openPasswordModal}
              >
                Change Password
              </button>
              <button 
                style={{...styles.button, ...styles.secondaryButton}}
                onClick={() => console.debug("Two-Factor Authentication clicked")}
              >
                Two-Factor Authentication
              </button>
              <button 
                style={{...styles.button, ...styles.secondaryButton}}
                onClick={handleDevInfoClick}
              >
                Fetch /dev/info
              </button>
            </div>
          </div>
          
          <div style={styles.dangerZone}>
            <h3 style={styles.dangerTitle}>Danger Zone</h3>
            <p style={styles.dangerDescription}>This action cannot be undone.</p>
            <button 
              style={{...styles.button, ...styles.dangerButton}}
              onClick={() => console.debug("Delete Account clicked")}
            >
              Delete Account
            </button>
          </div>
        </section>

        <div style={styles.footer}>
          <button 
            style={{...styles.button, ...styles.primaryButton}}
            onClick={() => console.debug("Save Changes clicked")}
          >
            Save Changes
          </button>
        </div>
      </div>

      {renderPasswordModal()}
    </div>
  );
}

export default Settings;