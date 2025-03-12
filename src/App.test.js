import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event'
import App from './App';
import "@testing-library/jest-dom";

// import { homeHeader } from './App'

describe('App', () => {
  it('renders nav and home', async() => {
    render(<App />);

    await screen.findByRole('heading');
    await screen.findAllByRole('listitem');

    expect(screen.getByRole('heading'))
      .toHaveTextContent('Journal');
      //.toHaveTextContent(homeHeader);

    expect(screen.getAllByRole('listitem')).toHaveLength(5)
    
  })
});
