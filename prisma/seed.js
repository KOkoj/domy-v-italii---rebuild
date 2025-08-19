import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient, Role } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    const email = process.env.ADMIN_EMAIL || 'admin@example.com';
    const password = process.env.ADMIN_PASSWORD || 'admin123456';
    const name = process.env.ADMIN_NAME || 'Admin';
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
        console.log('Admin user already exists:', email);
        return;
    }
    const hash = await bcrypt.hash(password, 10);
    const admin = await prisma.user.create({
        data: {
            email,
            name,
            password: hash,
            role: Role.ADMIN,
            isActive: true,
        },
    });
    console.log('Seeded admin user:', admin.email);
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
