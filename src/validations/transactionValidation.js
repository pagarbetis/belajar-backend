import Joi from "joi";

export const createTransactionSchema = Joi.object({
  order_number: Joi.string().optional().allow("", null),
  
  payment_method: Joi.alternatives().try(
    Joi.number().integer(),
    Joi.string()
  ).required().messages({
    'any.required': 'Metode pembayaran wajib diisi.',
  }),

  subtotal: Joi.number().positive().required().messages({
    'number.base': 'Subtotal harus berupa angka.',
    'number.positive': 'Subtotal tidak boleh minus atau nol.',
    'any.required': 'Subtotal wajib diisi.',
  }),

  tax: Joi.number().min(0).required().messages({
    'number.base': 'Pajak harus berupa angka.',
    'number.min': 'Pajak minimal 0.',
    'any.required': 'Pajak wajib diisi.',
  }),

  total: Joi.number().positive().required().messages({
    'number.base': 'Total harus berupa angka.',
    'number.positive': 'Total tidak boleh minus atau nol.',
    'any.required': 'Total wajib diisi.',
  }),

  user_id: Joi.number().integer().optional().allow(null),

  pay: Joi.number().min(0).optional().messages({
    'number.base': 'Jumlah bayar harus berupa angka.',
  }),


  items: Joi.array().items(
    Joi.object({
      product_id: Joi.number().integer().required().messages({
        'any.required': 'Product ID pada item wajib diisi.',
        'number.base': 'Product ID harus berupa angka.',
      }),
      qty: Joi.number().integer().min(1).required().messages({
        'any.required': 'Quantity wajib diisi.',
        'number.min': 'Quantity minimal 1.',
      }),
      price: Joi.number().positive().required().messages({
        'any.required': 'Harga item wajib diisi.',
        'number.positive': 'Harga item harus bernilai positif.',
      })
    })
  ).min(1).required().messages({
    'array.min': 'Minimal harus ada 1 produk/item dalam transaksi.',
    'any.required': 'Items wajib diisi.',
  })
});