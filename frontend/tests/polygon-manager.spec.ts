import { test, expect } from '@playwright/test';

test.describe('Polygon Manager E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Mock empty API response by default
    await page.route('**/api/polygons', async route => {
      if (route.request().method() === 'GET') {
        await route.fulfill({ json: [] });
      }
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Initial State & UI', () => {
    test('should display application header and empty state', async ({ page }) => {
      await expect(page.getByTestId('app-title')).toContainText('Polygon Manager');
      await expect(page.getByTestId('empty-state')).toBeVisible();
      await expect(page.getByTestId('polygon-count')).toContainText('0');
    });

    test('should show drawing instructions', async ({ page }) => {
      await expect(page.getByTestId('drawing-instructions')).toBeVisible();
    });
  });

  test.describe('Polygon Creation', () => {
    test('should create polygon via canvas clicks', async ({ page }) => {
      // Mock successful creation
      await page.route('**/api/polygons', async route => {
        if (route.request().method() === 'POST') {
          await route.fulfill({
            json: { id: '1', name: 'Test Triangle', points: [[100, 100], [200, 100], [150, 200]] }
          });
        }
      });
      
      const canvas = page.getByTestId('polygon-canvas');
      await expect(canvas).toBeVisible();

      // Create triangle by clicking 3 points
      await canvas.click({ position: { x: 100, y: 100 } });
      await canvas.click({ position: { x: 200, y: 100 } });
      await canvas.click({ position: { x: 150, y: 200 } });
      
      // Close polygon by clicking first point
      await canvas.click({ position: { x: 100, y: 100 } });

      // Should show naming dialog
      await expect(page.getByTestId('create-polygon-title')).toBeVisible();
      
      // Enter polygon name
      await page.getByTestId('polygon-name-input').fill('Test Triangle');
      await page.getByTestId('create-button').click();

      // Wait for creation to complete and verify
      await expect(page.getByTestId('polygon-name')).toContainText('Test Triangle');
      await expect(page.getByTestId('polygon-count')).toContainText('1');
      await expect(page.getByTestId('polygon-points')).toContainText('3 points');
    });

    test('should show success toast on creation', async ({ page }) => {
      // Mock successful API response
      await page.route('**/api/polygons', async route => {
        if (route.request().method() === 'POST') {
          await route.fulfill({
            json: { id: '1', name: 'Test Polygon', points: [[10, 10], [20, 10], [15, 20]] }
          });
        }
      });

      const canvas = page.getByTestId('polygon-canvas');
      await canvas.click({ position: { x: 100, y: 100 } });
      await canvas.click({ position: { x: 200, y: 100 } });
      await canvas.click({ position: { x: 150, y: 200 } });
      await canvas.click({ position: { x: 100, y: 100 } });
      
      await page.getByTestId('polygon-name-input').fill('Test Polygon');
      await page.getByTestId('create-button').click();

      // Check for success toast
      await expect(page.locator('text=created successfully')).toBeVisible();
    });

    test('should validate polygon name input', async ({ page }) => {
      const canvas = page.getByTestId('polygon-canvas');
      await canvas.click({ position: { x: 100, y: 100 } });
      await canvas.click({ position: { x: 200, y: 100 } });
      await canvas.click({ position: { x: 150, y: 200 } });
      await canvas.click({ position: { x: 100, y: 100 } });

      // Try to create without name - button should be disabled
      await expect(page.getByTestId('create-button')).toBeDisabled();

      // Now any characters should be allowed - test special characters
      await page.getByTestId('polygon-name-input').fill('Test@Polygon!#$%^&*()');
      await expect(page.getByTestId('create-button')).not.toBeDisabled();
    });
  });

  test.describe('Polygon Management', () => {
    test.beforeEach(async ({ page }) => {
      // Setup mock data
      await page.route('**/api/polygons', async route => {
        if (route.request().method() === 'GET') {
          await route.fulfill({
            json: [
              { id: '1', name: 'Triangle', points: [[10, 10], [20, 10], [15, 20]] },
              { id: '2', name: 'Square', points: [[0, 0], [10, 0], [10, 10], [0, 10]] }
            ]
          });
        }
      });
      await page.reload();
    });

    test('should display polygon list with details', async ({ page }) => {
      await expect(page.getByTestId('polygon-count')).toContainText('2');
      await expect(page.getByTestId('polygon-item-1')).toBeVisible();
      await expect(page.getByTestId('polygon-item-2')).toBeVisible();
      // Check that polygon names and points are displayed
      const polygonNames = page.getByTestId('polygon-name');
      await expect(polygonNames.first()).toContainText('Triangle');
      await expect(polygonNames.last()).toContainText('Square');
    });

    test('should delete polygon with confirmation', async ({ page }) => {
      // Mock delete API
      await page.route('**/api/polygons/1', async route => {
        if (route.request().method() === 'DELETE') {
          await route.fulfill({ status: 204 });
        }
      });

      // Click delete button
      await page.getByTestId('delete-polygon-button').first().click();
      
      // Confirm deletion dialog
      await expect(page.getByTestId('confirm-dialog-title')).toBeVisible();
      await expect(page.getByTestId('confirm-dialog-message')).toContainText('Triangle');
      
      // Confirm deletion
      await page.getByTestId('confirm-delete-button').click();
      
      // Verify success toast
      await expect(page.locator('text=deleted successfully')).toBeVisible();
    });

    test('should cancel polygon deletion', async ({ page }) => {
      await page.getByTestId('delete-polygon-button').first().click();
      await expect(page.getByTestId('confirm-dialog-title')).toBeVisible();
      
      // Cancel deletion
      await page.getByTestId('confirm-cancel-button').click();
      
      // Dialog should close
      await expect(page.getByTestId('confirm-dialog-title')).not.toBeVisible();
    });
  });

  test.describe('Canvas Interactions', () => {
    test('should show polygon preview while drawing', async ({ page }) => {
      const canvas = page.getByTestId('polygon-canvas');
      
      // Click first point
      await canvas.click({ position: { x: 100, y: 100 } });
      
      // Should show drawing instructions are gone
      await expect(page.getByTestId('drawing-instructions')).not.toBeVisible();
      
      // Click second point
      await canvas.click({ position: { x: 200, y: 100 } });
      
      // Visual feedback should be present (we can't easily test canvas content, but we can verify UI state)
      await expect(canvas).toBeVisible();
    });

    test('should cancel polygon creation', async ({ page }) => {
      const canvas = page.getByTestId('polygon-canvas');
      await canvas.click({ position: { x: 100, y: 100 } });
      await canvas.click({ position: { x: 200, y: 100 } });
      await canvas.click({ position: { x: 150, y: 200 } });
      await canvas.click({ position: { x: 100, y: 100 } });

      // Cancel in naming dialog
      await page.getByTestId('cancel-button').click();
      
      // Should return to initial state
      await expect(page.getByTestId('create-polygon-title')).not.toBeVisible();
      await expect(page.getByTestId('drawing-instructions')).toBeVisible();
    });
  });
});