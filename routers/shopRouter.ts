import { Request, Response, Router } from 'express';
import { checkAuthState } from '../controllers/auth';
import { getProducts, saveProduct } from '../controllers/products';

const shopRouter = Router();

shopRouter.post('/', checkAuthState, saveProduct, (_, res: Response) => {
	res.send('Product Created Successfully').status(200);
});

shopRouter.get(
	'/',
	checkAuthState,
	getProducts,
	(req: Request, res: Response) => {
		res.send(req.body).status(200);
	}
);

export default shopRouter;
