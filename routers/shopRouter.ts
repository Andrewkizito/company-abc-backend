import { Request, Response, Router } from 'express';
import { checkAuthState } from '../controllers/auth';
import { getProducts, saveProduct } from '../controllers/products';

const shopRouter = Router();

shopRouter.post(
	'/',
	checkAuthState,
	saveProduct,
	(req: Request, res: Response) => {
		res.send(req.body).status(200);
	}
);

shopRouter.get('/', getProducts, (req: Request, res: Response) => {
	res.send(req.body).status(200);
});

export default shopRouter;
