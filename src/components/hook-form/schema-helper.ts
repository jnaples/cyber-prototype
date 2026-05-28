import dayjs from "dayjs";
import type { ZodTypeAny } from "zod";
import { z as zod } from "zod";

type MessageMapProps = {
  required?: string;
  invalid_type?: string;
};

export const schemaHelper = {
  date: (props?: { message?: MessageMapProps }) =>
    zod
      .union([zod.string(), zod.number(), zod.date(), zod.null()])
      .transform((value, ctx) => {
        if (value === null || value === undefined || value === "") {
          ctx.addIssue({
            code: zod.ZodIssueCode.custom,
            message: props?.message?.required ?? "Date is required!",
          });

          return null;
        }

        const isValid = dayjs(value).isValid();

        if (!isValid) {
          ctx.addIssue({
            code: "custom",
            message: props?.message?.invalid_type ?? "Invalid date!",
          });
        }

        return value;
      }),
  nullableInput: <T extends ZodTypeAny>(
    schema: T,
    options?: { message?: string }
  ) =>
    schema.nullable().transform((val, ctx) => {
      if (val === null || val === undefined) {
        ctx.addIssue({
          code: zod.ZodIssueCode.custom,
          message: options?.message ?? "Field is required!",
        });
        return val;
      }
      return val;
    }),
  /**
   * Boolean
   * Apply for checkbox, switch...
   */
  boolean: (props?: { message: string }) =>
    zod.boolean().refine((val) => val, {
      message: props?.message ?? "Field is required!",
    }),
};

/**
 * Test one or multiple values against a Zod schema.
 */
export function testCase<T extends ZodTypeAny>(schema: T, inputs: unknown[]) {
  const textGreen = (text: string) => `\x1b[32m${text}\x1b[0m`;
  const textRed = (text: string) => `\x1b[31m${text}\x1b[0m`;
  const textGray = (text: string) => `\x1b[90m${text}\x1b[0m`;

  inputs.forEach((input) => {
    const result = schema.safeParse(input);
    const type = textGray(`(${typeof input})`);
    const value = JSON.stringify(input);

    const successValue = textGreen(`✅ Valid - ${value}`);
    const errorValue = textRed(`❌ Error - ${value}`);

    if (!result.success) {
      console.info(
        `${errorValue} ${type}:`,
        JSON.stringify(result.error.format(), null, 2)
      );
    } else {
      console.info(
        `${successValue} ${type}:`,
        JSON.stringify(result.data, null, 2)
      );
    }
  });
}
