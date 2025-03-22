import bcrypt from "bcryptjs";

/**
 * Generates a hash for the given password using bcrypt
 * @param password The plain text password to hash
 * @param saltRounds Number of salt rounds (default: 10)
 * @returns Promise<string> The hashed password
 */
export async function generateHash(password: string, saltRounds: number = 10): Promise<string> {
    return bcrypt.hash(password, saltRounds);
}

/**
 * Compares a plain text password with a hashed password
 * @param password The plain text password to compare
 * @param hashedPassword The hashed password to compare against
 * @returns Promise<boolean> True if passwords match, false otherwise
 */
export async function compareHash(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
}
