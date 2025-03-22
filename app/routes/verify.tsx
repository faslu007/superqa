import { type ActionFunctionArgs, type LoaderFunctionArgs, redirect } from "@remix-run/node";
import { Form, useActionData, useLoaderData, useNavigation } from "@remix-run/react";
import { Button, Input, Card, CardBody, CardHeader } from "@heroui/react";
import { InputOtp } from "@heroui/react";
import { db } from "~/utils/db.server";
import { compareHash } from "~/utils/hash.server";
import AuthSkeleton from "~/components/AuthSkeleton";
import AppLogo from "~/components/appLogo";
import { createUserSession } from "~/utils/session.server";

export async function loader({ request }: LoaderFunctionArgs) {
    const url = new URL(request.url);
    const email = url.searchParams.get("email");
    const id = url.searchParams.get("id");

    if (!email || !id) {
        return redirect("/signup");
    }

    return { email, id };
}

export async function action({ request }: ActionFunctionArgs) {
    const formData = await request.formData();
    const otp = formData.get("otp");
    const email = formData.get("email");
    const id = formData.get("id");

    if (!otp || !email || !id || typeof otp !== "string" || typeof email !== "string" || typeof id !== "string") {
        return { error: "Invalid verification data" };
    }

    try {
        const tempUser = await db.tempUser.findUnique({
            where: { id },
        });

        if (!tempUser) {
            return { error: "Invalid verification link" };
        }

        const isValidOTP = await compareHash(otp, tempUser.otp);

        if (!isValidOTP) {
            return { error: "Invalid verification code" };
        }

        // Create permanent user
        const user = await db.user.create({
            data: {
                name: tempUser.name,
                email: tempUser.email,
                password: tempUser.password,
            },
        });

        // Delete temporary user
        await db.tempUser.delete({
            where: { id },
        });

        // Create session and redirect to home
        return createUserSession(user.id, "/");
    } catch (error) {
        console.error("Verification error:", error);
        return { error: "Failed to verify email" };
    }
}

export default function Verify() {
    const navigation = useNavigation();
    const { email, id } = useLoaderData<typeof loader>();
    const actionData = useActionData<typeof action>();
    const isSubmitting = navigation.state === "submitting";

    return (
        <>
            {
                isSubmitting ? (
                    <AuthSkeleton />
                ) : (
                    <div className="flex min-h-screen justify-center items-center bg-gray-50 dark:bg-gray-900">
                        <Card className="w-full max-w-md">
                            <CardHeader className="flex flex-col gap-1 items-center">
                                <div className="w-28 h-28">
                                    <AppLogo />
                                </div>
                                <h1 className="text-2xl font-bold">Verify Your Email</h1>
                                <p className="text-sm text-gray-500">
                                    We've sent a verification code to {email}
                                </p>
                            </CardHeader>
                            <CardBody>
                                <Form method="post" className="space-y-4">
                                    <input type="hidden" name="email" value={email} />
                                    <input type="hidden" name="id" value={id} />

                                    {actionData?.error && (
                                        <div className="text-danger text-sm text-center">{actionData.error}</div>
                                    )}

                                    <div className="flex flex-col items-center justify-center space-y-4">
                                        <label className="text-sm font-medium text-center">Enter the code sent to your email</label>
                                        <div className="flex justify-center w-full">
                                            <InputOtp
                                                length={4}
                                                name="otp"
                                                required
                                                classNames={{
                                                    input: "w-12 h-12 text-center text-xl font-semibold",
                                                    wrapper: "gap-2"
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <Button type="submit" color="primary" className="w-full mb-4">
                                        Verify Email
                                    </Button>
                                </Form>
                            </CardBody>
                        </Card>
                    </div>
                )
            }
        </>
    );
} 