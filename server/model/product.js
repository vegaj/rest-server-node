var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const uniqueValidator = require('mongoose-unique-validator')

var productSchema = new Schema({
    name: { type: String, required: [true, 'the name is required'], unique: true },
    unitPrice: { type: Number, required: [true, 'the unit price is required'] },
    description: { type: String, required: false },
    available: { type: Boolean, required: true, default: true },
    picture: { type: String }, //{ type: Schema.Types.Array },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User' }
});

productSchema.plugin(uniqueValidator);

module.exports = mongoose.model('Product', productSchema);