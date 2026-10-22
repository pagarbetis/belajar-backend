import Joi from "joi";


export const createProductSchema = Joi.object({
  category_id: Joi.number().integer().required().messages({
    'any.required': 'Category ID wajib diisi.',
    'any.empty': 'Category ID tidak boleh kosong.',
    'number.base': 'Category ID harus berupa angka.'
  }),
  
  nama: Joi.string().min(3).max(255).required().messages({
    'any.required': 'Nama produk wajib diisi.',
    'string.empty': 'Nama produk tidak boleh kosong.',
    'string.min': 'Nama produk minimal 3 karakter.'
  }),
  
  price: Joi.number().positive().required().messages({
    'any.required': 'Harga wajib diisi.',
    'any.empty': 'Harga tidak boleh kosong.',
    'number.base': 'Harga harus berupa angka.',
    'number.positive': 'Harga tidak boleh minus.'
  }),
  
  stock: Joi.number().integer().min(0).required().messages({
    'any.required': 'Stok wajib diisi.',
    'any.empty': 'Stok tidak boleh kosong.',
    'number.base': 'Stok harus berupa angka.'
  }),
  
  description: Joi.string().allow("", null).optional(),
  
  is_active: Joi.number().optional()
});

export const updateProductSchema = Joi.object({
  category_id: Joi.number().integer().optional(),
  nama: Joi.string().min(3).max(255).allow("", null).optional(),
  price: Joi.number().positive().allow("", null).optional(),
  stock: Joi.number().integer().min(0).allow("", null).optional(),
  description: Joi.string().allow("", null).allow("", null).optional(),
  is_active: Joi.number().allow("", null).optional()
}).min(1).messages({
  'object.min': 'Minimal harus ada 1 field yang di-update bos.'
});