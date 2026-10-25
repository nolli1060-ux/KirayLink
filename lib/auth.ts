import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/db";
import { APIError, createAuthMiddleware } from "better-auth/api";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),

  user: {
    additionalFields: {
      accountType: {
        type: "string",
        required: true,
        input: true,
        defaultValue: "tenant",
      },
    },
  },

  emailAndPassword: {
    enabled: true,
  },

  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path === "/sign-up/email") {
        const body = ctx.body as
          | { accountType?: unknown }
          | undefined;

        const accountType = body?.accountType ?? "tenant";

        if (
          accountType !== "tenant" &&
          accountType !== "landlord"
        ) {
          throw new APIError("BAD_REQUEST", {
            message: "Choose a valid account type.",
          });
        }

        if (body) {
          body.accountType = accountType;
        }
      }
    }),
  },


  plugins: [
    admin(),
    nextCookies(),
  ],
});