import Joi from "joi";

export const createSchema = Joi.object({
name: Joi.string()
    .trim()
    .min(3)
    .max(50)
    .required()
    .messages({
      'string.base': 'Nama harus berupa teks.',
      'string.empty': 'Nama tidak boleh kosong.',
      'string.min': 'Nama minimal 3 karakter.',
      'string.max': 'Nama maksimal 50 karakter.',
      'any.required': 'Nama wajib diisi.'
    }),

  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.base': 'Email harus berupa teks.',
      'string.empty': 'Email tidak boleh kosong.',
      'string.email': 'Format email tidak valid (contoh: user@mail.com).',
      'any.required': 'Email wajib diisi.'
    }),

  password: Joi.string()
    .min(6)
    .required().pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/)
    .messages({
      'string.base': 'Password harus berupa teks.',
      'string.empty': 'Password tidak boleh kosong.',
      'string.min': 'Password minimal 6 karakter.',
      'any.required': 'Password wajib diisi.',
      "string.pattern.base":
        "Password harus ada huruf besar, huruf kecil, angka, dan simbol!",
    }),

  is_active: Joi.boolean().optional()
});

export const updateSchema = Joi.object({
name: Joi.string()
    .trim()
    .min(3)
    .max(50)
    .required()
    .messages({
      'string.base': 'Nama harus berupa teks.',
      'string.empty': 'Nama tidak boleh kosong.',
      'string.min': 'Nama minimal 3 karakter.',
      'string.max': 'Nama maksimal 50 karakter.',
      'any.required': 'Nama wajib diisi.'
    }),

  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.base': 'Email harus berupa teks.',
      'string.empty': 'Email tidak boleh kosong.',
      'string.email': 'Format email tidak valid (contoh: user@mail.com).',
      'any.required': 'Email wajib diisi.'
    }),

  password: Joi.string()
    .min(6)
    .required().pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/)
    .messages({
      'string.base': 'Password harus berupa teks.',
      'string.empty': 'Password tidak boleh kosong.',
      'string.min': 'Password minimal 6 karakter.',
      'any.required': 'Password wajib diisi.',
      "string.pattern.base":
        "Password harus ada huruf besar, huruf kecil, angka, dan simbol!",
    }),

  is_active: Joi.boolean().optional()
});
