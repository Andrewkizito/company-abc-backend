import { Request, Response, Router } from 'express';
import { approveOrder, getOrders, placeOrder } from '../controllers/orders';
import { checkAuthState } from '../controllers/auth';
import { createSubscription } from '../controllers/messaging';

const ordersRouter = Router();

ordersRouter.post(
	'/',
	createSubscription,
	placeOrder,
	(req: Request, res: Response) => {
		res.send(req.body).status(200);
	}
);

ordersRouter.get(
	'/',
	checkAuthState,
	getOrders,
	(req: Request, res: Response) => {
		res.send(req.body).status(200);
	}
);

ordersRouter.patch(
	'/approve',
	checkAuthState,
	approveOrder,
	(req: Request, res: Response) => {
		res.send(req.body).status(200);
	}
);

export default ordersRouter;
