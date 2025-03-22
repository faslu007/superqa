import { redirect, type ActionFunctionArgs, type MetaFunction, type LoaderFunctionArgs } from "@remix-run/node";
import { Form, useActionData, useNavigation, useSearchParams } from "@remix-run/react";
import { Button, Input, Card, CardBody, CardHeader } from "@heroui/react";
import { useState } from "react";
import AppLogo from "~/components/appLogo";
import { EyeFilledIcon, EyeSlashFilledIcon, MailIcon, PasswordIcon } from "~/components/Icons";
import AuthSkeleton from "~/components/AuthSkeleton";
import { compareHash } from "~/utils/hash.server";
import { db } from "~/utils/db.server";
import { createUserSession, getUserId } from "~/utils/session.server";

export const meta: MetaFunction = () => [
    { title: "Super QA - Sign In" },
    { name: "description", content: "Sign in to your Super QA account" },
];

export async function loader({ request }: LoaderFunctionArgs) {
    const userId = await getUserId(request);
    if (userId) {
        return redirect("/");
    }
    return null;
}

type ActionData = { error: string } | Response;

export async function action({ request }: ActionFunctionArgs): Promise<ActionData> {
    const formData = await request.formData();
    const email = formData.get("email")?.toString();
    const password = formData.get("password")?.toString();

    if (!email || !password) {
        return { error: "Invalid form data" };
    }

    try {
        const user = await db.user.findUnique({ where: { email } });
        if (!user) {
            return { error: "Invalid email or password" };
        }

        const isValidPassword = await compareHash(password, user.password);
        if (!isValidPassword) {
            return { error: "Invalid email or password" };
        }

        // Create session and redirect to home
        return createUserSession(user.id, "/");
    } catch (error) {
        console.error("Login error:", error);
        return { error: "Failed to sign in" };
    }
}

export default function SignIn() {
    const navigation = useNavigation();
    const actionData = useActionData<typeof action>();
    const [searchParams] = useSearchParams();
    const [passwordVisible, setPasswordVisible] = useState(false);
    const isSubmitting = navigation.state === "submitting";
    const verified = searchParams.get("verified");

    return (
        <>
            {isSubmitting ? (
                <AuthSkeleton />
            ) : (
                <div className="flex min-h-screen justify-center items-center bg-gray-50 dark:bg-gray-900">
                    <Card className="w-full max-w-md p-8 space-y-8">
                        <CardHeader className="flex flex-col gap-1 items-center">
                            <div className="w-28 h-28">
                                <AppLogo />
                            </div>
                            <h1 className="text-2xl font-bold">Welcome Back</h1>
                            <p className="text-sm text-gray-500">
                                Sign in to your account
                            </p>
                        </CardHeader>
                        <CardBody>
                            <Form method="post" className="space-y-4">
                                {actionData?.error && (
                                    <div className="text-danger text-sm text-center">{actionData.error}</div>
                                )}
                                {verified && (
                                    <div className="text-success text-sm text-center">
                                        Email verified successfully! Please sign in.
                                    </div>
                                )}

                                <Input
                                    id="email"
                                    label="Email"
                                    name="email"
                                    type="email"
                                    required
                                    placeholder="Enter your email"
                                    startContent={<MailIcon className="text-2xl text-default-400" />}
                                />

                                <Input
                                    startContent={<PasswordIcon className="text-2xl text-default-400" />}
                                    endContent={
                                        <button type="button" onClick={() => setPasswordVisible(prev => !prev)}>
                                            {passwordVisible ?
                                                <EyeSlashFilledIcon className="text-2xl text-default-400" /> :
                                                <EyeFilledIcon className="text-2xl text-default-400" />
                                            }
                                        </button>
                                    }
                                    label="Password"
                                    placeholder="Enter your password"
                                    type={passwordVisible ? "text" : "password"}
                                    name="password"
                                    required
                                />

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <input type="checkbox" id="remember" name="remember" className="rounded border-gray-300" />
                                        <label htmlFor="remember" className="text-sm text-gray-700 dark:text-gray-200">
                                            Remember me
                                        </label>
                                    </div>
                                    <a href="#" className="text-sm font-medium text-primary-600 hover:text-primary-500">
                                        Forgot your password?
                                    </a>
                                </div>

                                <Button type="submit" color="primary" className="w-full mb-8">
                                    Sign In
                                </Button>
                            </Form>
                            <br />
                            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                                Don't have an account? <a href="/signup" className="font-medium text-primary-600 hover:text-primary-500">Sign up</a>
                            </p>
                        </CardBody>
                    </Card>
                </div>
            )}
        </>
    );
}

