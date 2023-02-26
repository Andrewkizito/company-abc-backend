/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response, NextFunction } from 'express';
import Order from '../models/Order';

interface CartItem {
	productName: string;
	quantity: number;
	price: number;
	unit: string;
}

interface OrderPayload {
	name: string;
	phoneNumber: string;
	location: string;
	totalPrice: 0,
	cart: CartItem[];
	subscriptionArn: string
}

export function placeOrder(req: Request, res: Response, next: NextFunction) {
	const { name,phoneNumber,location,
		cart,subscriptionArn }: OrderPayload  = req.body;

	if((name && phoneNumber && location && cart && subscriptionArn) !== undefined){
		const newItem = new Order({name,phoneNumber,location,cart,subscriptionArn});
		newItem.save().then(item => {
			req.body = item;
			next();
		}).catch(err => {
			res.statusCode = 403;
			res.send(err.message);
		});
	}
}
