/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response, NextFunction } from 'express';
import Order from '../models/Order';

interface CartItem {
  productName: string;
  quantity: number;
  price: number;
  unit: string;
}

type ApproveOrderPayload = {
  name: string;
  totalPrice: number;
  cart: CartItem[];
  smsEndpoint: string;
  isAuthenticated?: boolean
};

type OrderPayload = {
  phoneNumber: string;
  location: string;
} & ApproveOrderPayload;

type OrderStatus = 'APPROVED' | 'REJECTED' | 'COMPLETED' | 'PENDING';

function generateOrderApprovalMessage(
	name: string,
	cart: CartItem[],
	totalPrice: number
): string {
	const itemsPurchased: string[] = cart.map(
		(item) => `${item.productName} ${item.quantity} ${item.unit}`
	);
	const tempelate = `Dear ${name}, your order for (${itemsPurchased.join(
		', '
	)}) has been recieved and confirmed, and we shall contact you soon for delivery details, the total amount for this order is: ugx - ${totalPrice}`;
	return tempelate;
}

export function placeOrder(req: Request, res: Response, next: NextFunction) {
	// Extracting order information
	const {
		name,
		phoneNumber,
		location,
		cart,
		smsEndpoint,
		totalPrice,
	}: OrderPayload = req.body;

	if (
		(name && phoneNumber && location && cart && smsEndpoint && totalPrice) !==
    undefined
	) {
		const newItem = new Order({
			name,
			phoneNumber,
			location,
			cart,
			smsEndpoint,
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
		const { name, cart, totalPrice, smsEndpoint }: ApproveOrderPayload = req.body;
		if (name && cart && totalPrice && smsEndpoint) {
			const newPayload = {
				destination: smsEndpoint,
				message: generateOrderApprovalMessage(name, cart, totalPrice),
			};
			req.body = newPayload;
			next();
		} else {
			res.statusCode = 403;
			res.send('Name, Cart, Total price and sms endpoint are all required');
		}
	} else {
		res.statusCode = 403;
		res.send('Auth session is invalid');
	}
}
