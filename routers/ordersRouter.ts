import { Request, Response, Router } from "express";
import {
	approveOrder,
	completeOrder,
	deleteOrder,
	getOrders,
	placeOrder,
	rejectOrder,
} from "../controllers/orders";
import { checkAuthState } from "../controllers/auth";
import { sendMessage } from "../controllers/messaging";

const ordersRouter = Router();

// Create new order
ordersRouter.post("/", placeOrder, (req: Request, res: Response) => {
	res.send(req.body).status(200);
});

// Get all orders
ordersRouter.get(
	"/",
	checkAuthState,
	getOrders,
	(req: Request, res: Response) => {
		res.send(req.body).status(200);
	}
);

// Delete an order
ordersRouter.delete(
	"/",
	checkAuthState,
	deleteOrder,
	(req: Request, res: Response) => {
		res.send(req.body).status(200);
	}
);

// Approve an order
ordersRouter.patch(
	"/approve",
	checkAuthState,
	approveOrder,
	sendMessage,
	(req: Request, res: Response) => {
		res.send(req.body).status(200);
	}
);

// Reject an order
ordersRouter.patch(
	"/reject",
	checkAuthState,
	rejectOrder,
	sendMessage,
	(req: Request, res: Response) => {
		res.send(req.body).status(200);
	}
);

// Complete order
ordersRouter.patch(
	"/complete",
	checkAuthState,
	completeOrder,
	(req: Request, res: Response) => {
		res.send(req.body).status(200);
	}
);

export default ordersRouter;
