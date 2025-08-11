# Quick Links - Personal Homepage

A modern, feature-rich personal dashboard for organizing and accessing your favorite links with advanced clustering, theming, and organizational features.

![Quick Links Dashboard](https://via.placeholder.com/800x400?text=Quick+Links+Dashboard)

## ✨ Features

### 🔗 **Smart Link Management**
- Create, edit, and delete links with rich metadata (title, description, URL, icon, tags)
- **200+ Icons** across 20+ categories: development tools, social media, productivity, entertainment, and more
- Drag-and-drop reordering with iOS-style edit mode and wiggle animations
- Advanced search and filtering capabilities

### 🎯 **Cluster Links**
- Open multiple related URLs at once with a single click
- Smart popup handling with automatic permission guidance
- Visual indicators showing cluster link count
- Perfect for opening your daily tools, social media, or project-specific links

### 📋 **Views System**
- Create custom views to organize link subsets
- **URL-based navigation** - bookmark specific views (e.g., `/dashboard?view=work-tools`)
- Set different views as homepage on different computers
- Color-coded tabs with customizable colors and icons
- Assign links to multiple views or keep them view-specific

### 🎨 **Advanced Theming**
- **11 built-in themes**: Light, Dark, Ocean, Forest, Sunset, Rose, Purple, Emerald, Slate, Cyber, Warm
- Real-time theme preview and switching
- Persistent theme preferences across sessions
- Comprehensive CSS custom properties system

### 🔐 **Secure Authentication**
- Firebase Authentication with persistent login (users stay logged in by default)
- Netlify Forms integration for new user registration requests
- Admin dashboard for user management
- Route guards protecting sensitive areas

### 📱 **Responsive Design**
- Mobile-first design optimized for all screen sizes
- Touch-friendly interface with large touch targets
- Progressive enhancement for desktop and mobile

## 🚀 Quick Start

### Prerequisites
- Node.js v20+ 
- Angular CLI
- Firebase project
- Netlify account (for deployment)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd myLinks
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   - Create a Firebase project
   - Set up Authentication (Email/Password)
   - Set up Firestore database
   - Copy your Firebase config to `src/app/services/firebase.config.ts`

4. **Start development server**
   ```bash
   npm start
   ```
   
   Navigate to `http://localhost:4200/`

## 🛠️ Tech Stack

- **Frontend**: Angular 17 (standalone components)
- **Backend**: Firebase (Auth + Firestore)
- **Deployment**: Netlify
- **Styling**: Modern CSS with custom properties
- **Forms**: Netlify Forms for user registration

## 📁 Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── auth/           # Authentication (sign-in, registration request)
│   │   ├── dashboard/      # Main dashboard with views
│   │   ├── link-wizard/    # Link creation/editing
│   │   ├── view-wizard/    # View creation/editing
│   │   └── admin/          # Admin dashboard
│   ├── services/           # Business logic and API calls
│   ├── models/             # TypeScript interfaces
│   ├── guards/             # Route protection
│   └── data/               # Static data (icons, themes)
├── public/                 # Static assets
└── index.html              # Main HTML (includes Netlify forms)
```

## 🔧 Configuration

### Environment Variables

Create a Firebase configuration file at `src/app/services/firebase.config.ts`:

```typescript
export const firebaseConfig = {
  apiKey: "your_api_key",
  authDomain: "your_auth_domain", 
  projectId: "your_project_id",
  storageBucket: "your_storage_bucket",
  messagingSenderId: "your_sender_id",
  appId: "your_app_id",
  measurementId: "your_measurement_id"
};
```

### Netlify Deployment

1. Connect your repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist/myLinks/browser`
4. Enable Netlify Forms in site settings
5. Add Firebase environment variables in Netlify dashboard

## 📖 Usage

### Creating Links
1. Click the "+" button in the dashboard header
2. Fill in link details (title, URL, description, icon, tags)
3. For cluster links, toggle "Create Cluster" and add multiple URLs
4. Assign to specific views if desired

### Managing Views
1. Use the view tabs to organize your links
2. Create custom views with the "+" tab
3. Bookmark view URLs for quick access: `/dashboard?view=work-tools`
4. Set different view URLs as homepage on different devices

### Themes
1. Click the theme selector in the header
2. Preview themes in real-time
3. Themes are automatically saved and persist across sessions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

This project was bootstrapped with [Angular CLI](https://github.com/angular/angular-cli) version 20.1.5.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
