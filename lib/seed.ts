// Seed script to populate the database with sample data
import { db, generateId } from './db';
import { hashPassword } from './auth';

export async function seedDatabase() {
  console.log('Seeding database...');

  // Create sample skills
  const carpentrySkill = db.createSkill({
    name: 'Carpentry',
    category: 'Construction',
    description: 'Building and repairing wooden structures',
  });

  const pizzaMakingSkill = db.createSkill({
    name: 'Pizza Making',
    category: 'Food Service',
    description: 'Preparing and cooking pizzas',
  });

  const plumbingSkill = db.createSkill({
    name: 'Plumbing',
    category: 'Construction',
    description: 'Installing and repairing water systems',
  });

  const customerServiceSkill = db.createSkill({
    name: 'Customer Service',
    category: 'Retail',
    description: 'Assisting customers and handling inquiries',
  });

  // Create sample workers
  const worker1Password = await hashPassword('password123');
  const worker1User = db.createUser({
    email: 'john.carpenter@example.com',
    password: worker1Password,
    name: 'John Smith',
    userType: 'WORKER',
    phone: '+1 555-0101',
  });

  const worker1Profile = db.createWorkerProfile({
    userId: worker1User.id,
    bio: 'Experienced carpenter with 10 years in custom furniture and home construction.',
    location: 'New York, USA',
    hourlyRate: 45,
    available: true,
    profileViews: 0,
    contactPurchases: 0,
    averageRating: 0,
  });

  db.addWorkerSkill({
    workerId: worker1Profile.id,
    skillId: carpentrySkill.id,
    yearsExperience: 10,
    verified: false,
  });

  const worker2Password = await hashPassword('password123');
  const worker2User = db.createUser({
    email: 'maria.pizza@example.com',
    password: worker2Password,
    name: 'Maria Garcia',
    userType: 'WORKER',
    phone: '+1 555-0102',
  });

  const worker2Profile = db.createWorkerProfile({
    userId: worker2User.id,
    bio: 'Pizza chef with experience at Dominos and local pizzerias. Fast, efficient, and passionate about great pizza.',
    location: 'Chicago, USA',
    hourlyRate: 22,
    available: true,
    profileViews: 0,
    contactPurchases: 0,
    averageRating: 0,
  });

  db.addWorkerSkill({
    workerId: worker2Profile.id,
    skillId: pizzaMakingSkill.id,
    yearsExperience: 5,
    verified: false,
  });

  db.addWorkerSkill({
    workerId: worker2Profile.id,
    skillId: customerServiceSkill.id,
    yearsExperience: 5,
    verified: false,
  });

  const worker3Password = await hashPassword('password123');
  const worker3User = db.createUser({
    email: 'bob.plumber@example.com',
    password: worker3Password,
    name: 'Bob Johnson',
    userType: 'WORKER',
    phone: '+1 555-0103',
  });

  const worker3Profile = db.createWorkerProfile({
    userId: worker3User.id,
    bio: 'Licensed plumber specializing in residential and commercial installations.',
    location: 'Los Angeles, USA',
    hourlyRate: 55,
    available: false,
    profileViews: 0,
    contactPurchases: 0,
    averageRating: 0,
  });

  db.addWorkerSkill({
    workerId: worker3Profile.id,
    skillId: plumbingSkill.id,
    yearsExperience: 8,
    verified: false,
  });

  // Create sample companies
  const company1Password = await hashPassword('password123');
  const company1User = db.createUser({
    email: 'hiring@pizzahut.com',
    password: company1Password,
    name: 'Sarah Manager',
    userType: 'COMPANY',
  });

  const company1Profile = db.createCompanyProfile({
    userId: company1User.id,
    companyName: 'Pizza Hut',
    industry: 'Food Service',
    description: 'Leading pizza restaurant chain',
    points: 0,
    totalReviews: 0,
  });

  const company2Password = await hashPassword('password123');
  const company2User = db.createUser({
    email: 'hr@constructionco.com',
    password: company2Password,
    name: 'Mike HR',
    userType: 'COMPANY',
  });

  const company2Profile = db.createCompanyProfile({
    userId: company2User.id,
    companyName: 'ABC Construction Co',
    industry: 'Construction',
    description: 'General contracting and construction services',
    points: 0,
    totalReviews: 0,
  });

  console.log('✓ Created sample users and profiles');
  console.log('\nSample Accounts:');
  console.log('\nWorkers:');
  console.log('- Email: john.carpenter@example.com | Password: password123');
  console.log('- Email: maria.pizza@example.com | Password: password123');
  console.log('- Email: bob.plumber@example.com | Password: password123');
  console.log('\nCompanies:');
  console.log('- Email: hiring@pizzahut.com | Password: password123');
  console.log('- Email: hr@constructionco.com | Password: password123');
  console.log('\nDatabase seeded successfully!');
}

// Run if called directly
if (require.main === module) {
  seedDatabase().catch(console.error);
}
