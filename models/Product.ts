import { model, Schema } from 'mongoose';

const ProductSchema = new Schema({
	product_name: {
		type: String,
		required: true,
	},
	description: {
		type: String,
		required: true,
	},
	price: {
		type: Number,
		required: true,
	},
	rating: {
		type: Number,
		required: true,
	},
	stock: {
		type: Number,
		required: true,
	},
	image: {
		type: String,
		required: true,
	},
	unit: {
		type: String,
		required: true,
	},
});

export default model('products', ProductSchema);
