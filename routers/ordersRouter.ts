import { Request, Response, Router } from 'express';
import { approveOrder, getOrders, placeOrder } from '../controllers/orders';
import { checkAuthState } from '../controllers/auth';
import { sendMessage } from '../controllers/messaging';

const ordersRouter = Router();

ordersRouter.post('/', placeOrder, (req: Request, res: Response) => {
	res.send(req.body).status(200);
});

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
	sendMessage,
	(req: Request, res: Response) => {
		res.send(req.body).status(200);
	}
);

export default ordersRouter;
