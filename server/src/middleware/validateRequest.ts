import type { Request, Response, NextFunction } from "express"
import { type AnyZodObject, ZodError } from "zod"
import { AppError } from "../utils/appError"

export const validateRequest = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      })
      next()
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map((err) => ({
          path: err.path.join("."),
          message: err.message,
        }))
        next(new AppError(`Validation error: ${JSON.stringify(errorMessages)}`, 400))
      } else {
        next(error)
      }
    }
  }
}
