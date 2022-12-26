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

const firstName = Joi.object({
  firstName: Joi.string()
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

const lastName = Joi.object({
  lastName: Joi.string()
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

const productName = Joi.object({
  productName: Joi.string().required().messages({
    "string.empty": "Nama produk kosong",
    "any.required": "Nama produk harus diisi",
  }),
}).messages({
  "object.unknown": "Terdapat field yang tidak diperbolehkan",
});

const productDescription = Joi.object({
  productDescription: Joi.string().required().min(40).messages({
    "string.empty": "Deskripsi produk kosong",
    "any.required": "Deskripsi produk harus diisi",
    "string.min": "Deskripsi produk harus lebih dari 40 karakter",
  }),
}).messages({
  "object.unknown": "Terdapat field yang tidak diperbolehkan",
});

const productInterest = Joi.object({
  productInterest: Joi.number().required().messages({
    "any.required": "Bunga produk harus diisi",
    "number.base": "Bunga harus angka",
  }),
}).messages({
  "object.unknown": "Terdapat field yang tidak diperbolehkan",
});

const productType = Joi.object({
  productType: Joi.string().valid("Simpanan", "Pinjaman").required().messages({
    "any.only": "Tipe produk harus simpanan atau pinjaman",
    "any.required": "Tipe produk harus diisi",
  }),
}).messages({
  "object.unknown": "Terdapat field yang tidak diperbolehkan",
});

const productDeposit = Joi.object({
  productDeposit: Joi.string().valid("Bulanan", "Harian").required().messages({
    "any.only": "Setoran produk harus bulanan atau harian",
    "any.required": "Setoran produk harus diisi",
  }),
}).messages({
  "object.unknown": "Terdapat field yang tidak diperbolehkan",
});

const productTenor = Joi.object({
  productTenor: Joi.array().required().items(Joi.number()).messages({
    "any.required": "Tenor produk harus diisi",
    "array.base": "Tenor produk harus tipe data array",
  }),
}).messages({
  "object.unknown": "Terdapat field yang tidak diperbolehkan",
});

const productInstallment = Joi.object({
  productInstallment: Joi.array().required().items(Joi.number()).messages({
    "any.required": "Angsuran produk harus diisi",
    "array.base": "Angsuran produk harus tipe data array",
  }),
}).messages({
  "object.unknown": "Terdapat field yang tidak diperbolehkan",
});

export default {
  username,
  email,
  firstName,
  lastName,
  password,
  productName,
  productDescription,
  productInterest,
  productType,
  productDeposit,
  productTenor,
  productInstallment,
};
