# 🚀 SkillSync - The Future of Skills & Hiring

A revolutionary skills marketplace platform that eliminates traditional CVs and connects workers directly with companies through verified skills and employment history. Built with Next.js, TypeScript, and Tailwind CSS.

## ✨ What Makes SkillSync Different?

**No More CVs.** Just verified skills, real work history, and direct connections.

### For Workers 👷
- **100% Free** - Create your profile and showcase your skills
- **Verified Employment History** - Employers "sign you in/out" creating an unbreakable chain of verified work records
- **Skills-Based Profiles** - No traditional CV needed, just list your real skills
- **Get Found** - Companies search by skills and contact you directly
- **Build Reputation** - Collect reviews from employers you've worked with

### For Companies 🏢
- **Pay-Per-Contact Model** - Only pay for workers you're interested in ($5/contact base price)
- **Smart Search & Filter** - Find workers by specific skills (carpenter, pizza chef, laborer, etc.)
- **Review-to-Save System** - Leave reviews to earn points. More points = permanent discounts!
  - 10 points per review
  - 1% discount per 10 points
  - Up to 50% discount on contact purchases
- **Employment Verification** - Sign workers in/out to create verified employment records
- **No Subscriptions** - Pay only for what you use

## 🎯 Core Features

### 1. Skills-First Approach
Workers showcase real skills instead of traditional CVs. Search for "cupboard carpenter", "Domino's pizza maker", or any specific skill you need.

### 2. Employment Verification System
Companies can "sign in" workers when they start employment and "sign out" when they leave. This creates a verified, timestamped employment history that's more trustworthy than any CV.

### 3. Pay-Per-Contact Pricing
- Base Price: $5.00 per contact
- After 10 reviews: $4.50 (10% discount)
- After 50 reviews: $2.50 (50% discount - maximum)

### 4. Points & Rewards System
Companies earn 10 points for each review they leave. Points provide permanent discounts on all future contact purchases.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. **Clone and install**
   ```bash
   cd New
   npm install
   ```

2. **Set up environment**
   ```bash
   cp .env.example .env
   ```

   The `.env` file is already configured for local development.

3. **Initialize with sample data (optional)**
   ```bash
   npm run seed
   ```

   This creates sample workers and companies for testing.

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 How to Use

### As a Worker

1. **Register** at `/auth/register?type=worker`
2. **Complete Your Profile**
   - Add your bio, location, and hourly rate
   - Add your skills (carpentry, pizza making, etc.)
   - Set your availability
3. **Get Verified**
   - Ask previous employers to sign you in/out
   - Build verified employment history
4. **Get Hired**
   - Companies will find you through search
   - They'll purchase your contact info
   - You'll start receiving job opportunities

### As a Company

1. **Register** at `/auth/register?type=company`
2. **Search for Workers**
   - Filter by skills, location, availability
   - View worker profiles, ratings, and verified history
3. **Purchase Contacts**
   - Pay $5 (or less with points) to access email/phone
   - Contact workers directly
4. **Manage Workers**
   - Sign in new employees (creates verified employment record)
   - Sign out departing employees
   - Leave reviews to earn points and reduce future costs

## 🧪 Testing with Sample Data

After running `npm run seed`, you can login with these accounts:

**Workers:**
- Email: `john.carpenter@example.com` | Password: `password123`
- Email: `maria.pizza@example.com` | Password: `password123`
- Email: `bob.plumber@example.com` | Password: `password123`

**Companies:**
- Email: `hiring@pizzahut.com` | Password: `password123`
- Email: `hr@constructionco.com` | Password: `password123`

## 🏗️ Project Structure

```
├── app/
│   ├── api/                      # API routes
│   │   ├── auth/                # Authentication endpoints
│   │   ├── worker/              # Worker profile & skills
│   │   └── company/             # Search, purchase, reviews
│   ├── auth/                    # Login & registration pages
│   ├── worker/                  # Worker dashboard
│   ├── company/                 # Company dashboard & management
│   └── page.tsx                 # Landing page
├── lib/
│   ├── db.ts                    # JSON-based database
│   ├── auth.ts                  # Authentication utilities
│   ├── pricing.ts               # Pricing calculations
│   └── seed.ts                  # Sample data generator
└── components/                   # Reusable components
```

## 💡 Key Workflows

### Employment Verification Flow
1. Company signs in worker with email + job title
2. System creates verified employment record with timestamp
3. Record appears on worker's profile
4. When worker leaves, company signs them out
5. Record is marked as "PAST" with end date

### Review & Points Flow
1. Company leaves review for a worker (1-5 stars)
2. System awards 10 points to company
3. Points automatically reduce contact purchase price
4. Worker's average rating is updated
5. Company gets permanent discount on future purchases

### Contact Purchase Flow
1. Company searches for workers by skill
2. Company selects a worker
3. System calculates price based on company's points
4. Company purchases contact (email/phone)
5. Contact information is revealed
6. Worker's "contact purchases" count increases

## 🎨 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: JSON-based file storage (easily upgradeable to PostgreSQL/MySQL)
- **Authentication**: Custom auth with bcrypt
- **State Management**: React hooks + localStorage

## 🔄 Upgrading to Production Database

The current implementation uses a JSON file database for simplicity. To upgrade to a production database:

1. **Install Prisma properly** (when internet access allows full download):
   ```bash
   npm install @prisma/client prisma
   npx prisma generate
   npx prisma migrate dev
   ```

2. **Update DATABASE_URL** in `.env`:
   ```
   DATABASE_URL="postgresql://user:pass@localhost:5432/skillsync"
   ```

3. **Migrate data** from JSON to Prisma models (migration script can be provided)

The Prisma schema is already defined in `prisma/schema.prisma`.

## 🔒 Security Notes

- Passwords are hashed with bcrypt
- Authentication uses user sessions (stored in localStorage for MVP)
- **For Production**:
  - Implement proper JWT or session-based auth
  - Use HTTPS only
  - Add rate limiting
  - Validate all inputs server-side
  - Use environment variables for sensitive data

## 📊 Pricing Examples

**Scenario 1**: New company (0 points)
- Contact price: $5.00

**Scenario 2**: Company with 10 reviews (100 points)
- Contact price: $4.00 (20% discount)

**Scenario 3**: Active company with 50 reviews (500 points)
- Contact price: $2.50 (50% discount - maximum)

## 🚢 Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Import project in Vercel
3. Set environment variables
4. Deploy!

### Other Platforms
- Netlify
- Railway
- Render
- AWS Amplify
- Your own server with Node.js

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run seed` - Populate database with sample data

## 🤝 How It Works - The Big Picture

### The Problem
Traditional hiring relies on CVs that:
- Can't be verified
- Don't show real skills
- Waste time for both sides
- Cost money (job postings, recruiting fees)

### The Solution: SkillSync
1. **Workers** build verified profiles with real employment history
2. **Companies** search by exact skills they need
3. **Pay-per-contact** model means no wasted job postings
4. **Reviews create incentives** - companies that engage more pay less
5. **Everyone wins** - workers get found easier, companies hire faster

## 🌟 Future Enhancements

- Skill verification badges
- Video introductions
- Real payment integration (Stripe)
- Mobile apps
- Advanced analytics
- Company verification
- Multi-language support
- API for third-party integrations

## 📄 License

MIT License - feel free to use this for your projects!

## 💬 Support

For issues or questions, please check the code or create an issue in the repository.

---

Built with ❤️ to revolutionize hiring. No more CVs. Just real skills and real people.
