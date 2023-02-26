import { model, Schema } from 'mongoose';

const AuthSchema = new Schema({
	username: {
		type: String,
		required: true,
	},
	password: {
		type: String,
		required: true,
	},
});

export default model('auth', AuthSchema);
