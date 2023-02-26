import { model, Schema } from 'mongoose';

const OrderItemSchema = new Schema({
	productName: {
		type: String,
		required: true
	},
	quantity: {
		type: Number,
		required: true,
		min: 1
	},
	price: {
		type: Number,
		required: true,
	},
	unit: {
		type: String,
		required: true,
	},
});

const OrderSchema = new Schema({
	name: {
		type: String,
		required: true,
	},
	phoneNumber: {
		type: String,
		required: true,
	},
	location: {
		type: String,
		required: true,
	},
	totalPrice: {
		type: Number,
		required: true,
	},
	cart: {
		type: [OrderItemSchema],
		required: true
	},
	orderStatus: {
		type: String,
		enum: ['APPROVED','REJECTED','COMPLETED','PENDING'],
		default: 'PENDING'
	},
	smsEndpoint: {
		type: String,
		required: true,
	},
});

export default model('orders', OrderSchema);
