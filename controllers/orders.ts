/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response, NextFunction } from "express";
import Order from "../models/Order";
import Product from "../models/Product";

interface CartItem {
  _id: string;
  productName: string;
  quantity: number;
  price: number;
  unit: string;
}

type ApproveOrderPayload = {
  _id: string;
  name: string;
  totalPrice: number;
  cart: CartItem[];
  phoneNumber: string;
  isAuthenticated?: boolean;
};

type RejectOrderPayload = {
  _id: string;
  name: string;
  reason: string;
  cart: CartItem[];
  phoneNumber: string;
  isAuthenticated?: boolean;
};

type OrderPayload = {
  location: string;
} & ApproveOrderPayload;

type OrderStatus = "APPROVED" | "REJECTED" | "COMPLETED" | "PENDING";

function generateOrderApprovalMessage(
	name: string,
	cart: CartItem[],
	totalPrice: number
): string {
	const itemsPurchased: string[] = cart.map(
		(item) => `${item.productName} (${item.quantity} ${item.unit})`
	);
	const tempelate = `Dear ${name}, your order for ${itemsPurchased.join(
		", "
	)} has been recieved and confirmed, and we shall contact you soon for delivery details, the total amount for this order is: ugx ${totalPrice}`;
	return tempelate;
}

function generateOrderRejectionMessage(
	name: string,
	reason: string,
	cart: CartItem[]
): string {
	const itemsPurchased: string[] = cart.map(
		(item) => `${item.productName} (${item.quantity} ${item.unit})`
	);
	const tempelate = `Dear ${name}, thank you for placing in an order for ${itemsPurchased.join(
		", "
	)} Unforturnately, your order has been cancelled because ${reason}`;
	return tempelate;
}

export function placeOrder(req: Request, res: Response, next: NextFunction) {
	// Extracting order information
	const { name, phoneNumber, location, cart, totalPrice }: OrderPayload =
    req.body;

	if (name && phoneNumber && location && cart && totalPrice) {
		const newItem = new Order({
			name,
			phoneNumber,
			location,
			cart,
			totalPrice,
		});
		newItem
			.save()
			.then(() => {
				req.body = "Order Placed Successfully";
				next();
			})
			.catch((err) => {
				res.statusCode = 403;
				res.send(err.message);
			});
	} else {
		res.statusCode = 403;
		res.send("Payload is invalid");
	}
}

export function getOrders(req: Request, res: Response, next: NextFunction) {
	if (req.body.isAuthenticated) {
		Order.find()
			.then((items) => {
				const orderStatuses: OrderStatus[] = [
					"APPROVED",
					"REJECTED",
					"COMPLETED",
					"PENDING",
				];
				const payload: { [key: string]: any } = { total: items.length };
				orderStatuses.forEach((item: OrderStatus) => {
					payload[item.toLocaleLowerCase()] = items.filter(
						(order) => order.orderStatus === item
					);
				});
				req.body = payload;
				next();
			})
			.catch((err) => {
				res.statusCode = 500;
				res.send(err.message);
			});
	} else {
		res.statusCode = 403;
		res.send("Auth session is invalid");
	}
}

export function approveOrder(req: Request, res: Response, next: NextFunction) {
	if (req.body.isAuthenticated) {
		// Extracting order details
		const { _id, name, cart, totalPrice, phoneNumber }: ApproveOrderPayload =
      req.body;
		// Validating order details
		if (name && cart && totalPrice && phoneNumber) {
			/* Getting matchinf copies of the 
			   order items in cart from database */
			Product.find({
				productName: { $in: cart.map((item) => item.productName) },
			}).then((products) => {
				// Stock check variable
				let stockCheck = true;
				// List of missing stock
				const missingSock: string[] = [];
				// List of stock to update
				const stockToUpdate: { productName: string; newStock: number }[] = [];

				//Looping through the cart
				cart.forEach((item) => {
					// Getting the equivalent product for the current cart item
					const product = products.filter(
						(pdt) => pdt.productName === item.productName
					)[0];
					// Checking if stock left is enough to fullfil the order
					if (product.stock < item.quantity) {
						// Set stock check to false
						stockCheck = false;
						// Add stock to missing stock
						missingSock.push(item.productName);
					}
					// Add stock changes
					else
						stockToUpdate.push({
							productName: item.productName,
							newStock: product.stock - item.quantity,
						});
				});

				// Checking if order can be fullfiled
				if (stockCheck) {
					// Updating all stock items
					stockToUpdate.forEach((item) =>
						Product.updateOne(
							{ productName: item.productName },
							{
								$set: { stock: item.newStock, orderStatus: "APPROVED" },
							}
						)
							.then(() =>
								console.log(
									`Updated ${item.productName} stock to ${item.newStock}`
								)
							)
							.catch((err) => {
								res.statusCode = 403;
								res.send(err.message);
							})
					);
					// Updating order status to APPROVED
					Order.findByIdAndUpdate(_id, {
						$set: { orderStatus: "APPROVED" },
					})
						.then(() => {
							console.log("Order has been approved");
							const newPayload = {
								destination: phoneNumber,
								onSuccess: "Order has been approved successfully",
								message: generateOrderApprovalMessage(name, cart, totalPrice),
							};
							req.body = newPayload;
							next();
						})
						.catch((err) => {
							// Sending error message
							res.statusCode = 403;
							res.send(err.message);
						});
				} else {
					// Sending out of stock message
					res.statusCode = 403;
					res.send(`Out of stock: ${missingSock.join(" ")}`);
				}
			});
		} else {
			res.statusCode = 403;
			res.send("Payload is invalid");
		}
	} else {
		res.statusCode = 403;
		res.send("Auth session is invalid");
	}
}

export function rejectOrder(req: Request, res: Response, next: NextFunction) {
	if (req.body.isAuthenticated) {
		const { _id, name, reason, cart, phoneNumber }: RejectOrderPayload =
      req.body;
		// Validate payload
		if (_id && name && reason && cart && phoneNumber) {
			// Updating order status to REJECTED
			Order.findByIdAndUpdate(_id, {
				$set: { orderStatus: "REJECTED" },
			})
				.then(() => {
					const newPayload = {
						destination: phoneNumber,
						onSuccess: "Order has been rejected successfully",
						message: generateOrderRejectionMessage(name, reason, cart),
					};
					req.body = newPayload;
					next();
				})
				.catch((err) => {
					// Sending out of stock message
					res.statusCode = 403;
					res.send(err.message);
				});
		} else {
			res.statusCode = 403;
			res.send("Payload is invalid");
		}
	} else {
		res.statusCode = 403;
		res.send("Auth credentials invalid");
	}
}

export function completeOrder(req: Request, res: Response, next: NextFunction) {
	if (req.body.isAuthenticated) {
		const { _id } = req.body;
		if (_id) {
			// Updating order status to COMPLETED
			Order.findByIdAndUpdate(_id, {
				$set: { orderStatus: "COMPLETED" },
			})
				.then(() => {
					req.body = "Order has been successfully completed";
					next();
				})
				.catch((err) => {
					res.statusCode = 403;
					res.send(err.message);
				});
		} else {
			res.statusCode = 403;
			res.send("Order id is required");
		}
	} else {
		res.statusCode = 403;
		res.send("Auth credentials invalid");
	}
}

export function deleteOrder(req: Request, res: Response, next: NextFunction) {
	if (req.body.isAuthenticated) {
		const { _id } = req.body;
		if (_id) {
			// Get order Status
			Order.findById(_id)
				.then((item) => {
					if (item) {
						if (["REJECTED", "COMPLETED"].includes(item?.orderStatus)) {
							// Deleting the order
							Order.deleteOne()
								.then(() => {
									req.body = "Order has been successfully deleted";
									next();
								})
								.catch((err) => {
									// Sending out of stock message
									res.statusCode = 403;
									res.send(err.message);
								});
						} else {
							res.statusCode = 403;
							res.send("Order must be is either rejected or completed status");
						}
					} else {
						res.statusCode = 404;
						res.send("Order not found, check id and try again");
					}
				})
				.catch((err) => {
					res.statusCode = 403;
					res.send(err.message);
				});
		} else {
			res.statusCode = 403;
			res.send("Order id is required");
		}
	} else {
		res.statusCode = 403;
		res.send("Auth credentials invalid");
	}
}
