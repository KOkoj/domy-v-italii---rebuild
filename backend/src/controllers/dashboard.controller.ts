import type { Request, Response, NextFunction } from 'express'
import { startOfDay, endOfDay, subDays } from 'date-fns'
import { prisma } from '../db/prisma.js'
import { ok } from '../utils/response.js'

export async function getStats(req: Request, res: Response, next: NextFunction) {
  try {
    const now = new Date()

    // Get today's start and end (using local time)
    const startOfToday = startOfDay(now)
    const endOfToday = endOfDay(now)
    const weekAgo = subDays(now, 7)

    const [propertiesCount, draftsCount, inquiriesTodayCount, inquiriesWeekCount] = await Promise.all([
      prisma.property.count(),
      prisma.blogPost.count({ where: { status: 'DRAFT' } }),
      prisma.inquiry.count({
        where: {
          createdAt: {
            gte: startOfToday,
            lte: endOfToday
          }
        }
      }),
      prisma.inquiry.count({
        where: {
          createdAt: {
            gte: weekAgo
          }
        }
      }),
    ])

    return ok(res, {
      propertiesCount,
      draftsCount,
      inquiriesTodayCount,
      inquiriesWeekCount,
    })
  } catch (error) {
    next(error)
  }
}

export async function getActivity(req: Request, res: Response, next: NextFunction) {
  try {
    const [properties, blog, inquiries] = await Promise.all([
      prisma.property.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          title: true,
          slug: true,
          type: true,
          city: true,
          status: true,
          createdAt: true,
        },
      }),
      prisma.blogPost.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          title: true,
          slug: true,
          status: true,
          createdAt: true,
          author: {
            select: {
              name: true,
            },
          },
        },
      }),
      prisma.inquiry.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          name: true,
          email: true,
          status: true,
          createdAt: true,
          property: {
            select: {
              title: true,
            },
          },
        },
      }),
    ])

    return ok(res, {
      properties,
      blog,
      inquiries,
    })
  } catch (error) {
    next(error)
  }
}

export async function getDashboardCombined(req: Request, res: Response, next: NextFunction) {
  try {
    const now = new Date()

    // Get today's start and end (using local time)
    const startOfToday = startOfDay(now)
    const endOfToday = endOfDay(now)
    const weekAgo = subDays(now, 7)

    // Get stats
    const [propertiesCount, draftsCount, inquiriesTodayCount, inquiriesWeekCount] = await Promise.all([
      prisma.property.count(),
      prisma.blogPost.count({ where: { status: 'DRAFT' } }),
      prisma.inquiry.count({
        where: {
          createdAt: {
            gte: startOfToday,
            lte: endOfToday
          }
        }
      }),
      prisma.inquiry.count({
        where: {
          createdAt: {
            gte: weekAgo
          }
        }
      }),
    ])

    // Get activity
    const [properties, blog, inquiries] = await Promise.all([
      prisma.property.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          title: true,
          slug: true,
          type: true,
          city: true,
          status: true,
          createdAt: true,
        },
      }),
      prisma.blogPost.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          title: true,
          slug: true,
          status: true,
          createdAt: true,
          author: {
            select: {
              name: true,
            },
          },
        },
      }),
      prisma.inquiry.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          name: true,
          email: true,
          status: true,
          createdAt: true,
          property: {
            select: {
              title: true,
            },
          },
        },
      }),
    ])

    const stats = {
      propertiesCount,
      draftsCount,
      inquiriesTodayCount,
      inquiriesWeekCount,
    }

    const activity = {
      properties,
      blog,
      inquiries,
    }

    return ok(res, {
      stats,
      activity,
    })
  } catch (error) {
    next(error)
  }
}