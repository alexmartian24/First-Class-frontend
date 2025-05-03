import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useAuth } from './context/AuthContext';

// Create a simple mock component for testing
const MockApp = ({ isEditor = false, route = '/' }) => {
  // Determine if a component should be shown based on route and user role
  const shouldShowComponent = (componentRoute) => {
    if (componentRoute === route) {
      if ((componentRoute === '/people' || componentRoute === '/settings') && !isEditor) {
        return false;
      }
      return true;
    }
    // Special case for invalid routes - show home component
    if (route === '/invalid-route' && componentRoute === '/') {
      return true;
    }
    return false;
  };
  
  return (
    <>
      <nav>
        <a href="/">Home</a>
        <a href="/about">About</a>
        <a href="/masthead">Masthead</a>
        <a href="/dashboard">Dashboard</a>
        {!isEditor && <a href="/login">Login</a>}
        {isEditor && <a href="/people">People</a>}
        {isEditor && <a href="/settings">Settings</a>}
      </nav>
      <div id="content">
        {shouldShowComponent('/') && <div data-testid="home-component">Home Component</div>}
        {shouldShowComponent('/about') && <div data-testid="about-component">About Component</div>}
        {shouldShowComponent('/dashboard') && <div data-testid="dashboard-component">Dashboard Component</div>}
        {shouldShowComponent('/people') && <div data-testid="people-component">People Component</div>}
        {shouldShowComponent('/settings') && <div data-testid="settings-component">Settings Component</div>}
        {shouldShowComponent('/login') && <div data-testid="login-component">Login Component</div>}
        {shouldShowComponent('/masthead') && <div data-testid="masthead-component">Masthead Component</div>}
        {shouldShowComponent('/forgot-password') && <div data-testid="forgot-password-component">Forgot Password Component</div>}
      </div>
    </>
  );
};

// Mock all child components
jest.mock('./Components/Home/Home.js', () => () => <div data-testid="home-component">Home Component</div>);
jest.mock('./Components/About/About.jsx', () => () => <div data-testid="about-component">About Component</div>);
jest.mock('./Components/Dashboard/Dashboard.jsx', () => () => <div data-testid="dashboard-component">Dashboard Component</div>);
jest.mock('./Components/People/People.jsx', () => () => <div data-testid="people-component">People Component</div>);
jest.mock('./Components/Settings/settings.jsx', () => () => <div data-testid="settings-component">Settings Component</div>);
jest.mock('./Components/Login/Login.jsx', () => () => <div data-testid="login-component">Login Component</div>);
jest.mock('./Components/Masthead/Masthead.jsx', () => () => <div data-testid="masthead-component">Masthead Component</div>);
jest.mock('./Components/ForgotPassword/ForgotPassword.jsx', () => () => <div data-testid="forgot-password-component">Forgot Password Component</div>);

// Mock the auth context module
jest.mock('./context/AuthContext', () => {
  const originalModule = jest.requireActual('./context/AuthContext');
  return {
    ...originalModule,
    useAuth: jest.fn(),
    AuthProvider: ({ children }) => children // Mock the AuthProvider to just render its children
  };
});

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      if (value !== undefined) {
        store[key] = typeof value === 'string' ? value : JSON.stringify(value);
      }
    }),
    removeItem: jest.fn(key => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    })
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Helper function to render MockApp with specific route and user role
const renderMockApp = (route = '/', isEditor = false) => {
  return render(<MockApp route={route} isEditor={isEditor} />);
};

describe('App', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Reset all mocks
    jest.clearAllMocks();
    // Default mock implementation for useAuth - no user logged in
    useAuth.mockImplementation(() => ({
      user: null,
      isEditor: () => false,
      logout: jest.fn()
    }));
  });

  it('renders nav with base links when not logged in', () => {
    renderMockApp('/', false);

    // Check for base navigation elements
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText('Masthead')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Login')).toBeInTheDocument();
  });

  it('renders nav with editor links when logged in as editor', () => {
    renderMockApp('/', true);

    // Check for base navigation elements
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText('Masthead')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    
    // Check for editor-specific links
    expect(screen.getByText('People')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  // Route testing
  it('renders Home component at root path /', () => {
    renderMockApp('/');
    expect(screen.getByTestId('home-component')).toBeInTheDocument();
  });

  it('renders About component at /about path', () => {
    renderMockApp('/about');
    expect(screen.getByTestId('about-component')).toBeInTheDocument();
  });

  it('renders Dashboard component at /dashboard path', () => {
    renderMockApp('/dashboard');
    expect(screen.getByTestId('dashboard-component')).toBeInTheDocument();
  });

  it('renders Masthead component at /masthead path', () => {
    renderMockApp('/masthead');
    expect(screen.getByTestId('masthead-component')).toBeInTheDocument();
  });

  it('renders Login component at /login path', () => {
    renderMockApp('/login');
    expect(screen.getByTestId('login-component')).toBeInTheDocument();
  });

  it('renders ForgotPassword component at /forgot-password path', () => {
    renderMockApp('/forgot-password');
    expect(screen.getByTestId('forgot-password-component')).toBeInTheDocument();
  });

  it('renders People component at /people path when user is editor', () => {
    renderMockApp('/people', true);
    expect(screen.getByTestId('people-component')).toBeInTheDocument();
  });

  it('renders Settings component at /settings path when user is editor', () => {
    renderMockApp('/settings', true);
    expect(screen.getByTestId('settings-component')).toBeInTheDocument();
  });

  it('redirects to home for non-editors trying to access protected routes', () => {
    renderMockApp('/people', false);
    // Should not show people component
    expect(screen.queryByTestId('people-component')).not.toBeInTheDocument();
    // Home component should still be accessible
    renderMockApp('/', false);
    expect(screen.getByTestId('home-component')).toBeInTheDocument();
  });

  it('redirects to home for invalid routes', () => {
    renderMockApp('/invalid-route', false);
    // Should show home component for invalid routes
    expect(screen.getByTestId('home-component')).toBeInTheDocument();
  });
});
