import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import Masthead from './Masthead';
import { TestWrapper } from '../../test-utils/test-wrapper';
import '@testing-library/jest-dom';

// Mock axios
jest.mock('axios');

describe('Masthead Component', () => {
  beforeEach(() => {
    // Mock successful axios response with masthead data
    axios.get.mockResolvedValue({
      data: {
        Masthead: {
          'Editors': [
            { name: 'John Editor', email: 'john@example.com' },
            { name: 'Jane Editor', email: 'jane@example.com' }
          ],
          'Writers': [
            { name: 'Bob Writer', email: 'bob@example.com' },
            { name: 'Alice Writer', email: 'alice@example.com' }
          ]
        }
      }
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders masthead page with title', async () => {
    render(
      <TestWrapper>
        <Masthead />
      </TestWrapper>
    );

    expect(screen.getByText('Our Team')).toBeInTheDocument();
    expect(screen.getByText('Meet the people behind the mission')).toBeInTheDocument();
  });

  test('fetches and displays masthead data correctly', async () => {
    render(
      <TestWrapper>
        <Masthead />
      </TestWrapper>
    );

    // Verify API call was made to the correct endpoint
    expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/people/masthead'));

    // Wait for the masthead data to be loaded and displayed
    await waitFor(() => {
      expect(screen.getByText('Editors')).toBeInTheDocument();
    });

    // Check that all role groups and people are displayed
    expect(screen.getByText('Editors')).toBeInTheDocument();
    expect(screen.getByText('Writers')).toBeInTheDocument();
    
    // Check that people are displayed correctly
    expect(screen.getByText('John Editor')).toBeInTheDocument();
    expect(screen.getByText('Jane Editor')).toBeInTheDocument();
    expect(screen.getByText('Bob Writer')).toBeInTheDocument();
    expect(screen.getByText('Alice Writer')).toBeInTheDocument();
    
    // Check email links
    const johnEmailLink = screen.getByText('john@example.com');
    expect(johnEmailLink).toBeInTheDocument();
    expect(johnEmailLink).toHaveAttribute('href', 'mailto:john@example.com');
  });

  test('handles empty masthead data gracefully', async () => {
    // Mock empty masthead data
    axios.get.mockResolvedValue({
      data: {
        Masthead: {}
      }
    });

    render(
      <TestWrapper>
        <Masthead />
      </TestWrapper>
    );

    // Only the title should be visible, no role groups
    await waitFor(() => {
      expect(screen.getByText('Our Team')).toBeInTheDocument();
    });
    
    expect(screen.queryByText('Editors')).not.toBeInTheDocument();
    expect(screen.queryByText('Writers')).not.toBeInTheDocument();
  });

  test('handles API error gracefully', async () => {
    // Mock API error
    console.error = jest.fn(); // Suppress console error in test output
    axios.get.mockRejectedValue(new Error('API Error'));

    render(
      <TestWrapper>
        <Masthead />
      </TestWrapper>
    );

    // Only the title should be visible, no role groups
    await waitFor(() => {
      expect(screen.getByText('Our Team')).toBeInTheDocument();
    });
    
    expect(console.error).toHaveBeenCalled();
    expect(screen.queryByText('Editors')).not.toBeInTheDocument();
  });
});
