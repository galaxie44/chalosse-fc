import { z } from "zod";

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Adresse email invalide.")
  .max(254);

export const passwordSchema = z
  .string()
  .min(6, "Le mot de passe doit faire au moins 6 caractères.")
  .max(72, "Mot de passe trop long.");

export const nameSchema = z
  .string()
  .trim()
  .min(1, "Champ obligatoire.")
  .max(80)
  .regex(/^[\p{L}\p{M}\s'-]+$/u, "Caractères non autorisés.");

export const positionSchema = z.enum([
  "Gardien",
  "Défenseur",
  "Milieu",
  "Attaquant",
  "Coach",
]);

export const teamSchema = z.enum(["premiere", "reserve"]);

export const opponentSchema = z
  .string()
  .trim()
  .min(1, "Champ obligatoire.")
  .max(80)
  .regex(/^[\p{L}\p{M}0-9\s'.-]+$/u, "Caractères non autorisés.");

export const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date invalide.")
  .refine((v) => {
    const d = new Date(`${v}T00:00:00Z`);
    return !Number.isNaN(d.getTime());
  }, "Date invalide.");

export const uuidSchema = z.string().uuid();

export const signupSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1).max(72),
});
