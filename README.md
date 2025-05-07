# Patient Management App

A modern, frontend-only patient management system built with Angular 17. This application provides a robust solution for managing patient records with client-side data persistence and multi-tab support.

## Features

### Core Functionality
- **Patient Registration**: Comprehensive form with validation
- **Patient List Management**: Advanced filtering, sorting, and pagination
- **SQL Query Support**: Direct SQL querying of patient records
- **Data Persistence**: Local storage with IndexedDB
- **Multi-tab Support**: Real-time sync across browser tabs

### Technical Features
- **Standalone Components**: Utilizing Angular 17's latest features
- **Material Design**: Modern and responsive UI components
- **Client-side Database**: SQL.js implementation
- **Form Validation**: Real-time validation with error messages
- **Cross-tab Communication**: Using BroadcastChannel API

## Tech Stack

- **Frontend Framework**: Angular 17
- **UI Library**: Angular Material
- **Database**: SQL.js
- **State Management**: BroadcastChannel API
- **Storage**: IndexedDB
- **Styling**: SCSS with Material theming

## Prerequisites

- Node.js (v18.x or higher)
- npm (v9.x or higher)
- Angular CLI (v17.x)

## Getting Started

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/patient-management-app.git
   cd patient-management-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   ng serve
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:4200
   ```

## Application Usage

### Patient Registration
1. Click "Add Patient" in the navigation bar
2. Fill in the patient details:
   - First and Last Name
   - Date of Birth
   - Gender
   - Contact Information
   - Medical History
3. Submit the form

### Patient Management
1. **View Patients**:
   - Access the patient list from the home page
   - Use the search bar for quick filtering
   - Sort by clicking column headers
   - Navigate through pages using the paginator

2. **Edit Patient**:
   - Click the edit icon on any patient row
   - Modify the patient information
   - Save changes

3. **Delete Patient**:
   - Click the delete icon
   - Confirm deletion in the dialog

### Data Operations
- **Search**: Use the search bar for real-time filtering
- **Sort**: Click column headers to sort data
- **Filter**: Apply advanced filters using the filter menu
- **Export**: Download patient data in various formats

## Development

### Available Scripts

- **Development server**:
  ```bash
  ng serve
  ```

- **Production build**:
  ```bash
  ng build --configuration production
  ```

- **Run tests**:
  ```bash
  ng test
  ```

- **Lint code**:
  ```bash
  ng lint
  ```

### Code Structure

```
src/
├── app/
│   ├── components/
│   │   ├── patient-form/
│   │   ├── patient-list/
│   │   └── confirm-dialog/
│   ├── services/
│   │   ├── database.service.ts
│   │   └── patient.service.ts
│   ├── models/
│   │   └── patient.model.ts
│   └── shared/
└── assets/
```

## Deployment

### Netlify Deployment

1. Build the application:
   ```bash
   ng build --configuration production
   ```

2. Deploy using Netlify CLI:
   ```bash
   netlify deploy --prod
   ```

Live Demo: [Patient Management App](https://your-app-url.netlify.app)

## Testing

### Unit Tests
```bash
ng test
```

### End-to-End Tests
```bash
ng e2e
```

## Security

- Client-side data encryption for sensitive information
- Secure form validation and sanitization
- Protected routes and authentication ready

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Authors

- Kumar Shubham - Initial work 

## Acknowledgments

- Angular Team for the amazing framework
- Material Design Team for the UI components
- SQL.js Team for the client-side SQL implementation
