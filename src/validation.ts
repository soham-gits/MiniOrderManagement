import Joi from 'joi';


export const productSchema = Joi.object({
    name: Joi.string().min(1).required(),
    price: Joi.number().positive().required(),
    stock: Joi.number().integer().min(0).required()
});


export const orderSchema = Joi.object({
    userName: Joi.string().min(1).required(),
    products: Joi.array()
        .items(
            Joi.object({
                productId: Joi.string().required(),
                qty: Joi.number().integer().min(1).required()
            })
        )
        .min(1)
        .required()
});