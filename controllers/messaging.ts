import AWS from 'aws-sdk';
import { Request, Response, NextFunction } from 'express';

export function sendMessage(req: Request, res: Response, next: NextFunction) {
	AWS.config.update({
		region: 'eu-central-1',
		credentials: {
			accessKeyId: 'AKIAUTHTJ64KYMZOMXOD',
			secretAccessKey: '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',
		},
	});

	const sms = new AWS.SNS({
		apiVersion: '2010-03-31',
		region: 'eu-central-1',
	});
	const destination: string | undefined = req.body.destination;
	const message: string | undefined = req.body.message;
	const onSuccess: string | undefined = req.body.message;
	if (destination && message && onSuccess) {
		sms.publish(
			{
				PhoneNumber: destination,
				Message: message,
			},
			function (err, data) {
				if (err) {
					console.log(err);
					res.statusCode = 403;
					res.send(err.message);
				}
				console.log(data);
				req.body = onSuccess;
				next();
			}
		);
	} else {
		res.statusCode = 403;
		res.send('Destination & Message are required');
	}
}
