import { Request, Response, Router } from 'express';
import { createSubscription } from '../controllers/messaging';
import { placeOrder } from '../controllers/orders';

const ordersRouter = Router();

ordersRouter.post('/', createSubscription, placeOrder, (req: Request, res: Response) => {
	res.send(req.body).status(200);
});

export default ordersRouter;
