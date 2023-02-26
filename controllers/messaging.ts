import AWS from 'aws-sdk';
import { Request, Response, NextFunction } from 'express';

AWS.config.region = 'eu-central-1';

const sms = new AWS.SNS({
	apiVersion: '2010-03-31',
	region: 'eu-central-1'
});

export function createSubscription(
	req: Request,
	res: Response,
	next: NextFunction
) {
	const phoneNumber:string | undefined = req.body.phoneNumber;
  
	const regex = /^\+256\d\d\d\d\d\d\d\d\d$/i;
  
	if( phoneNumber !== undefined && regex.test(phoneNumber)){
		const sms = new AWS.SNS({
			apiVersion: '2010-03-31',
			region: 'eu-central-1'
		});
		sms.subscribe({
			TopicArn: 'arn:aws:sns:eu-central-1:316190357269:Company-ABC',
			Protocol: 'sms',
			Endpoint: phoneNumber,
			ReturnSubscriptionArn: true
		}, function(err,data) {
			if(err){
				console.log(err);
				res.statusCode = 403;
				res.send(err.message);
			}
			req.body.subscriptionArn = data.SubscriptionArn;
			next();
		});
	}
  
}

export function sendMessage(req: Request,
	res: Response,
	next: NextFunction) {
	const destination: string | undefined = req.body.SubscriptionArn;
	const message: string | undefined = req.body.message;
	if(destination !== undefined && message !== undefined){
		sms.publish({
			TargetArn: destination,
			Message: 'Just a test message'
		}, function(err,data) {
			if(err){
				console.log(err);
				res.statusCode = 403;
				res.send(err.message);
			}
			console.log(data);
			next();
		});
	} else {
		res.statusCode = 403;
		res.send('Destination & Message are required');
	}
	
}
