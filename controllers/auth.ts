/* eslint-disable @typescript-eslint/no-explicit-any */
import { Response, Request, NextFunction } from 'express';
import AuthModel from '../models/Auth';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

type User = {
  username: string;
  password: string;
};

export async function register(
	req: Request,
	res: Response,
	next: NextFunction
) {
	const payload: User = req.body;

	if (payload.username && payload.password) {
		try {
			const item = await AuthModel.find({
				username: payload.username.toLocaleLowerCase(),
			});
			if (item.length) {
				res.statusCode = 403;
				res.send('User Already Exists.');
			} else {
				const salt = bcrypt.genSaltSync(10);
				const hashedPassword = bcrypt.hashSync(payload.password, salt);

				const newUser = new AuthModel({
					username: payload.username.toLocaleLowerCase(),
					password: hashedPassword,
				});

				newUser
					.save()
					.then(() => next())
					.catch((err: any) => {
						res.statusCode = 404;
						res.send(err.message);
					});
			}
		} catch (error: any) {
			res.statusCode = 404;
			res.send(error.message);
		}
	} else {
		res.statusCode = 403;
		res.send('Both email and password are required.');
	}
}

export async function login(req: Request, res: Response, next: NextFunction) {
	const payload: User = req.body;

	if (payload.username && payload.password) {
		const items = await AuthModel.find({
			username: payload.username.toLocaleLowerCase(),
		});
		if (items[0]) {
			const passwordMatch = bcrypt.compareSync(
				payload.password,
				items[0].password
			);
			if (passwordMatch && process.env.APP_SECRET) {
				const token = jwt.sign(
					{
						data: payload.username,
					},
					process.env.APP_SECRET,
					{ expiresIn: '2h' }
				);
				req.body = token;
				next();
			} else {
				res.statusCode = 404;
				res.send('Password is invalid');
			}
		} else {
			res.statusCode = 404;
			res.send('No account found, check username and try again.');
		}
	} else {
		res.statusCode = 403;
		res.send('Both email and password are required.');
	}
}

export async function checkAuthState(
	req: Request,
	res: Response,
	next: NextFunction
) {
	const token: string | undefined = req.header('Authorization');
	if (token) {
		if (process.env.APP_SECRET) {
			jwt.verify(token, process.env.APP_SECRET, (error) => {
				if (error) {
					req.body.isAuthenticated = false;
					next();
				} else {
					req.body.isAuthenticated = true;
					next();
				}
			});
		} else {
			next('App secret not found');
		}
	} else {
		req.body.isAuthenticated = false;
		next();
	}
}
