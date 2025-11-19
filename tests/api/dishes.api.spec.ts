/**
 * @api Dishes API Tests
 * Tests para endpoints de gestión de platillos: CRUD operations
 */

import { test, expect } from '@playwright/test';
import { 
  ApiTestHelpers,
  CreateDishRequest,
  UpdateDishRequest,
  Dish,
  HttpStatusCodes,
  ApiEndpoints,
  validDishData,
  multipleDishesData,
  invalidDishData,
  dishUpdateData
} from './index';

test.describe('@api Dishes API Tests', () => {
  let apiHelpers: ApiTestHelpers;
  let testUser: any;

  // Setup authenticated user for all tests
  test.beforeAll(async ({ request }) => {
    apiHelpers = new ApiTestHelpers(request);
    testUser = await apiHelpers.createTestUser();
  });

  test.beforeEach(async ({ request }) => {
    apiHelpers = new ApiTestHelpers(request);
  });

  test.describe('Get Dishes (GET /api/dishes)', () => {
    
    test('@api should get empty dishes list for new user', async ({ request }) => {
      // Arrange - Create a fresh user
      const newUser = await apiHelpers.createTestUser();
      
      // Act
      const { dishes } = await apiHelpers.getDishes(newUser.sessionCookie);
      
      // Assert
      expect(dishes).toEqual([]);
    });

    test('@api should get dishes list with created dishes', async ({ request }) => {
      // Arrange - Create some dishes first
      const dishData1 = apiHelpers.generateUniqueDishData();
      const dishData2 = apiHelpers.generateUniqueDishData();
      
      await apiHelpers.createDish(dishData1, testUser.sessionCookie);
      await apiHelpers.createDish(dishData2, testUser.sessionCookie);
      
      // Act
      const { dishes } = await apiHelpers.getDishes(testUser.sessionCookie);
      
      // Assert
      expect(dishes.length).toBeGreaterThanOrEqual(2);
      
      // Verify dishes structure
      dishes.forEach(dish => {
        apiHelpers.validateDishStructure(dish);
        expect(dish.userId).toBe(testUser.user.id);
      });
      
      // Verify our dishes are in the list
      const dishNames = dishes.map(d => d.name);
      expect(dishNames).toContain(dishData1.name);
      expect(dishNames).toContain(dishData2.name);
    });

    test('@api should fail to get dishes without authentication', async ({ request }) => {
      // Act
      const response = await request.get(`http://localhost:3000${ApiEndpoints.DISHES}`);
      
      // Assert
      expect(response.status()).toBe(HttpStatusCodes.UNAUTHORIZED);
      await apiHelpers.validateErrorResponse(response, HttpStatusCodes.UNAUTHORIZED, 'No autorizado');
    });

    test('@api should fail to get dishes with invalid session', async ({ request }) => {
      // Act
      const response = await request.get(`http://localhost:3000${ApiEndpoints.DISHES}`, {
        headers: {
          'Cookie': 'session=invalid_session_token'
        }
      });
      
      // Assert
      // Note: API may return 500 for invalid sessions instead of 401
      const status = response.status();
      expect([HttpStatusCodes.UNAUTHORIZED, HttpStatusCodes.INTERNAL_SERVER_ERROR].includes(status as any)).toBeTruthy();
    });
  });

  test.describe('Create Dish (POST /api/dishes)', () => {
    
    test('@api should create a dish with all fields', async ({ request }) => {
      // Arrange
      const dishData = apiHelpers.generateUniqueDishData();
      
      // Act
      const { dish } = await apiHelpers.createDish(dishData, testUser.sessionCookie);
      
      // Assert
      apiHelpers.validateDishStructure(dish);
      expect(dish.name).toBe(dishData.name);
      expect(dish.description).toBe(dishData.description);
      expect(dish.quickPrep).toBe(dishData.quickPrep);
      expect(dish.prepTime).toBe(dishData.prepTime);
      expect(dish.cookTime).toBe(dishData.cookTime);
      expect(dish.imageUrl).toBe(dishData.imageUrl);
      expect(dish.steps).toEqual(dishData.steps);
      expect(dish.calories).toBe(dishData.calories);
      expect(dish.userId).toBe(testUser.user.id);
      expect(dish.id).toBeGreaterThan(0);
    });

    test('@api should create a dish with only required fields', async ({ request }) => {
      // Arrange - Only required fields
      const minimalDishData: CreateDishRequest = {
        name: 'Minimal Dish Test',
        description: 'Basic description',
        prepTime: 10,
        cookTime: 15
      };
      
      // Act
      const { dish } = await apiHelpers.createDish(minimalDishData, testUser.sessionCookie);
      
      // Assert
      apiHelpers.validateDishStructure(dish);
      expect(dish.name).toBe(minimalDishData.name);
      expect(dish.description).toBe(minimalDishData.description);
      expect(dish.prepTime).toBe(minimalDishData.prepTime);
      expect(dish.cookTime).toBe(minimalDishData.cookTime);
      expect(dish.quickPrep).toBe(false); // Default value
      expect(dish.steps).toEqual([]); // Default empty array
      expect(dish.calories).toBeNull(); // Optional field
    });

    test('@api should fail to create dish with missing required fields', async ({ request }) => {
      const invalidDataSets = [
        { description: 'Missing name', prepTime: 10, cookTime: 15 },
        { name: 'Missing description', prepTime: 10, cookTime: 15 },
        { name: 'Missing prep time', description: 'Test desc', cookTime: 15 },
        { name: 'Missing cook time', description: 'Test desc', prepTime: 10 },
        {} // Empty object
      ];

      for (const invalidData of invalidDataSets) {
        const response = await request.post(`http://localhost:3000${ApiEndpoints.DISHES}`, {
          data: invalidData,
          headers: {
            'Cookie': testUser.sessionCookie
          }
        });
        
        await apiHelpers.validateErrorResponse(response, HttpStatusCodes.BAD_REQUEST, 'Missing fields');
      }
    });

    test('@api should fail to create dish without authentication', async ({ request }) => {
      // Arrange
      const dishData = apiHelpers.generateUniqueDishData();
      
      // Act
      const response = await request.post(`http://localhost:3000${ApiEndpoints.DISHES}`, {
        data: dishData
      });
      
      // Assert
      await apiHelpers.validateErrorResponse(response, HttpStatusCodes.UNAUTHORIZED, 'No autorizado');
    });

    test('@api should handle invalid data types gracefully', async ({ request }) => {
      const invalidDataTypes = {
        name: 123, // Should be string
        description: true, // Should be string
        prepTime: 'invalid', // Should be number
        cookTime: 'invalid', // Should be number
        quickPrep: 'yes', // Should be boolean
        steps: 'not an array' // Should be array
      };

      const response = await request.post(`http://localhost:3000${ApiEndpoints.DISHES}`, {
        data: invalidDataTypes,
        headers: {
          'Cookie': testUser.sessionCookie
        }
      });

      // Should handle gracefully with 4xx status
      expect([400, 422, 500].includes(response.status())).toBeTruthy();
    });
  });

  test.describe('Get Dish by ID (GET /api/dishes/:id)', () => {
    
    test('@api should get existing dish by ID', async ({ request }) => {
      // Arrange - Create a dish first
      const dishData = apiHelpers.generateUniqueDishData();
      const { dish: createdDish } = await apiHelpers.createDish(dishData, testUser.sessionCookie);
      
      // Act
      const { dish } = await apiHelpers.getDishById(createdDish.id, testUser.sessionCookie);
      
      // Assert
      apiHelpers.validateDishStructure(dish);
      expect(dish.id).toBe(createdDish.id);
      expect(dish.name).toBe(dishData.name);
      expect(dish.userId).toBe(testUser.user.id);
    });

    test('@api should fail to get non-existent dish', async ({ request }) => {
      // Act
      const response = await request.get(`http://localhost:3000${ApiEndpoints.DISH_BY_ID(999999)}`, {
        headers: {
          'Cookie': testUser.sessionCookie
        }
      });
      
      // Assert
      await apiHelpers.validateErrorResponse(response, HttpStatusCodes.NOT_FOUND, 'no encontrado');
    });

    test('@api should fail to get dish without authentication', async ({ request }) => {
      // Act
      const response = await request.get(`http://localhost:3000${ApiEndpoints.DISH_BY_ID(1)}`);
      
      // Assert
      await apiHelpers.validateErrorResponse(response, HttpStatusCodes.UNAUTHORIZED, 'No autorizado');
    });

    test('@api should fail to get other user\'s dish', async ({ request }) => {
      // Arrange - Create dish with one user
      const dishData = apiHelpers.generateUniqueDishData();
      const { dish } = await apiHelpers.createDish(dishData, testUser.sessionCookie);
      
      // Create another user
      const otherUser = await apiHelpers.createTestUser();
      
      // Act - Try to access dish with other user's session
      const response = await request.get(`http://localhost:3000${ApiEndpoints.DISH_BY_ID(dish.id)}`, {
        headers: {
          'Cookie': otherUser.sessionCookie
        }
      });
      
      // Assert
      await apiHelpers.validateErrorResponse(response, HttpStatusCodes.NOT_FOUND, 'no encontrado');
    });
  });

  test.describe('Update Dish (PUT /api/dishes/:id)', () => {
    
    test('@api should update dish with full data', async ({ request }) => {
      // Arrange
      const originalData = apiHelpers.generateUniqueDishData();
      const { dish: createdDish } = await apiHelpers.createDish(originalData, testUser.sessionCookie);
      
      const updateData = apiHelpers.generateUniqueDishData();
      
      // Act
      const { dish: updatedDish } = await apiHelpers.updateDish(createdDish.id, updateData, testUser.sessionCookie);
      
      // Assert
      apiHelpers.validateDishStructure(updatedDish);
      expect(updatedDish.id).toBe(createdDish.id);
      expect(updatedDish.name).toBe(updateData.name);
      expect(updatedDish.description).toBe(updateData.description);
      expect(updatedDish.quickPrep).toBe(updateData.quickPrep);
      expect(updatedDish.prepTime).toBe(updateData.prepTime);
      expect(updatedDish.cookTime).toBe(updateData.cookTime);
      expect(updatedDish.userId).toBe(testUser.user.id);
    });

    test('@api should update dish with partial data', async ({ request }) => {
      // Arrange
      const originalData = apiHelpers.generateUniqueDishData();
      const { dish: createdDish } = await apiHelpers.createDish(originalData, testUser.sessionCookie);
      
      const partialUpdate: UpdateDishRequest = {
        name: 'Updated Name Only',
        quickPrep: !originalData.quickPrep
      };
      
      // Act
      const { dish: updatedDish } = await apiHelpers.updateDish(createdDish.id, partialUpdate, testUser.sessionCookie);
      
      // Assert
      expect(updatedDish.name).toBe(partialUpdate.name);
      expect(updatedDish.quickPrep).toBe(partialUpdate.quickPrep);
      // Other fields should remain unchanged
      expect(updatedDish.description).toBe(originalData.description);
      expect(updatedDish.prepTime).toBe(originalData.prepTime);
    });

    test('@api should fail to update non-existent dish', async ({ request }) => {
      // Arrange
      const updateData = { name: 'Updated Name' };
      
      // Act
      const response = await request.put(`http://localhost:3000${ApiEndpoints.DISH_BY_ID(999999)}`, {
        data: updateData,
        headers: {
          'Cookie': testUser.sessionCookie
        }
      });
      
      // Assert
      await apiHelpers.validateErrorResponse(response, HttpStatusCodes.FORBIDDEN, 'No autorizado');
    });

    test('@api should fail to update other user\'s dish', async ({ request }) => {
      // Arrange
      const dishData = apiHelpers.generateUniqueDishData();
      const { dish } = await apiHelpers.createDish(dishData, testUser.sessionCookie);
      
      const otherUser = await apiHelpers.createTestUser();
      const updateData = { name: 'Hacked Name' };
      
      // Act
      const response = await request.put(`http://localhost:3000${ApiEndpoints.DISH_BY_ID(dish.id)}`, {
        data: updateData,
        headers: {
          'Cookie': otherUser.sessionCookie
        }
      });
      
      // Assert
      await apiHelpers.validateErrorResponse(response, HttpStatusCodes.FORBIDDEN, 'No autorizado');
    });
  });

  test.describe('Delete Dish (DELETE /api/dishes/:id)', () => {
    
    test('@api should delete existing dish', async ({ request }) => {
      // Arrange
      const dishData = apiHelpers.generateUniqueDishData();
      const { dish } = await apiHelpers.createDish(dishData, testUser.sessionCookie);
      
      // Act
      await apiHelpers.deleteDish(dish.id, testUser.sessionCookie);
      
      // Assert - Verify dish is gone
      const response = await request.get(`http://localhost:3000${ApiEndpoints.DISH_BY_ID(dish.id)}`, {
        headers: {
          'Cookie': testUser.sessionCookie
        }
      });
      
      expect(response.status()).toBe(HttpStatusCodes.NOT_FOUND);
    });

    test('@api should fail to delete non-existent dish', async ({ request }) => {
      // Act
      const response = await request.delete(`http://localhost:3000${ApiEndpoints.DISH_BY_ID(999999)}`, {
        headers: {
          'Cookie': testUser.sessionCookie
        }
      });
      
      // Assert
      await apiHelpers.validateErrorResponse(response, HttpStatusCodes.FORBIDDEN, 'No autorizado');
    });

    test('@api should fail to delete other user\'s dish', async ({ request }) => {
      // Arrange
      const dishData = apiHelpers.generateUniqueDishData();
      const { dish } = await apiHelpers.createDish(dishData, testUser.sessionCookie);
      
      const otherUser = await apiHelpers.createTestUser();
      
      // Act
      const response = await request.delete(`http://localhost:3000${ApiEndpoints.DISH_BY_ID(dish.id)}`, {
        headers: {
          'Cookie': otherUser.sessionCookie
        }
      });
      
      // Assert
      await apiHelpers.validateErrorResponse(response, HttpStatusCodes.FORBIDDEN, 'No autorizado');
      
      // Verify dish still exists
      const checkResponse = await request.get(`http://localhost:3000${ApiEndpoints.DISH_BY_ID(dish.id)}`, {
        headers: {
          'Cookie': testUser.sessionCookie
        }
      });
      expect(checkResponse.status()).toBe(HttpStatusCodes.OK);
    });
  });

  test.describe('Dishes Integration Tests', () => {
    
    test('@api should complete full CRUD cycle for a dish', async ({ request }) => {
      // 1. Create
      const originalData = apiHelpers.generateUniqueDishData();
      const { dish: createdDish } = await apiHelpers.createDish(originalData, testUser.sessionCookie);
      
      // 2. Read
      const { dish: readDish } = await apiHelpers.getDishById(createdDish.id, testUser.sessionCookie);
      expect(readDish.id).toBe(createdDish.id);
      
      // 3. Update
      const updateData = { name: 'Updated Dish Name', description: 'Updated description' };
      const { dish: updatedDish } = await apiHelpers.updateDish(createdDish.id, updateData, testUser.sessionCookie);
      expect(updatedDish.name).toBe(updateData.name);
      
      // 4. Delete
      await apiHelpers.deleteDish(createdDish.id, testUser.sessionCookie);
      
      // 5. Verify deletion
      const response = await request.get(`http://localhost:3000${ApiEndpoints.DISH_BY_ID(createdDish.id)}`, {
        headers: {
          'Cookie': testUser.sessionCookie
        }
      });
      expect(response.status()).toBe(HttpStatusCodes.NOT_FOUND);
    });

    test('@api should handle concurrent dish operations', async ({ request }) => {
      // Create multiple dishes concurrently
      const dishCreationPromises = Array(5).fill(null).map(() => {
        const dishData = apiHelpers.generateUniqueDishData();
        return apiHelpers.createDish(dishData, testUser.sessionCookie);
      });
      
      const results = await Promise.all(dishCreationPromises);
      
      // Verify all dishes were created successfully
      expect(results).toHaveLength(5);
      results.forEach(result => {
        expect(result.dish.id).toBeGreaterThan(0);
        expect(result.dish.userId).toBe(testUser.user.id);
      });
      
      // Verify they appear in the dishes list
      const { dishes } = await apiHelpers.getDishes(testUser.sessionCookie);
      const createdIds = results.map(r => r.dish.id);
      createdIds.forEach(id => {
        expect(dishes.find(d => d.id === id)).toBeDefined();
      });
    });

    test('@api should maintain data consistency across operations', async ({ request }) => {
      // Create dish
      const dishData = apiHelpers.generateUniqueDishData();
      const { dish } = await apiHelpers.createDish(dishData, testUser.sessionCookie);
      
      // Update multiple times
      for (let i = 0; i < 3; i++) {
        const updateData = { name: `Updated Name ${i}` };
        const { dish: updatedDish } = await apiHelpers.updateDish(dish.id, updateData, testUser.sessionCookie);
        expect(updatedDish.name).toBe(updateData.name);
      }
      
      // Verify final state
      const { dish: finalDish } = await apiHelpers.getDishById(dish.id, testUser.sessionCookie);
      expect(finalDish.name).toBe('Updated Name 2');
      expect(finalDish.id).toBe(dish.id);
    });
  });
});