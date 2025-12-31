# Copilot Instructions for E_HRM_DEV_FE

## Overview
E_HRM_DEV_FE is a front-end application for managing HR-related tasks. The project is structured as a React application with Tailwind CSS for styling. It includes modular components, services for API communication, and a clear separation of concerns between UI, state management, and business logic.

## Project Structure
- **`src/components`**: Contains reusable React components. Examples include `EmployeeForm.jsx` and `Header.jsx`.
- **`src/pages`**: Defines page-level components like `Login.jsx` and `MainLayout.jsx`.
- **`src/services`**: Houses API service files for interacting with backend endpoints (e.g., `employeeService.js`, `userService.js`).
- **`src/store`**: Manages global state using React Context API.
- **`src/assets`**: Contains static assets like CSS files and images.
- **`src/routes`**: Defines application routes.

## Key Patterns and Conventions
1. **Component Structure**:
   - Components are functional and use hooks for state and lifecycle management.
   - CSS modules or Tailwind classes are used for styling.

2. **Service Layer**:
   - API calls are centralized in `src/services`.
   - Each service file corresponds to a specific domain (e.g., `employeeService.js` for employee-related APIs).

3. **State Management**:
   - Global state is managed using `StoreProvider.jsx` in `src/store`.
   - Local state is handled within components using React's `useState` and `useReducer` hooks.

4. **Routing**:
   - Routes are defined in `src/routes/index.jsx`.
   - Page components are lazy-loaded for performance optimization.

5. **Styling**:
   - Tailwind CSS is the primary styling framework.
   - Custom styles are defined in `src/assets/css`.

## Developer Workflows
### Build and Run
- Install dependencies:
  ```bash
  npm install
  ```
- Start the development server:
  ```bash
  npm start
  ```
- Build for production:
  ```bash
  npm run build
  ```

### Testing
- Run tests:
  ```bash
  npm test
  ```
- Test files are located alongside components (e.g., `App.test.js`).

### Debugging
- Use browser developer tools for debugging React components.
- API issues can be debugged using tools like Postman or browser network tabs.

## Integration Points
- **Backend API**: The application communicates with backend services via REST APIs. Endpoints are defined in `src/services`.
- **Authentication**: Managed in `src/pages/Login.jsx` and related components.
- **State Management**: Global state is shared via `StoreProvider.jsx`.

## Examples
### Adding a New Service
1. Create a new file in `src/services` (e.g., `newService.js`).
2. Define API methods:
   ```javascript
   import api from './api';

   export const fetchData = () => api.get('/endpoint');
   ```

### Creating a New Component
1. Add a new file in `src/components` (e.g., `NewComponent.jsx`).
2. Use the following template:
   ```javascript
   import React from 'react';

   const NewComponent = () => {
       return <div>New Component</div>;
   };

   export default NewComponent;
   ```

## Notes
- Follow the existing folder structure and naming conventions.
- Ensure all new components and services are tested.
- Use ESLint and Prettier for code formatting.

For further details, refer to the [README.md](../README.md).