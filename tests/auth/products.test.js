import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../server';

describe('GET /products', () => {
	/* Connecting to the database before each test. */
	beforeEach(async () => {
		await mongoose.connect(
			`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@main-cluster.g7kqxgx.mongodb.net/?retryWrites=true&w=majority`
		);
	});

	/* Closing database connection after each test. */
	afterEach(async () => {
		await mongoose.connection.close();
	});

	it('should return all products', async () => {
		const res = await request(app).get('/products');
		expect(res.statusCode).toBe(200);
		expect(res.body.length).toBeGreaterThan(0);
	});
});
