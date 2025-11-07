# 929 Accountants - Professional Accounting Services Website

A modern, professional website for 929 Accountants built with Next.js, TypeScript, and Tailwind CSS. Features a Superhuman-inspired black and white design with smooth animations.

## ✨ Features

- 🎨 **Modern Design** - Sleek black and white Superhuman-inspired UI
- 📱 **Fully Responsive** - Works perfectly on all devices
- ⚡ **Fast Performance** - Built with Next.js 14 for optimal speed
- 🎯 **SEO Optimized** - Proper meta tags and semantic HTML
- 💼 **Complete Service Pages** - Detailed information about all accounting services
- 💰 **Transparent Pricing** - Clear pricing packages
- 📧 **Contact Form** - Easy way for clients to get in touch

## 📄 Pages

- **Homepage** - Hero section with key services and value propositions
- **Services** - Comprehensive overview of all accounting services offered
- **Pricing** - Transparent pricing packages for different business types
- **About** - Company information and values
- **Contact** - Contact form and business information

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
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

## 🏗️ Project Structure

```
├── app/
│   ├── about/              # About page
│   ├── contact/            # Contact page with form
│   ├── pricing/            # Pricing packages page
│   ├── services/           # Services overview page
│   ├── globals.css         # Global styles and animations
│   ├── layout.tsx          # Root layout with metadata
│   └── page.tsx            # Homepage
├── .env.example            # Environment variables template
├── package.json            # Dependencies
└── README.md              # This file
```

## 🚢 Deployment

### Free Hosting Options

#### Option 1: Vercel (Recommended - FREE)

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with your GitHub account (free)
   - Click "Import Project"
   - Select your repository
   - Click "Deploy"
   - Your site will be live at `your-project.vercel.app`

3. **Custom Domain (Optional)**
   - In Vercel dashboard, go to your project settings
   - Click "Domains"
   - Add `www.929accountants.co.uk`
   - Follow the DNS instructions to point your domain to Vercel

**Cost:** FREE (Vercel hobby plan includes custom domains)

#### Option 2: Netlify (FREE)

1. **Build the site**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Sign up (free)
   - Drag and drop the `.next` folder
   - Or connect your GitHub repository
   - Your site will be live at `your-site.netlify.app`

3. **Custom Domain**
   - In Netlify dashboard, go to Domain settings
   - Add your custom domain
   - Update your DNS records

**Cost:** FREE

#### Option 3: GitHub Pages (FREE)

1. **Export static site**
   - Add to `next.config.mjs`:
   ```javascript
   const nextConfig = {
     output: 'export',
   };
   ```

2. **Build and deploy**
   ```bash
   npm run build
   ```
   - Push the `out` folder to GitHub Pages

**Cost:** FREE

### Comparison of Free Hosting Options

| Feature | Vercel | Netlify | GitHub Pages |
|---------|--------|---------|--------------|
| Custom Domain | ✅ Free | ✅ Free | ✅ Free |
| SSL Certificate | ✅ Auto | ✅ Auto | ✅ Auto |
| Build Time | Fast | Fast | Manual |
| Ease of Use | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| Best For | Next.js | Any static site | Simple sites |

**Recommendation:** Use **Vercel** - it's made by the creators of Next.js and offers the best performance and easiest deployment.

## 💰 Cost Savings

### Current Hosting: £30-40/month
### New Hosting: £0/month (FREE!)

**Annual Savings: £360-480**

All the free platforms above include:
- Custom domain support (www.929accountants.co.uk)
- Free SSL certificates (HTTPS)
- Automatic deployments from GitHub
- Global CDN for fast loading
- No bandwidth limits (on reasonable usage)

## 🔧 Customization

### Update Contact Information

Edit the contact details in each page's footer and the contact page:
- Email: Change `info@929accountants.co.uk` to your email
- Phone: Add your phone number
- Address: Update with your office location

### Modify Services

Edit `/app/services/page.tsx` to update service offerings:
- Add or remove services
- Update descriptions
- Change pricing

### Change Colors

While the site uses a black and white theme, you can adjust the gradient in `/app/globals.css`:

```css
.gradient-text {
  background: linear-gradient(135deg, #ffffff 0%, #9ca3af 100%);
  /* Modify these colors */
}
```

### Update Pricing

Edit `/app/pricing/page.tsx` to modify:
- Package prices
- Included features
- Additional services

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: React 18

## 📧 Contact Form Setup

The contact form currently logs submissions to the console. To make it functional, you can:

1. **Use a form service (FREE options):**
   - [Formspree](https://formspree.io) - Free tier available
   - [Formspark](https://formspark.io) - Free tier available
   - [Web3Forms](https://web3forms.com) - Completely free

2. **Set up email forwarding:**
   - Use the form service webhook to forward to your email
   - No backend required

3. **Example with Web3Forms (FREE):**
   ```typescript
   // In app/contact/page.tsx, add your Web3Forms access key
   const response = await fetch('https://api.web3forms.com/submit', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       access_key: 'YOUR_ACCESS_KEY',
       ...formData
     })
   });
   ```

## 📱 Mobile Responsive

The site is fully responsive and optimized for:
- Mobile phones (320px+)
- Tablets (768px+)
- Desktops (1024px+)
- Large screens (1920px+)

## 🔒 Security

- No sensitive API keys required
- Static site = secure by default
- HTTPS included free with all hosting platforms
- No database = no data breaches

## 📈 SEO

The site includes:
- Proper meta tags
- Semantic HTML
- Fast loading times
- Mobile-friendly design
- Clean URLs

## 🆘 Support

For issues or questions:
1. Check this README
2. Review the Next.js [documentation](https://nextjs.org/docs)
3. Check the Tailwind CSS [documentation](https://tailwindcss.com/docs)

## 📝 License

This is your website - use it as you wish!

---

## Next Steps

1. ✅ Install dependencies: `npm install`
2. ✅ Test locally: `npm run dev`
3. ✅ Push to GitHub
4. ✅ Deploy to Vercel (free)
5. ✅ Connect custom domain
6. ✅ Set up contact form (Web3Forms)
7. ✅ Update contact information
8. ✅ Celebrate saving £360-480/year! 🎉

---

Built with ❤️ for 929 Accountants | Saving you money while looking professional
