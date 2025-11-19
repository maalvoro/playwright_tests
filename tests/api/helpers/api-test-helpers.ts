/**
 * API Test Helpers
 * Utilidades para realizar llamadas API y validaciones en tests
 */

import { APIRequestContext, expect } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';
import {
  User,
  Dish,
  RegisterUserRequest,
  LoginRequest,
  CreateDishRequest,
  UpdateDishRequest,
  AuthResponse,
  DishResponse,
  DishesListResponse,
  ApiErrorResponse,
  ApiTestUser,
  HttpStatusCode,
  HttpStatusCodes,
  ApiEndpoints
} from '../types/api.types';

export class ApiTestHelpers {
  private request: APIRequestContext;
  private baseURL: string;

  constructor(request: APIRequestContext, baseURL: string = 'http://localhost:3000') {
    this.request = request;
    this.baseURL = baseURL;
  }

  // ========== USER AUTHENTICATION METHODS ==========

  /**
   * Genera datos de usuario únicos para testing
   */
  generateUniqueUserData(): RegisterUserRequest {
    const uniqueId = uuidv4().substring(0, 8);
    return {
      firstName: `Test`,
      lastName: `User${uniqueId}`,
      email: `test.user.${uniqueId}@example.com`,
      nationality: 'México',
      phone: `+52155${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}`,
      password: 'Test1234!'
    };
  }

  /**
   * Registra un nuevo usuario
   */
  async registerUser(userData: RegisterUserRequest): Promise<{ response: any; user: User }> {
    const response = await this.request.post(`${this.baseURL}${ApiEndpoints.REGISTER}`, {
      data: userData
    });

    expect(response.status()).toBe(HttpStatusCodes.OK); // API returns 200, not 201
    const body = await response.json() as AuthResponse;
    expect(body.user).toBeDefined();
    expect(body.user.email).toBe(userData.email);

    return { response, user: body.user };
  }

  /**
   * Inicia sesión con credenciales
   */
  async loginUser(loginData: LoginRequest): Promise<{ response: any; user: User; sessionCookie: string }> {
    const response = await this.request.post(`${this.baseURL}${ApiEndpoints.LOGIN}`, {
      data: loginData
    });

    expect(response.status()).toBe(HttpStatusCodes.OK);
    const body = await response.json() as AuthResponse;
    
    // Extraer cookie de sesión
    const cookies = response.headers()['set-cookie'];
    const sessionCookie = this.extractSessionCookie(cookies);

    return { response, user: body.user, sessionCookie };
  }

  /**
   * Crea un usuario completo (registro + login) listo para testing
   */
  async createTestUser(): Promise<ApiTestUser> {
    const userData = this.generateUniqueUserData();
    const { user } = await this.registerUser(userData);
    
    const loginData: LoginRequest = {
      email: userData.email,
      password: userData.password
    };
    
    const { sessionCookie } = await this.loginUser(loginData);

    return {
      userData,
      loginData,
      sessionCookie,
      user
    };
  }

  /**
   * Cierra sesión de usuario
   */
  async logoutUser(sessionCookie: string): Promise<void> {
    const response = await this.request.post(`${this.baseURL}${ApiEndpoints.LOGOUT}`, {
      headers: {
        'Cookie': sessionCookie
      }
    });

    // El logout puede retornar redirect (302) o success (200)
    expect([200, 302]).toContain(response.status());
  }

  // ========== DISH MANAGEMENT METHODS ==========

  /**
   * Genera datos de platillo únicos para testing
   */
  generateUniqueDishData(): CreateDishRequest {
    const uniqueId = uuidv4().substring(0, 6);
    return {
      name: `Platillo Test ${uniqueId}`,
      description: `Descripción del platillo de prueba ${uniqueId}`,
      quickPrep: Math.random() > 0.5,
      prepTime: Math.floor(Math.random() * 30) + 5, // 5-35 minutos
      cookTime: Math.floor(Math.random() * 60) + 10, // 10-70 minutos
      imageUrl: `https://example.com/image-${uniqueId}.jpg`,
      steps: [
        `Paso 1: Preparar ingredientes para ${uniqueId}`,
        `Paso 2: Cocinar según instrucciones`,
        `Paso 3: Servir y disfrutar`
      ],
      calories: Math.floor(Math.random() * 500) + 100 // 100-600 calorías
    };
  }

  /**
   * Obtiene lista de platillos del usuario autenticado
   */
  async getDishes(sessionCookie: string): Promise<{ response: any; dishes: Dish[] }> {
    const response = await this.request.get(`${this.baseURL}${ApiEndpoints.DISHES}`, {
      headers: {
        'Cookie': sessionCookie
      }
    });

    expect(response.status()).toBe(HttpStatusCodes.OK);
    const body = await response.json() as DishesListResponse;
    expect(body.dishes).toBeDefined();
    expect(Array.isArray(body.dishes)).toBe(true);

    return { response, dishes: body.dishes };
  }

  /**
   * Crea un nuevo platillo
   */
  async createDish(dishData: CreateDishRequest, sessionCookie: string): Promise<{ response: any; dish: Dish }> {
    const response = await this.request.post(`${this.baseURL}${ApiEndpoints.DISHES}`, {
      data: dishData,
      headers: {
        'Cookie': sessionCookie
      }
    });

    expect(response.status()).toBe(HttpStatusCodes.OK);
    const body = await response.json() as DishResponse;
    expect(body.dish).toBeDefined();
    expect(body.dish.name).toBe(dishData.name);

    return { response, dish: body.dish };
  }

  /**
   * Obtiene un platillo específico por ID
   */
  async getDishById(dishId: number, sessionCookie: string): Promise<{ response: any; dish: Dish }> {
    const response = await this.request.get(`${this.baseURL}${ApiEndpoints.DISH_BY_ID(dishId)}`, {
      headers: {
        'Cookie': sessionCookie
      }
    });

    expect(response.status()).toBe(HttpStatusCodes.OK);
    const body = await response.json() as DishResponse;
    expect(body.dish).toBeDefined();
    expect(body.dish.id).toBe(dishId);

    return { response, dish: body.dish };
  }

  /**
   * Actualiza un platillo existente
   */
  async updateDish(dishId: number, updateData: UpdateDishRequest, sessionCookie: string): Promise<{ response: any; dish: Dish }> {
    const response = await this.request.put(`${this.baseURL}${ApiEndpoints.DISH_BY_ID(dishId)}`, {
      data: updateData,
      headers: {
        'Cookie': sessionCookie
      }
    });

    expect(response.status()).toBe(HttpStatusCodes.OK);
    const body = await response.json() as DishResponse;
    expect(body.dish).toBeDefined();
    expect(body.dish.id).toBe(dishId);

    return { response, dish: body.dish };
  }

  /**
   * Elimina un platillo
   */
  async deleteDish(dishId: number, sessionCookie: string): Promise<void> {
    const response = await this.request.delete(`${this.baseURL}${ApiEndpoints.DISH_BY_ID(dishId)}`, {
      headers: {
        'Cookie': sessionCookie
      }
    });

    expect(response.status()).toBe(HttpStatusCodes.OK);
    const body = await response.json();
    expect(body.success).toBe(true);
  }

  // ========== VALIDATION METHODS ==========

  /**
   * Valida que una respuesta de error tenga el formato correcto
   */
  async validateErrorResponse(response: any, expectedStatus: HttpStatusCode, expectedErrorMessage?: string): Promise<void> {
    expect(response.status()).toBe(expectedStatus);
    const body = await response.json() as ApiErrorResponse;
    expect(body.error).toBeDefined();
    expect(typeof body.error).toBe('string');
    
    if (expectedErrorMessage) {
      expect(body.error).toContain(expectedErrorMessage);
    }
  }

  /**
   * Valida estructura de un usuario
   */
  validateUserStructure(user: User): void {
    expect(user).toBeDefined();
    expect(typeof user.id).toBe('number');
    expect(typeof user.firstName).toBe('string');
    expect(typeof user.lastName).toBe('string');
    expect(typeof user.email).toBe('string');
    expect(typeof user.nationality).toBe('string');
    expect(typeof user.phone).toBe('string');
    expect(user.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/); // Email format validation
  }

  /**
   * Valida estructura de un platillo
   */
  validateDishStructure(dish: Dish): void {
    expect(dish).toBeDefined();
    expect(typeof dish.id).toBe('number');
    expect(typeof dish.name).toBe('string');
    expect(typeof dish.description).toBe('string');
    expect(typeof dish.quickPrep).toBe('boolean');
    expect(typeof dish.prepTime).toBe('number');
    expect(typeof dish.cookTime).toBe('number');
    expect(typeof dish.userId).toBe('number');
    expect(Array.isArray(dish.steps)).toBe(true);
    
    // Campos opcionales
    if (dish.imageUrl !== null) {
      expect(typeof dish.imageUrl).toBe('string');
    }
    if (dish.calories !== null) {
      expect(typeof dish.calories).toBe('number');
    }
  }

  // ========== UTILITY METHODS ==========

  /**
   * Extrae la cookie de sesión de los headers de respuesta
   */
  private extractSessionCookie(cookies: string | undefined): string {
    if (!cookies) {
      throw new Error('No session cookie found in response headers');
    }
    
    const sessionMatch = cookies.match(/session=([^;]+)/);
    if (!sessionMatch) {
      throw new Error('Session cookie not found in Set-Cookie header');
    }
    
    return `session=${sessionMatch[1]}`;
  }

  /**
   * Espera un tiempo determinado (útil para rate limiting)
   */
  async wait(milliseconds: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
  }

  /**
   * Genera datos de prueba inválidos para testing de validación
   */
  generateInvalidUserData(): Partial<RegisterUserRequest> {
    return {
      firstName: '', // Campo requerido vacío
      lastName: 'Test',
      email: 'invalid-email', // Email inválido
      nationality: '',
      phone: '123', // Teléfono muy corto
      password: '123' // Contraseña muy simple
    };
  }

  /**
   * Genera datos de platillo inválidos para testing
   */
  generateInvalidDishData(): Partial<CreateDishRequest> {
    return {
      name: '', // Campo requerido vacío
      description: '',
      prepTime: -1, // Tiempo negativo
      cookTime: 0, // Tiempo cero
      steps: 'not-an-array' as any // Tipo incorrecto
    };
  }
}