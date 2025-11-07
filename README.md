# ClientHub - Simple Client Information Collection App

A beautiful, easy-to-use web application for collecting information and files from clients. Built with Next.js, TypeScript, and Tailwind CSS.

## Features

- **Simple & Intuitive UI** - Clean design that anyone can understand
- **Admin Dashboard** - Create requests and track submissions
- **Client Portal** - Easy file upload interface for clients
- **Real-time Notifications** - Get notified when clients upload files
- **File Management** - Secure file storage and download
- **Status Tracking** - Track request status (Pending, In Progress, Completed)

## Quick Start

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   cd New
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

### Demo Accounts

The app comes with pre-configured demo accounts:

**Admin Account:**
- Email: admin@example.com
- Access: Full dashboard with ability to create requests and view all submissions

**Client Accounts:**
- Email: john@example.com
- Email: jane@example.com
- Access: View assigned requests and upload files

### Admin Workflow

1. **Sign in** with admin@example.com
2. **Create a new request** by clicking "+ Create New Request"
3. **Select a client** from the dropdown
4. **Enter request details** (title and description)
5. **Get notified** when the client uploads files
6. **View and download** submitted files

### Client Workflow

1. **Sign in** with your client email
2. **View your requests** on the dashboard
3. **Click on a request** to see details
4. **Upload files** by clicking or dragging files
5. **Track your progress** with status badges

## Project Structure

```
├── app/
│   ├── api/                    # API routes
│   │   ├── auth/              # Authentication endpoints
│   │   ├── requests/          # Request management endpoints
│   │   ├── upload/            # File upload endpoint
│   │   ├── files/             # File download endpoint
│   │   ├── notifications/     # Notification endpoints
│   │   └── clients/           # Client list endpoint
│   ├── admin/                 # Admin dashboard page
│   ├── client/                # Client portal page
│   ├── globals.css            # Global styles
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Landing page
├── components/
│   ├── Button.tsx             # Reusable button component
│   ├── Card.tsx               # Card component
│   ├── FileUpload.tsx         # File upload component
│   └── NotificationBell.tsx   # Notification bell component
├── lib/
│   ├── types.ts               # TypeScript types
│   └── storage.ts             # In-memory data storage
├── public/
│   └── uploads/               # Uploaded files directory
└── package.json               # Dependencies
```

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **File Upload**: Multer
- **UI Components**: Custom React components
- **State Management**: React Hooks

## Key Features Explained

### Request Management
- Admins create information requests for clients
- Requests include title, description, and due dates
- Status tracking: Pending → In Progress → Completed

### File Upload
- Drag-and-drop file upload
- Support for all file types
- File size and type validation
- Secure file storage

### Notifications
- Real-time notification system
- Admin notified when client uploads files
- Client notified when new request is created
- Unread count badge on notification bell

### Authentication
- Simple email-based authentication (demo)
- Role-based access control (Admin vs Client)
- Persistent sessions using localStorage

## Customization

### Adding Users
Edit `lib/storage.ts` to add more users:

```typescript
const users: User[] = [
  {
    id: 'client-3',
    name: 'New Client',
    email: 'newclient@example.com',
    role: 'client',
    createdAt: new Date(),
  },
];
```

### Styling
- Colors: Edit Tailwind classes in components
- Layout: Modify component files in `/components`
- Global styles: Edit `app/globals.css`

### File Storage
Currently uses local file system. For production:
- Use cloud storage (AWS S3, Google Cloud Storage)
- Update upload API in `app/api/upload/route.ts`

### Database
Currently uses in-memory storage. For production:
- Add a database (PostgreSQL, MongoDB, etc.)
- Replace storage functions in `lib/storage.ts`

## Production Considerations

**Before deploying to production, implement:**

1. **Proper Authentication**
   - Use NextAuth.js or similar
   - Implement JWT tokens or sessions
   - Add password-based authentication

2. **Database**
   - Replace in-memory storage with a real database
   - Add data persistence
   - Implement proper queries and indexes

3. **File Storage**
   - Use cloud storage (S3, GCS, Azure Blob)
   - Implement file size limits
   - Add virus scanning

4. **Email Notifications**
   - Set up email service (SendGrid, AWS SES)
   - Send real email notifications
   - Add email templates

5. **Security**
   - Add CSRF protection
   - Implement rate limiting
   - Add input validation
   - Use HTTPS only
   - Sanitize file uploads

6. **Monitoring**
   - Add error tracking (Sentry)
   - Implement logging
   - Add analytics

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Deploy!

### Other Platforms
- Netlify
- Railway
- Render
- AWS Amplify
- Your own server with Node.js

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## License

MIT License - feel free to use this for your projects!

## Support

For issues or questions:
1. Check this README
2. Review the code comments
3. Open a GitHub issue

---

Built with ❤️ for simple client information collection
