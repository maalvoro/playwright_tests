/**
 * API Types para Happy Testing Application
 * Estas interfaces definen la estructura de datos para todas las APIs
 */

// ========== USER TYPES ==========
export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  nationality: string;
  phone: string;
  password?: string; // May be included in some responses (hashed)
  createdAt?: string;
}

export interface RegisterUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  nationality: string;
  phone: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
}

// ========== DISH TYPES ==========
export interface Dish {
  id: number;
  name: string;
  description: string;
  quickPrep: boolean;
  prepTime: number;
  cookTime: number;
  imageUrl?: string;
  steps: string[];
  calories?: number;
  userId: number;
  createdAt?: string;
}

export interface CreateDishRequest {
  name: string;
  description: string;
  quickPrep?: boolean;
  prepTime: number;
  cookTime: number;
  imageUrl?: string;
  steps?: string[];
  calories?: number;
}

export interface UpdateDishRequest extends Partial<CreateDishRequest> {
  // Permite actualizaciones parciales
}

export interface DishesListResponse {
  dishes: Dish[];
}

export interface DishResponse {
  dish: Dish;
}

// ========== API RESPONSE TYPES ==========
export interface ApiErrorResponse {
  error: string;
}

export interface ApiSuccessResponse {
  success: boolean;
}

// ========== API TEST HELPERS TYPES ==========
export interface ApiTestContext {
  baseURL: string;
  sessionCookie?: string;
  userId?: number;
}

export interface ApiTestUser {
  userData: RegisterUserRequest;
  loginData: LoginRequest;
  sessionCookie: string;
  user: User;
}

// ========== HTTP STATUS CODES ==========
export const HttpStatusCodes = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500
} as const;

export type HttpStatusCode = typeof HttpStatusCodes[keyof typeof HttpStatusCodes];

// ========== API ENDPOINT CONSTANTS ==========
export const ApiEndpoints = {
  // Auth endpoints
  REGISTER: '/api/register',
  LOGIN: '/api/login',
  LOGOUT: '/api/logout',
  
  // Dishes endpoints
  DISHES: '/api/dishes',
  DISH_BY_ID: (id: number) => `/api/dishes/${id}`,
} as const;

// ========== TEST DATA VALIDATION HELPERS ==========
export interface ValidationRules {
  required: string[];
  optional: string[];
  types: Record<string, 'string' | 'number' | 'boolean' | 'array'>;
}

export const DishValidation: ValidationRules = {
  required: ['name', 'description', 'prepTime', 'cookTime'],
  optional: ['quickPrep', 'imageUrl', 'steps', 'calories'],
  types: {
    name: 'string',
    description: 'string',
    quickPrep: 'boolean',
    prepTime: 'number',
    cookTime: 'number',
    imageUrl: 'string',
    steps: 'array',
    calories: 'number'
  }
};

export const UserValidation: ValidationRules = {
  required: ['firstName', 'lastName', 'email', 'nationality', 'phone', 'password'],
  optional: [],
  types: {
    firstName: 'string',
    lastName: 'string',
    email: 'string',
    nationality: 'string',
    phone: 'string',
    password: 'string'
  }
};