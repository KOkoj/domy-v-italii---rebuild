import type { Response } from 'express';
import { prisma } from '../db/prisma.js';
import { ok } from '../utils/response.js';
import { parsePagination, withPaginationMeta } from '../utils/pagination.js';
import { uniqueSlug } from '../utils/slug.js';
import { centsToEuros, eurosToCents } from '../utils/currency.js';
import type { AuthRequest } from '../middlewares/auth.js';

function mapProperty(p: any) {
  const { priceCents, ...rest } = p;
  return { ...rest, priceEuro: centsToEuros(priceCents) };
}

export async function listProperties(req: AuthRequest, res: Response) {
  const { page, limit, skip } = parsePagination(req.query);
  const { type, status, search } = req.query as any;

  const where: any = {};
  if (type) where.type = String(type);
  if (status) where.status = String(status);
  if (search) {
    where.OR = [
      { title: { contains: String(search), mode: 'insensitive' } },
      { description: { contains: String(search), mode: 'insensitive' } },
      { city: { contains: String(search), mode: 'insensitive' } },
      { region: { contains: String(search), mode: 'insensitive' } },
    ];
  }

  const [total, itemsRaw] = await Promise.all([
    prisma.property.count({ where }),
    prisma.property.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
  ]);
  const items = itemsRaw.map(mapProperty);
  return ok(res, withPaginationMeta(items, total, page, limit));
}

export async function getProperty(req: AuthRequest, res: Response) {
  const { id } = req.params as { id: string };
  const p = await prisma.property.findUnique({ where: { id } });
  if (!p) {
    const err: any = new Error('Property not found');
    err.status = 404;
    throw err;
  }
  return ok(res, mapProperty(p));
}

export async function createProperty(req: AuthRequest, res: Response) {
  const body = req.body as any;
  const slug = await uniqueSlug(body.title, 'property');
  const data = {
    title: body.title,
    slug,
    description: body.description,
    priceCents: eurosToCents(Number(body.priceEuro)),
    type: body.type,
    status: body.status || 'ACTIVE',
    address: body.address,
    city: body.city,
    region: body.region,
    postalCode: body.postalCode,
    bedrooms: Number(body.bedrooms || 0),
    bathrooms: Number(body.bathrooms || 0),
    area: Number(body.area || 0),
    lotSize: body.lotSize ? Number(body.lotSize) : null,
    yearBuilt: body.yearBuilt ? Number(body.yearBuilt) : null,
    images: Array.isArray(body.images) ? body.images : [],
    features: Array.isArray(body.features) ? body.features : [],
    authorId: req.user!.id,
  };
  const p = await prisma.property.create({ data });
  return ok(res, mapProperty(p), 'Property created');
}

export async function updateProperty(req: AuthRequest, res: Response) {
  const { id } = req.params as { id: string };
  const body = req.body as any;
  const data: any = { ...body };
  if (typeof body.priceEuro !== 'undefined') data.priceCents = eurosToCents(Number(body.priceEuro));
  delete data.priceEuro;
  delete data.slug;
  const p = await prisma.property.update({ where: { id }, data });
  return ok(res, mapProperty(p), 'Property updated');
}

export async function deleteProperty(req: AuthRequest, res: Response) {
  const { id } = req.params as { id: string };
  await prisma.property.delete({ where: { id } });
  return ok(res, { id }, 'Property deleted');
}
