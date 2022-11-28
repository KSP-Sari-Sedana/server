import Joi from "joi";

const username = Joi.object({
  username: Joi.string()
    .min(3)
    .max(20)
    .required()
    .pattern(/^[a-z]+$/)
    .messages({
      "string.empty": "Username kosong",
      "string.min": "Username harus lebih dari 3 karakter",
      "string.max": "Username harus kurang dari 20 karakter",
      "any.required": "Username harus diisi",
      "string.pattern.base": "Username hanya boleh huruf kecil",
    }),
}).messages({
  "object.unknown": "Terdapat field yang tidak diperbolehkan",
});

const email = Joi.object({
  email: Joi.string().email().required().messages({
    "string.empty": "Email kosong",
    "string.email": "Email tidak valid",
    "any.required": "Email harus diisi",
  }),
}).messages({
  "object.unknown": "Terdapat field yang tidak diperbolehkan",
});

const namaDepan = Joi.object({
  namaDepan: Joi.string()
    .min(3)
    .max(20)
    .required()
    .pattern(/^[a-zA-Z]+$/)
    .messages({
      "string.empty": "Nama depan kosong",
      "string.min": "Nama depan harus lebih dari 3 karakter",
      "string.max": "Nama depan harus kurang dari 20 karakter",
      "any.required": "Nama depan harus diisi",
      "string.pattern.base": "Nama depan hanya boleh huruf dan satu kata",
    }),
}).messages({
  "object.unknown": "Terdapat field yang tidak diperbolehkan",
});

const namaBelakang = Joi.object({
  namaBelakang: Joi.string()
    .min(3)
    .max(20)
    .required()
    .pattern(/^[a-zA-Z]+$/)
    .messages({
      "string.empty": "Nama belakang kosong",
      "string.min": "Nama belakang harus lebih dari 3 karakter",
      "string.max": "Nama belakang harus kurang dari 20 karakter",
      "any.required": "Nama belakang harus diisi",
      "string.pattern.base": "Nama belakang hanya boleh huruf dan satu kata",
    }),
}).messages({
  "object.unknown": "Terdapat field yang tidak diperbolehkan",
});

const password = Joi.object({
  password: Joi.string().min(6).max(20).required().messages({
    "string.empty": "Password kosong",
    "string.min": "Password harus lebih dari 6 karakter",
    "string.max": "Password harus kurang dari 20 karakter",
    "any.required": "Password harus diisi",
  }),
}).messages({
  "object.unknown": "Terdapat field yang tidak diperbolehkan",
});

export default { username, email, namaDepan, namaBelakang, password };
