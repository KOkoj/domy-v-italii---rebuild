import slugify from 'slugify';
import { prisma } from '../db/prisma.js';

export async function uniqueSlug(base: string, table: 'property' | 'blogPost'): Promise<string> {
  const baseSlug = slugify(base, { lower: true, strict: true, trim: true });
  let slug = baseSlug;
  let i = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const exists =
      table === 'property'
        ? await prisma.property.findUnique({ where: { slug } })
        : await prisma.blogPost.findUnique({ where: { slug } });
    if (!exists) return slug;
    slug = `${baseSlug}-${i++}`;
  }
}
