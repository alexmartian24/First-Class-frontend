import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import Home from './Home';
import { useAuth } from '../../context/AuthContext';
import '@testing-library/jest-dom';

// Mock axios
jest.mock('axios');

// Mock the auth context
jest.mock('../../context/AuthContext', () => ({
  useAuth: jest.fn()
}));

describe('Home Component', () => {
  beforeEach(() => {
    // Default mock implementation for useAuth
    useAuth.mockImplementation(() => ({
      isEditor: () => false
    }));

    // Mock successful axios response
    axios.get.mockResolvedValue({
      data: {
        title: 'Test Title',
        text: 'Test Description'
      }
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders home page with content from API', async () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    // Wait for the content to be loaded
    await waitFor(() => {
      expect(screen.getByText('Test Title')).toBeInTheDocument();
    });

    expect(screen.getByText(/Test Description/)).toBeInTheDocument();
    expect(screen.getByText('Read More')).toBeInTheDocument();
  });

  test('does not show edit controls for non-editors', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    expect(screen.queryByText('Edit Content')).not.toBeInTheDocument();
  });

  test('shows edit controls for editors', async () => {
    // Mock user as editor
    useAuth.mockImplementation(() => ({
      isEditor: () => true
    }));

    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    // Wait for the content to be loaded
    await waitFor(() => {
      expect(screen.getByText('Edit Content')).toBeInTheDocument();
    });
  });
});
