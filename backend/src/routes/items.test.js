const request = require('supertest');
const express = require('express');
const fs = require('fs').promises;
const itemsRouter = require('./items');

// Mock fs module
jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
    writeFile: jest.fn()
  }
}));

// Create test app
const app = express();
app.use(express.json());
app.use('/api/items', itemsRouter);

// Mock error handler
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ error: err.message });
});

describe('Items Routes', () => {
  const mockData = [
    { id: 1, name: 'Apple' },
    { id: 2, name: 'Banana' },
    { id: 3, name: 'Cherry' },
    { id: 4, name: 'Date' },
    { id: 5, name: 'Elderberry' },
    { id: 6, name: 'Fig' },
    { id: 7, name: 'Grape' },
    { id: 8, name: 'Honeydew' },
    { id: 9, name: 'Ice Cream Bean' },
    { id: 10, name: 'Jackfruit' }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/items', () => {
    describe('Happy Path', () => {
      test('should return paginated items with default page size', async () => {
        fs.readFile.mockResolvedValue(JSON.stringify(mockData));

        const response = await request(app).get('/api/items');

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('items');
        expect(response.body).toHaveProperty('pagination');
        expect(response.body.items).toHaveLength(10);
        expect(response.body.pagination).toEqual({
          page: 1,
          pageSize: 20,
          total: 10,
          totalPages: 1
        });
      });

      test('should return items for specific page', async () => {
        fs.readFile.mockResolvedValue(JSON.stringify(mockData));

        const response = await request(app)
          .get('/api/items')
          .query({ limit: 3, page: 2 });

        expect(response.status).toBe(200);
        expect(response.body.items).toHaveLength(3);
        expect(response.body.items[0].name).toBe('Date');
        expect(response.body.pagination).toEqual({
          page: 2,
          pageSize: 3,
          total: 10,
          totalPages: 4
        });
      });

      test('should filter items by search query', async () => {
        fs.readFile.mockResolvedValue(JSON.stringify(mockData));

        const response = await request(app)
          .get('/api/items')
          .query({ q: 'berry' });

        expect(response.status).toBe(200);
        expect(response.body.items).toHaveLength(1);
        expect(response.body.items[0].name).toBe('Elderberry');
        expect(response.body.pagination.total).toBe(1);
      });

      test('should filter items by search query (case insensitive)', async () => {
        fs.readFile.mockResolvedValue(JSON.stringify(mockData));

        const response = await request(app)
          .get('/api/items')
          .query({ q: 'APPLE' });

        expect(response.status).toBe(200);
        expect(response.body.items).toHaveLength(1);
        expect(response.body.items[0].name).toBe('Apple');
      });

      test('should return empty array when no items match search', async () => {
        fs.readFile.mockResolvedValue(JSON.stringify(mockData));

        const response = await request(app)
          .get('/api/items')
          .query({ q: 'nonexistent' });

        expect(response.status).toBe(200);
        expect(response.body.items).toHaveLength(0);
        expect(response.body.pagination.total).toBe(0);
      });

      test('should handle page beyond total pages', async () => {
        fs.readFile.mockResolvedValue(JSON.stringify(mockData));

        const response = await request(app)
          .get('/api/items')
          .query({ limit: 5, page: 10 });

        expect(response.status).toBe(200);
        expect(response.body.items).toHaveLength(0);
        expect(response.body.pagination).toEqual({
          page: 10,
          pageSize: 5,
          total: 10,
          totalPages: 2
        });
      });
    });

    describe('Error Cases', () => {
      test('should handle file read error', async () => {
        fs.readFile.mockRejectedValue(new Error('File not found'));

        const response = await request(app).get('/api/items');

        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty('error');
      });

      test('should handle malformed JSON', async () => {
        fs.readFile.mockResolvedValue('invalid json');

        const response = await request(app).get('/api/items');

        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty('error');
      });
    });
  });

  describe('GET /api/items/:id', () => {
    describe('Happy Path', () => {
      test('should return item by id', async () => {
        fs.readFile.mockResolvedValue(JSON.stringify(mockData));

        const response = await request(app).get('/api/items/5');

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ id: 5, name: 'Elderberry' });
      });
    });

    describe('Error Cases', () => {
      test('should return 404 when item not found', async () => {
        fs.readFile.mockResolvedValue(JSON.stringify(mockData));

        const response = await request(app).get('/api/items/999');

        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('error', 'Item not found');
      });

      test('should handle file read error', async () => {
        fs.readFile.mockRejectedValue(new Error('File not found'));

        const response = await request(app).get('/api/items/1');

        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty('error');
      });

      test('should handle malformed JSON', async () => {
        fs.readFile.mockResolvedValue('invalid json');

        const response = await request(app).get('/api/items/1');

        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty('error');
      });
    });
  });

  describe('POST /api/items', () => {
    describe('Happy Path', () => {
      test('should create new item', async () => {
        fs.readFile.mockResolvedValue(JSON.stringify(mockData));
        fs.writeFile.mockResolvedValue();

        const newItem = { name: 'Kiwi', category: 'Fruit', price: 2.5 };
        const response = await request(app)
          .post('/api/items')
          .send(newItem);

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('id');
        expect(response.body.name).toBe('Kiwi');
        expect(fs.writeFile).toHaveBeenCalledTimes(1);
      });
    });

    describe('Error Cases', () => {
      test('should handle file read error', async () => {
        fs.readFile.mockRejectedValue(new Error('File not found'));

        const newItem = { name: 'Nectarine', category: 'Fruit', price: 3.0 };
        const response = await request(app)
          .post('/api/items')
          .send(newItem);

        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty('error');
      });

      test('should handle file write error', async () => {
        fs.readFile.mockResolvedValue(JSON.stringify(mockData));
        fs.writeFile.mockRejectedValue(new Error('Permission denied'));

        const newItem = { name: 'Olive', category: 'Fruit', price: 4.0 };
        const response = await request(app)
          .post('/api/items')
          .send(newItem);

        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty('error');
      });

      test('should handle malformed JSON in data file', async () => {
        fs.readFile.mockResolvedValue('invalid json');

        const newItem = { name: 'Papaya', category: 'Fruit', price: 3.5 };
        const response = await request(app)
          .post('/api/items')
          .send(newItem);

        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty('error');
      });
    });
  });
});
