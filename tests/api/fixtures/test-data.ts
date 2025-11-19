/**
 * API Test Fixtures
 * Datos de prueba predefinidos y configuraciones para testing
 */

import { RegisterUserRequest, CreateDishRequest } from '../types/api.types';

// ========== USER TEST DATA ==========

/**
 * Datos de usuario válidos para testing positivo
 */
export const validUserData: Omit<RegisterUserRequest, 'email'> = {
  firstName: 'Juan',
  lastName: 'Pérez',
  nationality: 'México',
  phone: '+521234567890',
  password: 'Test1234!'
};

/**
 * Datos de usuario inválidos para testing de validación
 */
export const invalidUserData = {
  missingFields: {
    firstName: '',
    lastName: '',
    email: '',
    nationality: '',
    phone: '',
    password: ''
  },
  invalidEmail: {
    ...validUserData,
    email: 'invalid-email-format'
  },
  shortPassword: {
    ...validUserData,
    email: 'test@example.com',
    password: '123'
  },
  invalidPhone: {
    ...validUserData,
    email: 'test@example.com',
    phone: '123'
  }
};

// ========== DISH TEST DATA ==========

/**
 * Datos de platillo válidos para testing positivo
 */
export const validDishData: CreateDishRequest = {
  name: 'Tacos de Pescado',
  description: 'Deliciosos tacos de pescado fresco con aguacate',
  quickPrep: false,
  prepTime: 20,
  cookTime: 15,
  imageUrl: 'https://example.com/tacos-pescado.jpg',
  steps: [
    'Marinar el pescado con limón y especias',
    'Calentar las tortillas',
    'Cocinar el pescado a la plancha',
    'Servir con aguacate y salsa'
  ],
  calories: 320
};

/**
 * Conjunto de platillos para testing de múltiples elementos
 */
export const multipleDishesData: CreateDishRequest[] = [
  {
    name: 'Ensalada César',
    description: 'Ensalada clásica con pollo y aderezo césar',
    quickPrep: true,
    prepTime: 10,
    cookTime: 5,
    steps: ['Lavar lechugas', 'Cocinar pollo', 'Mezclar ingredientes'],
    calories: 280
  },
  {
    name: 'Pasta Carbonara',
    description: 'Pasta italiana con huevo, queso y panceta',
    quickPrep: false,
    prepTime: 15,
    cookTime: 20,
    imageUrl: 'https://example.com/carbonara.jpg',
    steps: [
      'Hervir agua para la pasta',
      'Cocinar panceta',
      'Mezclar huevo con queso',
      'Combinar todos los ingredientes'
    ],
    calories: 520
  },
  {
    name: 'Smoothie Verde',
    description: 'Batido saludable con espinacas y frutas',
    quickPrep: true,
    prepTime: 5,
    cookTime: 0,
    steps: [
      'Lavar espinacas',
      'Pelar frutas',
      'Licuar todos los ingredientes'
    ],
    calories: 150
  }
];

/**
 * Datos de platillo inválidos para testing de validación
 */
export const invalidDishData = {
  missingRequiredFields: {
    name: '',
    description: '',
    // prepTime y cookTime faltantes
  },
  negativeValues: {
    name: 'Test Dish',
    description: 'Test Description',
    prepTime: -5,
    cookTime: -10,
    calories: -100
  },
  invalidDataTypes: {
    name: 123, // Should be string
    description: true, // Should be string
    prepTime: 'ten', // Should be number
    cookTime: 'five', // Should be number
    quickPrep: 'yes', // Should be boolean
    steps: 'not an array' // Should be array
  }
};

// ========== UPDATE TEST DATA ==========

/**
 * Datos para testing de actualizaciones de platillo
 */
export const dishUpdateData = {
  partialUpdate: {
    name: 'Nombre Actualizado',
    description: 'Descripción actualizada'
  },
  fullUpdate: {
    name: 'Platillo Completamente Actualizado',
    description: 'Nueva descripción completa',
    quickPrep: true,
    prepTime: 25,
    cookTime: 30,
    imageUrl: 'https://example.com/updated-dish.jpg',
    steps: [
      'Nuevo paso 1',
      'Nuevo paso 2',
      'Nuevo paso 3'
    ],
    calories: 400
  },
  toggleQuickPrep: {
    quickPrep: true
  }
};

// ========== API TESTING CONFIGURATION ==========

/**
 * Configuraciones para diferentes tipos de test
 */
export const testConfig = {
  timeouts: {
    short: 5000,
    medium: 10000,
    long: 30000
  },
  retries: {
    auth: 3,
    crud: 2,
    performance: 1
  },
  pagination: {
    defaultPageSize: 10,
    maxPageSize: 100
  }
};

/**
 * URLs y endpoints para testing
 */
export const testUrls = {
  baseUrl: 'http://localhost:3000',
  endpoints: {
    register: '/api/register',
    login: '/api/login',
    logout: '/api/logout',
    dishes: '/api/dishes',
    dishById: (id: number) => `/api/dishes/${id}`
  }
};

/**
 * Headers comunes para requests
 */
export const commonHeaders = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'User-Agent': 'Playwright-API-Tests/1.0'
};

// ========== PERFORMANCE TEST DATA ==========

/**
 * Datos para testing de performance y carga
 */
export const performanceTestData = {
  bulkDishCreation: {
    count: 50,
    template: {
      name: 'Dish Performance Test',
      description: 'Generated for performance testing',
      quickPrep: false,
      prepTime: 10,
      cookTime: 20,
      steps: ['Step 1', 'Step 2'],
      calories: 200
    }
  },
  concurrentUsers: {
    count: 10,
    userTemplate: {
      firstName: 'Performance',
      lastName: 'Test',
      nationality: 'Test Country',
      phone: '+1234567890',
      password: 'Test1234!'
    }
  }
};

// ========== ERROR SCENARIOS ==========

/**
 * Escenarios de error para testing negativo
 */
export const errorScenarios = {
  authentication: {
    invalidCredentials: {
      email: 'nonexistent@example.com',
      password: 'wrongpassword'
    },
    malformedRequest: {
      email: null,
      password: undefined
    }
  },
  authorization: {
    expiredSession: 'session=expired_session_token',
    invalidSession: 'session=invalid_session_format',
    malformedCookie: 'invalid_cookie_format'
  },
  validation: {
    oversizedPayload: {
      name: 'x'.repeat(1000),
      description: 'x'.repeat(5000),
      steps: Array(100).fill('Very long step description that exceeds reasonable limits')
    },
    specialCharacters: {
      name: '<script>alert("xss")</script>',
      description: '"; DROP TABLE dishes; --',
      imageUrl: 'javascript:alert("xss")'
    }
  }
};

// ========== API RESPONSE SCHEMAS ==========

/**
 * Esquemas esperados para validación de respuestas
 */
export const responseSchemas = {
  user: {
    required: ['id', 'firstName', 'lastName', 'email', 'nationality', 'phone'],
    optional: ['createdAt'],
    types: {
      id: 'number',
      firstName: 'string',
      lastName: 'string',
      email: 'string',
      nationality: 'string',
      phone: 'string',
      createdAt: 'string'
    }
  },
  dish: {
    required: ['id', 'name', 'description', 'quickPrep', 'prepTime', 'cookTime', 'userId', 'steps'],
    optional: ['imageUrl', 'calories', 'createdAt'],
    types: {
      id: 'number',
      name: 'string',
      description: 'string',
      quickPrep: 'boolean',
      prepTime: 'number',
      cookTime: 'number',
      userId: 'number',
      steps: 'array',
      imageUrl: 'string',
      calories: 'number',
      createdAt: 'string'
    }
  }
};