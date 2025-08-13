import { Router } from 'express'
import { authenticate } from '../middlewares/auth.js'
import { getDashboardCombined, getStats, getActivity } from '../controllers/dashboard.controller.js'

/**
 * @swagger
 * /dashboard:
 *   get:
 *     summary: Get dashboard overview with stats and activity
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         stats:
 *                           type: object
 *                           properties:
 *                             propertiesCount:
 *                               type: integer
 *                               example: 25
 *                             draftsCount:
 *                               type: integer
 *                               example: 3
 *                             inquiriesTodayCount:
 *                               type: integer
 *                               example: 5
 *                             inquiriesWeekCount:
 *                               type: integer
 *                               example: 15
 *                         activity:
 *                           type: object
 *                           properties:
 *                             properties:
 *                               type: array
 *                               items:
 *                                 type: object
 *                                 properties:
 *                                   id:
 *                                     type: string
 *                                   title:
 *                                     type: string
 *                                   slug:
 *                                     type: string
 *                                   type:
 *                                     type: string
 *                                   city:
 *                                     type: string
 *                                   status:
 *                                     type: string
 *                                   createdAt:
 *                                     type: string
 *                                     format: date-time
 *                             blog:
 *                               type: array
 *                               items:
 *                                 type: object
 *                                 properties:
 *                                   id:
 *                                     type: string
 *                                   title:
 *                                     type: string
 *                                   slug:
 *                                     type: string
 *                                   status:
 *                                     type: string
 *                                   createdAt:
 *                                     type: string
 *                                     format: date-time
 *                                   author:
 *                                     type: object
 *                                     properties:
 *                                       name:
 *                                         type: string
 *                             inquiries:
 *                               type: array
 *                               items:
 *                                 type: object
 *                                 properties:
 *                                   id:
 *                                     type: string
 *                                   name:
 *                                     type: string
 *                                   email:
 *                                     type: string
 *                                   status:
 *                                     type: string
 *                                   createdAt:
 *                                     type: string
 *                                     format: date-time
 *                                   property:
 *                                     type: object
 *                                     nullable: true
 *                                     properties:
 *                                       title:
 *                                         type: string
 *       401:
 *         description: Unauthorized - Bearer token required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */

/**
 * @swagger
 * /dashboard/stats:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         propertiesCount:
 *                           type: integer
 *                           example: 25
 *                           description: Total number of properties
 *                         draftsCount:
 *                           type: integer
 *                           example: 3
 *                           description: Number of draft blog posts
 *                         inquiriesTodayCount:
 *                           type: integer
 *                           example: 5
 *                           description: Number of inquiries received today
 *                         inquiriesWeekCount:
 *                           type: integer
 *                           example: 15
 *                           description: Number of inquiries received in the last 7 days
 *       401:
 *         description: Unauthorized - Bearer token required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */

/**
 * @swagger
 * /dashboard/activity:
 *   get:
 *     summary: Get recent activity (latest properties, blog posts, and inquiries)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recent activity retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         properties:
 *                           type: array
 *                           description: Last 5 properties created
 *                           items:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                               title:
 *                                 type: string
 *                               slug:
 *                                 type: string
 *                               type:
 *                                 type: string
 *                               city:
 *                                 type: string
 *                               status:
 *                                 type: string
 *                               createdAt:
 *                                 type: string
 *                                 format: date-time
 *                         blog:
 *                           type: array
 *                           description: Last 5 blog posts created
 *                           items:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                               title:
 *                                 type: string
 *                               slug:
 *                                 type: string
 *                               status:
 *                                 type: string
 *                               createdAt:
 *                                 type: string
 *                                 format: date-time
 *                               author:
 *                                 type: object
 *                                 properties:
 *                                   name:
 *                                     type: string
 *                         inquiries:
 *                           type: array
 *                           description: Last 5 inquiries received
 *                           items:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                               name:
 *                                 type: string
 *                               email:
 *                                 type: string
 *                               status:
 *                                 type: string
 *                               createdAt:
 *                                 type: string
 *                                 format: date-time
 *                               property:
 *                                 type: object
 *                                 nullable: true
 *                                 properties:
 *                                   title:
 *                                     type: string
 *       401:
 *         description: Unauthorized - Bearer token required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */

const router = Router()

// All dashboard routes require authentication
router.use(authenticate)

router.get('/', getDashboardCombined)
router.get('/stats', getStats)
router.get('/activity', getActivity)

export default router