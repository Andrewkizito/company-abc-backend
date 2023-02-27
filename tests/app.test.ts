import mongoose from "mongoose";
import request from "supertest";
import jwt from "jsonwebtoken";
// import path from 'path';
import { app } from "../server";

describe("Products endpoint", () => {
	/* Connecting to the database before each test. And generating authtoken*/
	// let authToken: string;
	beforeEach(async () => {
		await mongoose.connect(
			`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@main-cluster.g7kqxgx.mongodb.net/?retryWrites=true&w=majority`
		);
		// authToken = jwt.sign(
		// 	{
		// 		data: 'admin',
		// 	},
		// 	'company-abc-gf3bbf838',
		// 	{ expiresIn: '2h' }
		// );
	});

	/* Closing database connection after each test. */
	afterEach(async () => {
		await mongoose.connection.close();
	});

	// Getting products should return an array
	it("GET /products - should return all products", async () => {
		const res = await request(app).get("/products");
		expect(res.statusCode).toBe(200);
		expect(res.body.length).toBeDefined();
	});

	// Creating a new product should return a success
	// it('POST /products - should return body of type string', async () => {
	// 	const res = await request(app)
	// 		.post('/products')
	// 		.field('productName', 'test')
	// 		.field('description', 'test')
	// 		.field('price', '1000')
	// 		.field('stock', '50')
	// 		.field('rating', '5')
	// 		.field('unit', 'test')
	// 		.field('image', 'test.png')
	// 		.attach('uploadFile', path.resolve(__dirname, './test.jpg'))
	// 		.set('Authorization', authToken);
	// 	expect(res.statusCode).toBe(200);
	// 	expect(res.text).toBe('Product Added Successfully');
	// });
});

describe("Orders endpoint", () => {
	/* Connecting to the database before each test. And generating authtoken*/
	let authToken: string;
	beforeEach(async () => {
		await mongoose.connect(
			`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@main-cluster.g7kqxgx.mongodb.net/?retryWrites=true&w=majority`
		);
		authToken = jwt.sign(
			{
				data: "admin",
			},
			"company-abc-gf3bbf838",
			{ expiresIn: "1h" }
		);
	});

	/* Closing database connection after each test. */
	afterEach(async () => {
		await mongoose.connection.close();
	});

	// Getting orders should return an array
	it("GET /orders - should return all orders", async () => {
		const res = await request(app)
			.get("/orders")
			.set("Authorization", authToken);
		expect(res.statusCode).toBe(200);
		expect(res.body.total).toBeDefined();
	});
});
