/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import Product from "../models/Product";

interface ProductPayload {
  productName: string;
  description: string;
  image: string;
  price: string;
  rating: string;
  unit: string;
  stock: string;
  isAuthenticated?: false;
}

export async function saveProduct(
	req: Request,
	res: Response,
	next: NextFunction
) {
	const payload: ProductPayload = req.body;
	if (payload.isAuthenticated) {
		//Initializing product data
		const mydata: { [key: string]: any } = {};
		//Generating product data
		const shouldBeNumbers: Array<string> = ["rating", "price", "stock"];
		for (const key in payload) {
			if (key !== "isAuthenticated") {
				const value: any = payload[key as keyof typeof payload];
				if (shouldBeNumbers.includes(key))
					mydata[key] = typeof value === "string" ? parseInt(value) : 1;
				else mydata[key] = value;
			}
		}
		if (Object.values(mydata).length) {
			try {
				const item = await Product.find({
					productName: mydata.productName,
				});
				if (item.length) {
					res.statusCode = 403;
					res.send("Item Already Exists");
				} else {
					const newProduct = new Product({
						productName: mydata.productName,
						description: mydata.description,
						image: mydata.image,
						price: mydata.price,
						rating: mydata.rating,
						unit: mydata.unit,
						stock: mydata.stock,
					});

					newProduct
						.save()
						.then(() => {
							req.body = "Product Added Successfully";
							next();
						})
						.catch((err: any) => {
							res.statusCode = 404;
							res.send(err.message);
						});
				}
			} catch (error: any) {
				res.statusCode = 404;
				res.send(error.message);
			}
		} else {
			res.statusCode = 403;
			res.send("Some required fields are missing");
		}
	} else {
		res.statusCode = 403;
		res.send("Your credentials have expired");
	}
}

export function getProducts(req: Request, res: Response, next: NextFunction) {
	Product.find()
		.then((items) => {
			req.body = items;
			next();
		})
		.catch((err: any) => {
			res.statusCode = 403;
			res.send(err.message);
		});
}

export function updateStock(req: Request, res: Response, next: NextFunction) {
	if (req.body.isAuthenticated) {
		const { _id, newStock } = req.body;
		if (_id && newStock) {
			// Updating order status to COMPLETED
			Product.findByIdAndUpdate(_id, {
				$set: { stock: newStock },
			})
				.then(() => {
					req.body = "Stock has been successfully updated";
					next();
				})
				.catch((err) => {
					res.statusCode = 403;
					res.send(err.message);
				});
		} else {
			res.statusCode = 403;
			res.send("Both Product id and stock value is required");
		}
	} else {
		res.statusCode = 403;
		res.send("Auth credentials invalid");
	}
}
