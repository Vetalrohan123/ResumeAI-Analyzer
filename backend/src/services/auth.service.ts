import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { prisma } from "../config/prisma.js";

/* ==========================================================================
   JWT CONFIGURATION
   ========================================================================== */

const ACCESS_TOKEN_EXPIRES = "1d";
const REFRESH_TOKEN_EXPIRES = "7d";

/* ==========================================================================
   TYPES
   ========================================================================== */

interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

interface LoginInput {
  email: string;
  password: string;
}

/* ==========================================================================
   AUTH SERVICE
   ========================================================================== */

export class AuthService {
  /* ==========================================================================
     GET JWT SECRETS
     ======================================================================== */

  private static getJwtSecrets() {
    const jwtSecret =
      process.env.JWT_SECRET?.trim();

    const refreshSecret =
      process.env.JWT_REFRESH_SECRET?.trim();

    if (!jwtSecret) {
      console.error(
        "[AUTH SERVICE] JWT_SECRET is missing"
      );

      throw new Error(
        "JWT_SECRET is missing in .env"
      );
    }

    if (!refreshSecret) {
      console.error(
        "[AUTH SERVICE] JWT_REFRESH_SECRET is missing"
      );

      throw new Error(
        "JWT_REFRESH_SECRET is missing in .env"
      );
    }

    return {
      jwtSecret,
      refreshSecret,
    };
  }

  /* ==========================================================================
     VALIDATE EMAIL
     ======================================================================== */

  private static validateEmail(
    email: string
  ): void {
    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      throw new Error(
        "Invalid email address"
      );
    }
  }

  /* ==========================================================================
     REGISTER
     ======================================================================== */

  static async register(
    data: RegisterInput
  ) {
    console.log(
      "================================================"
    );

    console.log(
      "[AUTH SERVICE] Registration started"
    );

    /* ------------------------------------------------------------------------
       VALIDATION
       ---------------------------------------------------------------------- */

    if (!data) {
      throw new Error(
        "Registration data is required"
      );
    }

    if (!data.name?.trim()) {
      throw new Error(
        "Name is required"
      );
    }

    if (!data.email?.trim()) {
      throw new Error(
        "Email is required"
      );
    }

    if (!data.password) {
      throw new Error(
        "Password is required"
      );
    }

    if (data.password.length < 6) {
      throw new Error(
        "Password must be at least 6 characters"
      );
    }

    /* ------------------------------------------------------------------------
       NORMALIZE INPUT
       ---------------------------------------------------------------------- */

    const name =
      data.name.trim();

    const email =
      data.email
        .trim()
        .toLowerCase();

    /* ------------------------------------------------------------------------
       VALIDATE EMAIL
       ---------------------------------------------------------------------- */

    this.validateEmail(email);

    console.log(
      "[AUTH SERVICE] Email:",
      email
    );

    /* ------------------------------------------------------------------------
       CHECK EXISTING USER
       ---------------------------------------------------------------------- */

    const existingUser =
      await prisma.user.findUnique({
        where: {
          email,
        },
      });

    if (existingUser) {
      console.log(
        "[AUTH SERVICE] User already exists:",
        email
      );

      throw new Error(
        "User already exists"
      );
    }

    /* ------------------------------------------------------------------------
       GET JWT SECRETS
       ---------------------------------------------------------------------- */

    const {
      jwtSecret,
      refreshSecret,
    } = this.getJwtSecrets();

    /* ------------------------------------------------------------------------
       HASH PASSWORD
       ---------------------------------------------------------------------- */

    const hashedPassword =
      await bcrypt.hash(
        data.password,
        12
      );

    /* ------------------------------------------------------------------------
       CREATE USER
       ---------------------------------------------------------------------- */

    const user =
      await prisma.user.create({
        data: {
          name,

          email,

          password:
            hashedPassword,
        },
      });

    console.log(
      "[AUTH SERVICE] User created:",
      user.id
    );

    /* ------------------------------------------------------------------------
       CREATE ACCESS TOKEN
       ---------------------------------------------------------------------- */

    const accessToken =
      jwt.sign(
        {
          id: user.id,

          userId: user.id,

          email: user.email,

          role: user.role,
        },

        jwtSecret,

        {
          expiresIn:
            ACCESS_TOKEN_EXPIRES,
        }
      );

    /* ------------------------------------------------------------------------
       CREATE REFRESH TOKEN
       ---------------------------------------------------------------------- */

    const refreshToken =
      jwt.sign(
        {
          id: user.id,

          userId: user.id,
        },

        refreshSecret,

        {
          expiresIn:
            REFRESH_TOKEN_EXPIRES,
        }
      );

    /* ------------------------------------------------------------------------
       LOG SUCCESS
       ---------------------------------------------------------------------- */

    console.log(
      "[AUTH SERVICE] Access token generated:",
      Boolean(accessToken)
    );

    console.log(
      "[AUTH SERVICE] Refresh token generated:",
      Boolean(refreshToken)
    );

    console.log(
      "[AUTH SERVICE] Registration successful"
    );

    console.log(
      "================================================"
    );

    /* ------------------------------------------------------------------------
       RETURN
       ---------------------------------------------------------------------- */

    return {
      user: {
        id: user.id,

        name: user.name,

        email: user.email,

        role: user.role,
      },

      accessToken,

      refreshToken,
    };
  }

  /* ==========================================================================
     LOGIN
     ======================================================================== */

  static async login(
    data: LoginInput
  ) {
    console.log(
      "================================================"
    );

    console.log(
      "[AUTH SERVICE] Login started"
    );

    /* ------------------------------------------------------------------------
       VALIDATION
       ---------------------------------------------------------------------- */

    if (!data) {
      throw new Error(
        "Login data is required"
      );
    }

    if (!data.email?.trim()) {
      throw new Error(
        "Email is required"
      );
    }

    if (!data.password) {
      throw new Error(
        "Password is required"
      );
    }

    /* ------------------------------------------------------------------------
       NORMALIZE EMAIL
       ---------------------------------------------------------------------- */

    const email =
      data.email
        .trim()
        .toLowerCase();

    this.validateEmail(email);

    console.log(
      "[AUTH SERVICE] Login email:",
      email
    );

    /* ------------------------------------------------------------------------
       FIND USER
       ---------------------------------------------------------------------- */

    const user =
      await prisma.user.findUnique({
        where: {
          email,
        },
      });

    if (!user) {
      console.log(
        "[AUTH SERVICE] User not found:",
        email
      );

      throw new Error(
        "Invalid email or password"
      );
    }

    console.log(
      "[AUTH SERVICE] User found:",
      user.id
    );

    /* ------------------------------------------------------------------------
       CHECK PASSWORD HASH
       ---------------------------------------------------------------------- */

    if (!user.password) {
      console.error(
        "[AUTH SERVICE] Password hash missing:",
        user.id
      );

      throw new Error(
        "Invalid email or password"
      );
    }

    /* ------------------------------------------------------------------------
       COMPARE PASSWORD
       ---------------------------------------------------------------------- */

    const validPassword =
      await bcrypt.compare(
        data.password,
        user.password
      );

    console.log(
      "[AUTH SERVICE] Password valid:",
      validPassword
    );

    if (!validPassword) {
      console.log(
        "[AUTH SERVICE] Incorrect password"
      );

      throw new Error(
        "Invalid email or password"
      );
    }

    /* ------------------------------------------------------------------------
       GET JWT SECRETS
       ---------------------------------------------------------------------- */

    const {
      jwtSecret,
      refreshSecret,
    } = this.getJwtSecrets();

    /* ------------------------------------------------------------------------
       CREATE ACCESS TOKEN
       ---------------------------------------------------------------------- */

    const accessToken =
      jwt.sign(
        {
          id: user.id,

          userId: user.id,

          email: user.email,

          role: user.role,
        },

        jwtSecret,

        {
          expiresIn:
            ACCESS_TOKEN_EXPIRES,
        }
      );

    /* ------------------------------------------------------------------------
       CREATE REFRESH TOKEN
       ---------------------------------------------------------------------- */

    const refreshToken =
      jwt.sign(
        {
          id: user.id,

          userId: user.id,
        },

        refreshSecret,

        {
          expiresIn:
            REFRESH_TOKEN_EXPIRES,
        }
      );

    /* ------------------------------------------------------------------------
       VERIFY TOKENS WERE GENERATED
       ---------------------------------------------------------------------- */

    if (!accessToken) {
      console.error(
        "[AUTH SERVICE] Access token generation failed"
      );

      throw new Error(
        "Access token was not generated"
      );
    }

    if (!refreshToken) {
      console.error(
        "[AUTH SERVICE] Refresh token generation failed"
      );

      throw new Error(
        "Refresh token was not generated"
      );
    }

    /* ------------------------------------------------------------------------
       SUCCESS LOG
       ---------------------------------------------------------------------- */

    console.log(
      "[AUTH SERVICE] Access token generated:",
      Boolean(accessToken)
    );

    console.log(
      "[AUTH SERVICE] Refresh token generated:",
      Boolean(refreshToken)
    );

    console.log(
      "[AUTH SERVICE] Login successful"
    );

    console.log(
      "[AUTH SERVICE] User:",
      user.email
    );

    console.log(
      "================================================"
    );

    /* ------------------------------------------------------------------------
       RETURN
       ---------------------------------------------------------------------- */

    return {
      user: {
        id: user.id,

        name: user.name,

        email: user.email,

        role: user.role,
      },

      accessToken,

      refreshToken,
    };
  }
}