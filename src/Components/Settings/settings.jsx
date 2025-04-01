import React, { useState } from "react";

function Settings() {
  const [notifications, setNotifications] = useState(true);
  const [language, setLanguage] = useState("English");
  const [darkMode, setDarkMode] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: ""
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const toggleNotifications = () => {
    setNotifications(!notifications);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
  };

  const openPasswordModal = () => {
    setShowPasswordModal(true);
    // Reset form state when opening modal
    setPasswords({ current: "", new: "", confirm: "" });
    setPasswordError("");
    setPasswordSuccess("");
  };

  const closePasswordModal = () => {
    setShowPasswordModal(false);
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    // Simple validation
    if (!passwords.current || !passwords.new || !passwords.confirm) {
      setPasswordError("All fields are required");
      return;
    }

    if (passwords.new !== passwords.confirm) {
      setPasswordError("New passwords don't match");
      return;
    }

    if (passwords.new.length < 8) {
      setPasswordError("Password must be at least 8 characters long");
      return;
    }

    // This is where you would typically make an API call to update the password
    // For demonstration, we'll just simulate a successful password change
    setTimeout(() => {
      setPasswordSuccess("Password successfully changed!");
      // Reset form after success
      setPasswords({ current: "", new: "", confirm: "" });
      
      // Close modal after 2 seconds
      setTimeout(() => {
        closePasswordModal();
      }, 2000);
    }, 1000);
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
              >
                Cancel
              </button>
              <button 
                type="submit"
                style={{...styles.button, ...styles.primaryButton}}
              >
                Update Password
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
              <button style={{...styles.button, ...styles.secondaryButton}}>
                Two-Factor Authentication
              </button>
            </div>
          </div>
          
          <div style={styles.dangerZone}>
            <h3 style={styles.dangerTitle}>Danger Zone</h3>
            <p style={styles.dangerDescription}>This action cannot be undone.</p>
            <button style={{...styles.button, ...styles.dangerButton}}>
              Delete Account
            </button>
          </div>
        </section>

        <div style={styles.footer}>
          <button style={{...styles.button, ...styles.primaryButton}}>
            Save Changes
          </button>
        </div>
      </div>

      {renderPasswordModal()}
    </div>
  );
}

export default Settings;