//Importing core modules
import path from 'path';
import dotenv from 'dotenv';
import express, { NextFunction, Response } from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import multer from 'multer';
import logger from 'morgan';

//Importing routers
import authRouter from './routers/authRouter';
import shopRouter from './routers/shopRouter';
import { fileHandlerFunction,IFile } from './utils';
import ordersRouter from './routers/ordersRouter';

//Loading env file
dotenv.config();

//Intialising express app
export const app = express();


//Setting up cors
app.use(function (_, res: Response, next: NextFunction) {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
	res.header(
		'Access-Control-Allow-Headers',
		'Origin, X-Requested-With, Content-Type, Accept, Authorization'
	);
	next();
});

//Setting up file-storage
const fileStorage = multer.diskStorage({
	destination: (req , file: IFile, cb): void => cb(null, 'public/images'),
	filename: (req, file: IFile, cb): void => cb(null, `${file.originalname}`),
});

//Setting up files-filter
const fileFilter: fileHandlerFunction = (req , file: IFile, cb ): void => {
	const validMimeTypes = ['image/jpg', 'image/png', 'image/jpeg', 'image/webp'];
	if (validMimeTypes.includes(file.mimetype)) {
		cb(null, true);
	} else {
		cb(null, false);
	}
};

//DB Connection String
const mongoUri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@main-cluster.g7kqxgx.mongodb.net/?retryWrites=true&w=majority`;

const startServer = () => {
	//Connecting Database
	mongoose
		.connect(mongoUri)
		.then(() => {
			/* -------------------------------------------------- */
			/* ----------------- Add middleware ----------------- */
			/* -------------------------------------------------- */
			//Body-parser middleware
			app.use(bodyParser.urlencoded({ extended: false }));
			app.use(bodyParser.json());

			//File upload middleware
			app.use(
				multer({ storage: fileStorage, fileFilter: fileFilter }).single(
					'uploadFile'
				)
			);
			//Setting up logger middleware
			app.use(
				logger(function (tokens, req, res) {
					return [
						tokens.method(req, res),
						tokens.url(req, res),
						tokens.status(req, res),
						tokens.res(req, res, 'content-length'),
						'-',
						tokens['response-time'](req, res),
						'ms',
					].join(' ');
				})
			);

			//Setting folder for static assets
			app.use(express.static(path.join(__dirname, 'public')));

			//Setting Up Routes
			app.use('/auth', authRouter);
			app.use('/products', shopRouter);
			app.use('/orders', ordersRouter);

			//Starting the server
			app.listen(process.env.PORT, () => {
				console.log(`Server Listening on port - ${process.env.PORT}`);
			});
		})
		.catch((err) => {
			console.log(err);
			process.exit(1);
		});
};

startServer();
