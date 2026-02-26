import bcrypt from "bcryptjs";
import { findActiveAdminByEmail } from "../repositories/admin-users.repo.js";
import { signAdminToken } from "../plugins/auth.js";
export class AuthError extends Error {
}
export async function loginAdmin(prisma, input) {
    const admin = await findActiveAdminByEmail(prisma, input.email);
    if (!admin)
        throw new AuthError("Invalid credentials.");
    const isValid = await bcrypt.compare(input.password, admin.passwordHash);
    if (!isValid)
        throw new AuthError("Invalid credentials.");
    const token = signAdminToken({
        sub: admin.id,
        email: admin.email,
        role: admin.role,
    });
    return {
        token,
        admin: {
            id: admin.id,
            name: admin.name,
            email: admin.email,
            role: admin.role,
        },
    };
}
