# Academic Journal Assistant - Frontend

## Overview

This is the frontend for the Academic Journal Assistant, a web application designed to facilitate the manuscript submission and review process for academic journals. The system allows authors to submit manuscripts and enables editors to manage the review workflow. It supports different user roles (authors, editors, referees) with role-specific functionalities. The application is built with React and communicates with a Python backend hosted on PythonAnywhere.

## Requirements

- [Node.js](https://nodejs.org/) (v23.5.0 or higher)
- npm (v10.9.2 or higher)

## Getting Started

### Installation

```bash
# Clone the repository (if you haven't already)
git clone <repository-url>
cd SWE/frontend

# Install dependencies
npm install
```

### Running the Application

The application can be run in two modes:

#### Cloud Mode (Using Remote Backend)

```bash
make cloud
# or directly
./cloud.sh
```

This runs the frontend with the remote backend at https://zcd.pythonanywhere.com

#### Local Mode (Using Local Backend)

```bash
make local
# or directly
./local.sh
```

This runs the frontend with a local backend at http://127.0.0.1:8000

### Testing

```bash
# Run all tests
make all_tests
# or directly
npm run test -- --silent
```

## Features

### Authentication
- User login with email and password
- Role-based access control (Authors, Editors, Referees)
- Password recovery workflow

### Manuscript Management
- Submit new manuscripts to the journal
- Track manuscript status through the publication workflow
- Manage manuscript state transitions (submission, review, editing, publication)
- Assign referees to manuscripts for peer review

### People Management
- View list of people with their details
- Add new people with specific roles (Author, Editor, Referee)
- Edit existing people
- Delete people

### Masthead
- View journal organizational structure with personnel grouped by roles
- Clean, card-based UI with responsive design

### Additional Pages
- Dashboard for authenticated users
- About page with application information
- Settings page for user preferences

## Architecture

### Technology Stack
- **Framework**: React.js
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **State Management**: React Context API
- **UI Components**: Custom components with CSS
- **Testing**: Jest and React Testing Library

### Key Components
- **Manuscript Component**: Manages manuscript submission and workflow
- **People Component**: Manages CRUD operations for journal personnel
- **Masthead Component**: Displays journal personnel organized by roles
- **Authentication Components**: Handles user login and session management
- **Navigation**: Provides application routing through a responsive navbar

### API Integration
- Direct endpoint approach using consistent patterns
- Manuscript endpoints follow `/manuscripts/[action]/[params]` format
- People-related endpoints follow `/people/[action]/[params]` format
- CORS configuration for cross-origin requests

## Backend Integration

The frontend communicates with a Python backend that provides RESTful API endpoints. The backend is hosted on PythonAnywhere with the following configuration:

- Backend URL: https://zcd.pythonanywhere.com
- CORS headers configured for cross-origin requests
- API endpoints follow consistent naming patterns

## Development

### Project Structure
```
src/
├── Components/       # UI components organized by feature
├── context/          # React context for state management
├── Styles/           # CSS styles
├── test-utils/       # Testing utilities
├── constants.js      # Application constants
└── App.js            # Main application component
```

### Adding New Features
To add new features:
1. Create a new component in the appropriate directory
2. Add the component to the router in App.js
3. Implement API integration if needed
4. Write tests for the new component

## Troubleshooting

### CORS Issues
If you encounter CORS issues when connecting to the backend, ensure the backend has CORS properly configured:

```python
from flask import Flask
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
```

### Authentication Issues
If you're having trouble with authentication:
1. Check that you're using the correct credentials
2. Verify that the backend authentication endpoint is accessible
3. Check browser console for any error messages