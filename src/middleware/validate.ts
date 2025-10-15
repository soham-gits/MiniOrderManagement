import { Request, Response, NextFunction } from "express";
import Joi, { ObjectSchema } from "joi";

// ----------------------
// Generic body validator
// ----------------------
export const validateBody = (schema: ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });
    req.body = value;
    next();
  };
};

// ----------------------
// Generic query validator
// ----------------------
export const validateQuery = (schema: ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.query);
    if (error) return res.status(400).json({ message: error.details[0].message });
    req.query = value;
    next();
  };
};

// ----------------------
// Example: Product schema
// ----------------------
export const productSchema = Joi.object({
  name: Joi.string().required(),
  price: Joi.number().required().min(0),
  stock: Joi.number().required().min(0),
});

// ----------------------
// Example: Order list query schema
// ----------------------
export const listOrdersQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).default(10),
  status: Joi.string().valid("PENDING_PAYMENT", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"),
  sort: Joi.string().valid("ascending", "descending").default("descending"),
});
