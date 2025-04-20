"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = void 0;
const zod_1 = require("zod");
const appError_1 = require("../utils/appError");
const validateRequest = (schema) => {
    return async (req, res, next) => {
        try {
            // Validate request against schema
            await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                // Format Zod validation errors
                const errors = error.errors.map((err) => ({
                    path: err.path.join("."),
                    message: err.message,
                }));
                // Create AppError with only two parameters
                return next(new appError_1.AppError(`Validation error: ${JSON.stringify(errors)}`, 400));
            }
            next(error);
        }
    };
};
exports.validateRequest = validateRequest;
