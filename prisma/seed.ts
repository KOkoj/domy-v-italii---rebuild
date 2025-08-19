import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient, Role } from '@prisma/client';
import { eurosToCents } from '../src/utils/currency.js';

const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

async function main() {
  console.log('🌱 Starting comprehensive seed...');

  // Create Admin User (upsert to avoid duplicates)
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123456';
  const adminName = process.env.ADMIN_NAME || 'Admin';

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: adminName,
      password: await hashPassword(adminPassword),
      role: Role.ADMIN,
      isActive: true,
    },
  });
  console.log('✅ Admin user created/found:', admin.email);

  // Create Manager User
  const manager = await prisma.user.upsert({
    where: { email: 'manager@example.com' },
    update: {},
    create: {
      email: 'manager@example.com',
      name: 'Maria Rossi',
      password: await hashPassword('manager123'),
      role: Role.MANAGER,
      isActive: true,
    },
  });

  // Create Employee Users
  const employee1 = await prisma.user.upsert({
    where: { email: 'giovanni@example.com' },
    update: {},
    create: {
      email: 'giovanni@example.com',
      name: 'Giovanni Bianchi',
      password: await hashPassword('employee123'),
      role: Role.EMPLOYEE,
      isActive: true,
    },
  });

  const employee2 = await prisma.user.upsert({
    where: { email: 'lucia@example.com' },
    update: {},
    create: {
      email: 'lucia@example.com',
      name: 'Lucia Verdi',
      password: await hashPassword('employee123'),
      role: Role.EMPLOYEE,
      isActive: true,
    },
  });
  console.log('✅ Manager and employee users created');

  // Create Properties
  const properties = [
    {
      title: 'Luxury Villa in Tuscany',
      slug: 'luxury-villa-tuscany',
      description: 'Beautiful 4-bedroom villa with panoramic views of the Tuscan countryside. Features include a swimming pool, wine cellar, and olive grove.',
      priceCents: eurosToCents(750000),
      type: 'villa',
      status: 'ACTIVE' as const,
      address: 'Via del Chianti 123',
      city: 'Greve in Chianti',
      region: 'Tuscany',
      postalCode: '50022',
      bedrooms: 4,
      bathrooms: 3,
      area: 350,
      lotSize: 5000,
      yearBuilt: 1995,
      images: ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6'],
      features: ['swimming_pool', 'wine_cellar', 'garden', 'parking', 'fireplace'],
      authorId: admin.id,
    },
    {
      title: 'Modern Apartment in Florence',
      slug: 'modern-apartment-florence',
      description: 'Stylish 2-bedroom apartment in the historic center of Florence, walking distance to the Duomo and major attractions.',
      priceCents: eurosToCents(320000),
      type: 'apartment',
      status: 'ACTIVE' as const,
      address: 'Via Roma 45',
      city: 'Florence',
      region: 'Tuscany',
      postalCode: '50123',
      bedrooms: 2,
      bathrooms: 2,
      area: 95,
      lotSize: null,
      yearBuilt: 2010,
      images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688'],
      features: ['air_conditioning', 'elevator', 'balcony'],
      authorId: manager.id,
    },
    {
      title: 'Coastal House in Cinque Terre',
      slug: 'coastal-house-cinque-terre',
      description: 'Charming traditional house with sea views in the picturesque village of Monterosso al Mare.',
      priceCents: eurosToCents(580000),
      type: 'house',
      status: 'ACTIVE' as const,
      address: 'Via Fegina 12',
      city: 'Monterosso al Mare',
      region: 'Liguria',
      postalCode: '19016',
      bedrooms: 3,
      bathrooms: 2,
      area: 140,
      lotSize: null,
      yearBuilt: 1920,
      images: ['https://images.unsplash.com/photo-1449824913935-59a10b8d2000'],
      features: ['sea_view', 'terrace', 'traditional_architecture'],
      authorId: admin.id,
    },
    {
      title: 'Country Farmhouse in Umbria',
      slug: 'country-farmhouse-umbria',
      description: 'Restored 18th-century farmhouse surrounded by rolling hills and vineyards. Perfect for agritourism business.',
      priceCents: eurosToCents(420000),
      type: 'farmhouse',
      status: 'ACTIVE' as const,
      address: 'Strada Provinciale 147',
      city: 'Assisi',
      region: 'Umbria',
      postalCode: '06081',
      bedrooms: 5,
      bathrooms: 4,
      area: 280,
      lotSize: 8000,
      yearBuilt: 1780,
      images: ['https://images.unsplash.com/photo-1568605114967-8130f3a36994'],
      features: ['restored', 'vineyard', 'stone_construction', 'parking', 'garden'],
      authorId: manager.id,
    },
    {
      title: 'Penthouse in Milan',
      slug: 'penthouse-milan',
      description: 'Exclusive penthouse with rooftop terrace in the business district of Milan. Modern design with premium finishes.',
      priceCents: eurosToCents(1200000),
      type: 'penthouse',
      status: 'INACTIVE' as const,
      address: 'Corso Buenos Aires 78',
      city: 'Milan',
      region: 'Lombardy',
      postalCode: '20124',
      bedrooms: 3,
      bathrooms: 3,
      area: 180,
      lotSize: null,
      yearBuilt: 2018,
      images: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00'],
      features: ['rooftop_terrace', 'premium_finishes', 'elevator', 'parking', 'air_conditioning'],
      authorId: admin.id,
    },
  ];

  for (const propertyData of properties) {
    await prisma.property.upsert({
      where: { slug: propertyData.slug },
      update: propertyData,
      create: propertyData,
    });
  }
  console.log('✅ Properties seeded');

  // Create Blog Posts
  const publishedPost = await prisma.blogPost.upsert({
    where: { slug: 'buying-property-italy-guide' },
    update: {},
    create: {
      title: 'Complete Guide to Buying Property in Italy as a Foreigner',
      slug: 'buying-property-italy-guide',
      content: `# Complete Guide to Buying Property in Italy

Italy offers some of the most beautiful real estate in the world. Here's everything you need to know about purchasing property in Italy as a non-resident.

## Legal Requirements
Foreigners can buy property in Italy with minimal restrictions. EU citizens have the same rights as Italian citizens.

## The Buying Process
1. Find a Property
2. Make an Offer
3. Sign Preliminary Contract
4. Final Contract at Notary
5. Registration

## Popular Regions
- **Tuscany**: Rolling hills and vineyards
- **Liguria**: Coastal beauty
- **Umbria**: Medieval villages
- **Amalfi Coast**: Stunning coastal properties

Contact us for expert guidance on your Italian property journey.`,
      coverImage: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9',
      status: 'PUBLISHED',
      authorId: admin.id,
    },
  });

  const draftPost = await prisma.blogPost.upsert({
    where: { slug: 'investment-opportunities-2024' },
    update: {},
    create: {
      title: 'Top Investment Opportunities in Italian Real Estate 2024',
      slug: 'investment-opportunities-2024',
      content: `# Investment Opportunities 2024

The Italian real estate market continues to evolve. Here are the top opportunities:

1. Vacation Rentals in Secondary Cities
2. Restoration Projects in Historic Centers
3. Agritourism Properties
4. Student Housing
5. Luxury Properties in Emerging Markets

*This article is being prepared for publication.*`,
      coverImage: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000',
      status: 'DRAFT',
      authorId: manager.id,
    },
  });
  console.log('✅ Blog posts seeded');

  // Create Inquiries
  const villa = await prisma.property.findFirst({ where: { slug: 'luxury-villa-tuscany' } });
  const apartment = await prisma.property.findFirst({ where: { slug: 'modern-apartment-florence' } });

  await prisma.inquiry.create({
    data: {
      name: 'James Wilson',
      email: 'james.wilson@email.com',
      phone: '+44 20 7946 0958',
      message: 'I am interested in the luxury villa in Tuscany. Could you please provide more information and schedule a viewing?',
      status: 'NEW',
      propertyId: villa?.id,
    },
  });

  await prisma.inquiry.create({
    data: {
      name: 'Sophie Mueller',
      email: 'sophie.mueller@email.com',
      phone: '+49 30 12345678',
      message: 'Hello, I am looking for a property in Florence for investment purposes. What is the rental yield potential?',
      status: 'IN_PROGRESS',
      propertyId: apartment?.id,
    },
  });

  await prisma.inquiry.create({
    data: {
      name: 'Marco Santini',
      email: 'marco.santini@email.it',
      message: 'I would like general information about properties in the €400,000-600,000 range.',
      status: 'CLOSED',
      propertyId: null,
    },
  });
  console.log('✅ Inquiries seeded');

  // Create Settings
  await prisma.setting.upsert({
    where: { key: 'site_name' },
    update: { value: 'Italian Real Estate Portal' },
    create: { key: 'site_name', value: 'Italian Real Estate Portal' },
  });

  await prisma.setting.upsert({
    where: { key: 'contact_email' },
    update: { value: 'info@italianrealestate.com' },
    create: { key: 'contact_email', value: 'info@italianrealestate.com' },
  });
  console.log('✅ Settings seeded');

  console.log('🎉 Comprehensive seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
