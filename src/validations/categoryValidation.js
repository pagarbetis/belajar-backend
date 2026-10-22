import Joi from "joi";

export const createCategorySchema = Joi.object({
  name: Joi.string().min(3).max(255).required(),
});

export const updateCategorySchema = Joi.object({
  name: Joi.string().min(3).max(255).required(),
});
