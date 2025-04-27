import { db } from './db';
import { users, messInfos } from '@shared/schema';
import { hashPassword } from './auth';

async function seedDatabase() {
  console.log('Seeding database...');
  
  // Check if there are any users already
  const existingUsers = await db.select().from(users);
  if (existingUsers.length === 0) {
    console.log('Creating default users...');
    
    // Create manager user
    const managerPassword = await hashPassword('password123');
    await db.insert(users).values({
      username: 'manager',
      password: managerPassword,
      fullName: 'Mess Manager',
      role: 'manager'
    });
    
    // Create customer user
    const customerPassword = await hashPassword('password123');
    await db.insert(users).values({
      username: 'customer',
      password: customerPassword,
      fullName: 'John Customer',
      role: 'customer'
    });
    
    console.log('Default users created.');
  } else {
    console.log('Users already exist, skipping user creation.');
  }
  
  // Check if there's a mess info record
  const messInfo = await db.select().from(messInfos);
  if (messInfo.length === 0) {
    console.log('Creating default mess info...');
    
    await db.insert(messInfos).values({
      name: 'Campus Mess',
      description: 'The main mess facility for the campus',
      operatingHours: {
        breakfast: { open: '7:00 AM', close: '9:30 AM' },
        lunch: { open: '12:00 PM', close: '2:30 PM' },
        dinner: { open: '7:00 PM', close: '9:30 PM' }
      },
      contactInfo: 'Email: mess@campus.edu | Phone: (123) 456-7890'
    });
    
    console.log('Default mess info created.');
  } else {
    console.log('Mess info already exists, skipping mess info creation.');
  }
  
  console.log('Database seeding complete!');
}

export { seedDatabase };