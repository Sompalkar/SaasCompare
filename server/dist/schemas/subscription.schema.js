"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCheckoutSessionSchema = void 0;
const zod_1 = require("zod");
exports.createCheckoutSessionSchema = zod_1.z.object({
    body: zod_1.z.object({
        planId: zod_1.z.string(),
        successUrl: zod_1.z.string().url(),
        cancelUrl: zod_1.z.string().url(),
    }),
});
