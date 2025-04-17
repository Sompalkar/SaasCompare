"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = void 0;
const zod_1 = require("zod");
const appError_1 = require("../utils/appError");
const validateRequest = (schema) => {
    return async (req, res, next) => {
        try {
            await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const errorMessages = error.errors.map((err) => ({
                    path: err.path.join("."),
                    message: err.message,
                }));
                next(new appError_1.AppError(`Validation error: ${JSON.stringify(errorMessages)}`, 400));
            }
            else {
                next(error);
            }
        }
    };
};
exports.validateRequest = validateRequest;
