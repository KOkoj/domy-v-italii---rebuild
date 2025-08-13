import { Router } from 'express';
import { authenticate } from '../middlewares/auth.js';
import { authorize } from '../middlewares/authorize.js';
import { validateBody, validateQuery, validateParams } from '../middlewares/validate.js';
import { createPropertySchema, updatePropertySchema, listPropertiesSchema } from '../validation/property.js';
import { createProperty, deleteProperty, getProperty, listProperties, updateProperty } from '../controllers/properties.controller.js';
import { z } from 'zod';

/**
 * @swagger
 * /properties:
 *   get:
 *     summary: List all properties
 *     tags: [Properties]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of properties per page
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filter properties by type (e.g., apartment, house)
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, INACTIVE]
 *         description: Filter properties by status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search properties by title, description, city, or region
 *     responses:
 *       200:
 *         description: List of properties with pagination metadata
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccess'
 */
const idParamSchema = z.object({
  id: z.string().cuid('Invalid property ID')
});

export const propertiesRouter = Router();

// Public routes
propertiesRouter.get('/', validateQuery(listPropertiesSchema), listProperties);
propertiesRouter.get('/:id', validateParams(idParamSchema), getProperty);

/**
 * @swagger
 * /properties/{id}:
 *   get:
 *     summary: Get a single property by ID
 *     tags: [Properties]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Property ID
 *     responses:
 *       200:
 *         description: Property details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccess'
 *       404:
 *         description: Property not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
// Protected routes (require authentication and authorization)
propertiesRouter.use(authenticate);

/**
 * @swagger
 * /properties:
 *   post:
 *     summary: Create a new property
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, description, priceEuro, type, address, city, region, postalCode, bedrooms, bathrooms, area]
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Beautiful Apartment in Florence"
 *               description:
 *                 type: string
 *                 example: "Spacious apartment with stunning views"
 *               priceEuro:
 *                 type: number
 *                 example: 250000.0
 *               type:
 *                 type: string
 *                 example: "apartment"
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE]
 *                 default: ACTIVE
 *               address:
 *                 type: string
 *                 example: "Via Roma 123"
 *               city:
 *                 type: string
 *                 example: "Florence"
 *               region:
 *                 type: string
 *                 example: "Tuscany"
 *               postalCode:
 *                 type: string
 *                 example: "50100"
 *               bedrooms:
 *                 type: integer
 *                 example: 3
 *               bathrooms:
 *                 type: integer
 *                 example: 2
 *               area:
 *                 type: integer
 *                 example: 120
 *               lotSize:
 *                 type: integer
 *                 nullable: true
 *                 example: 500
 *               yearBuilt:
 *                 type: integer
 *                 nullable: true
 *                 example: 2010
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["image1.jpg", "image2.jpg"]
 *               features:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["balcony", "parking", "elevator"]
 *     responses:
 *       200:
 *         description: Property created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccess'
 *       401:
 *         description: Unauthorized - Bearer token required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
propertiesRouter.post('/', authorize('ADMIN', 'MANAGER'), validateBody(createPropertySchema), createProperty);

/**
 * @swagger
 * /properties/{id}:
 *   put:
 *     summary: Update an existing property
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Property ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Updated Apartment Title"
 *               description:
 *                 type: string
 *                 example: "Updated description"
 *               priceEuro:
 *                 type: number
 *                 example: 275000.0
 *               type:
 *                 type: string
 *                 example: "apartment"
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE]
 *               address:
 *                 type: string
 *                 example: "Via Roma 123"
 *               city:
 *                 type: string
 *                 example: "Florence"
 *               region:
 *                 type: string
 *                 example: "Tuscany"
 *               postalCode:
 *                 type: string
 *                 example: "50100"
 *               bedrooms:
 *                 type: integer
 *                 example: 3
 *               bathrooms:
 *                 type: integer
 *                 example: 2
 *               area:
 *                 type: integer
 *                 example: 120
 *               lotSize:
 *                 type: integer
 *                 nullable: true
 *                 example: 500
 *               yearBuilt:
 *                 type: integer
 *                 nullable: true
 *                 example: 2010
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["image1.jpg", "image2.jpg"]
 *               features:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["balcony", "parking", "elevator"]
 *     responses:
 *       200:
 *         description: Property updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccess'
 *       401:
 *         description: Unauthorized - Bearer token required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       404:
 *         description: Property not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
propertiesRouter.put('/:id', authorize('ADMIN', 'MANAGER'), validateParams(idParamSchema), validateBody(updatePropertySchema), updateProperty);

/**
 * @swagger
 * /properties/{id}:
 *   delete:
 *     summary: Delete a property
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Property ID
 *     responses:
 *       200:
 *         description: Property deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccess'
 *       401:
 *         description: Unauthorized - Bearer token required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       404:
 *         description: Property not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
propertiesRouter.delete('/:id', authorize('ADMIN', 'MANAGER'), validateParams(idParamSchema), deleteProperty);
