import { createCookieSessionStorage, redirect } from "@remix-run/node";
import { db } from "~/utils/db.server";

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
    throw new Error("SESSION_SECRET must be set");
}

const storage = createCookieSessionStorage({
    cookie: {
        name: "superqa_session",
        secure: process.env.NODE_ENV === "production",
        secrets: [sessionSecret],
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30, // 30 days
        httpOnly: true,
    },
});

export async function createUserSession(userId: string, redirectTo: string) {
    const session = await storage.getSession();
    session.set("userId", userId);
    return redirect(redirectTo, {
        headers: {
            "Set-Cookie": await storage.commitSession(session),
        },
    });
}

export async function getUserSession(request: Request) {
    return storage.getSession(request.headers.get("Cookie"));
}

export async function getUserId(request: Request) {
    const session = await getUserSession(request);
    const userId = session.get("userId");
    if (!userId || typeof userId !== "string") return null;
    return userId;
}

export async function requireUserId(request: Request, redirectTo: string = new URL(request.url).pathname) {
    const session = await getUserSession(request);
    const userId = session.get("userId");

    if (!userId || typeof userId !== "string") {
        const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
        throw redirect(`/signin?${searchParams}`);
    }

    try {
        const user = await db.user.findFirst({
            where: { id: userId }
        });

        if (!user) {
            throw redirect("/signin", {
                headers: {
                    "Set-Cookie": await storage.destroySession(session),
                },
            });
        }

        return userId;
    } catch (error) {
        console.error("Database error:", error);
        throw redirect("/signin", {
            headers: {
                "Set-Cookie": await storage.destroySession(session),
            },
        });
    }
}

export async function logout(request: Request) {
    const session = await getUserSession(request);
    return redirect("/signin", {
        headers: {
            "Set-Cookie": await storage.destroySession(session),
        },
    });
} 