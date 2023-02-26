/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response, NextFunction } from 'express';
import Order from '../models/Order';
import Product from '../models/Product';

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

type OrderPayload = {
  location: string;
} & ApproveOrderPayload;

type OrderStatus = 'APPROVED' | 'REJECTED' | 'COMPLETED' | 'PENDING';

function generateOrderApprovalMessage(
	name: string,
	cart: CartItem[],
	totalPrice: number
): string {
	const itemsPurchased: string[] = cart.map(
		(item) => `${item.productName} (${item.quantity} ${item.unit})`
	);
	const tempelate = `Dear ${name}, your order for ${itemsPurchased.join(
		', '
	)} has been recieved and confirmed, and we shall contact you soon for delivery details, the total amount for this order is: ugx ${totalPrice}`;
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
				req.body = 'Order Placed Successfully';
				next();
			})
			.catch((err) => {
				res.statusCode = 403;
				res.send(err.message);
			});
	}
}

export function getOrders(req: Request, res: Response, next: NextFunction) {
	if (req.body.isAuthenticated) {
		Order.find()
			.then((items) => {
				const orderStatuses: OrderStatus[] = [
					'APPROVED',
					'REJECTED',
					'COMPLETED',
					'PENDING',
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
		res.send('Auth session is invalid');
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
								$set: { stock: item.newStock, orderStatus: 'APPROVED' },
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
					// Updating order status
					Order.findByIdAndUpdate(_id, {
						$set: { orderStatus: 'APPROVED' },
					})
						.then(() => {
							console.log('Order has been approved');
							const newPayload = {
								destination: phoneNumber,
								onSuccess: 'Order has been approved successfully',
								message: generateOrderApprovalMessage(name, cart, totalPrice),
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
					// Sending out of stock message
					res.statusCode = 403;
					res.send(`Out of stock: ${missingSock.join(' ')}`);
				}
			});
		} else {
			res.statusCode = 403;
			res.send('Name, Cart, Total price and sms endpoint are all required');
		}
	} else {
		res.statusCode = 403;
		res.send('Auth session is invalid');
	}
}
