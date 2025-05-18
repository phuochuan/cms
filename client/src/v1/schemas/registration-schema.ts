import { z } from "zod";
import { courseSchema } from "./course-schema.ts";

export const registrationSchema = courseSchema.extend({
    duration: z.number().min(1),
    durationUnit: z.enum(["DAY", "WEEK", "MONTH"]),
});

export const durationSchema = z.number().min(1, { message: "Duration must be greater than 0" });
