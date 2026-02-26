import jwt from "jsonwebtoken";
import { env } from "../env.js";
function extractBearerToken(header) {
    if (!header)
        return null;
    const [scheme, token] = header.split(" ");
    if (scheme?.toLowerCase() !== "bearer" || !token)
        return null;
    return token;
}
export function signAdminToken(payload) {
    const expiresIn = env.JWT_EXPIRES_IN;
    return jwt.sign(payload, env.JWT_SECRET, {
        expiresIn,
    });
}
export async function registerAuth(app) {
    app.decorate("authenticate", async function authenticate(request, reply) {
        const token = extractBearerToken(request.headers.authorization);
        if (!token) {
            reply.code(401).send({ message: "Missing bearer token." });
            return;
        }
        try {
            const decoded = jwt.verify(token, env.JWT_SECRET);
            request.adminUser = decoded;
        }
        catch {
            reply.code(401).send({ message: "Invalid or expired token." });
        }
    });
}
