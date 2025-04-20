import type { Request, Response, NextFunction } from "express"
import { type AnyZodObject, ZodError } from "zod"
import { AppError } from "../utils/appError"

export const validateRequest = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate request against schema
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      })

      next()
    } catch (error) {
      if (error instanceof ZodError) {
        // Format Zod validation errors
        const errors = error.errors.map((err) => ({
          path: err.path.join("."),
          message: err.message,
        }))

        // Create AppError with only two parameters
        return next(new AppError(`Validation error: ${JSON.stringify(errors)}`, 400))
      }

      next(error)
    }
  }
}
