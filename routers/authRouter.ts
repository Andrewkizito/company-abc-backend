import { Request, Response, Router } from 'express';
import { checkAuthState, login, register } from '../controllers/auth';

const authRouter = Router();

authRouter.post('/register', register, (_, res: Response) => {
	res.send('New User Created Successfully').status(200);
});

authRouter.post('/login', login, (req: Request, res: Response) => {
	res.send(req.body).status(200);
});

authRouter.get('/status', checkAuthState, (req: Request, res: Response) => {
	res.send(req.body.isAuthenticated).status(200);
});

export default authRouter;
