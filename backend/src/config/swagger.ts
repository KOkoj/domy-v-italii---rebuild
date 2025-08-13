import swaggerJsdoc from 'swagger-jsdoc';

export const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Italian Real Estate API',
      version: '1.0.0',
      description: 'REST API for properties, blog, inquiries, users.',
    },
    servers: [{ url: '/api' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
        },
      },
      schemas: {
        ApiSuccess: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {},
            message: { type: 'string' },
          },
        },
        ApiError: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            error: {},
          },
        },
        LoginDto: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', example: 'admin@example.com' },
            password: { type: 'string', example: 'admin123456' },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            name: { type: 'string' },
            role: { type: 'string', enum: ['ADMIN', 'MANAGER', 'EMPLOYEE'] },
            isActive: { type: 'boolean' },
            avatar: { type: 'string', nullable: true },
            createdAt: { type: 'string' },
            updatedAt: { type: 'string' }
          },
        },
        Property: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            slug: { type: 'string' },
            description: { type: 'string' },
            priceEuro: { type: 'number', example: 250000.0 },
            type: { type: 'string', example: 'apartment' },
            status: { type: 'string', enum: ['ACTIVE', 'INACTIVE'] },
            address: { type: 'string' },
            city: { type: 'string' },
            region: { type: 'string' },
            postalCode: { type: 'string' },
            bedrooms: { type: 'integer' },
            bathrooms: { type: 'integer' },
            area: { type: 'integer' },
            lotSize: { type: 'integer', nullable: true },
            yearBuilt: { type: 'integer', nullable: true },
            images: { type: 'array', items: { type: 'string' } },
            features: { type: 'array', items: { type: 'string' } },
            authorId: { type: 'string' },
            createdAt: { type: 'string' },
            updatedAt: { type: 'string' }
          },
        }
      },
    },
  },
  apis: ['./src/routes/*.ts'],
});
