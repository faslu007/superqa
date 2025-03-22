import { InputOtp, Skeleton, Spinner } from "@heroui/react";
import { redirect, type ActionFunctionArgs, type MetaFunction } from "@remix-run/node";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import { db } from "~/utils/db.server";
import { generateOTP } from "~/utils/otp.server";
import { useState } from "react";
import AppLogo from "~/components/appLogo";
import { Input, Button, Checkbox } from "@heroui/react";
import { EyeFilledIcon, EyeSlashFilledIcon, MailIcon, PasswordIcon } from "~/components/Icons";
import AuthSkeleton from "~/components/AuthSkeleton";
import { generateHash } from "~/utils/hash.server";
import { sendOTPEmail } from "~/utils/email.server";

export const meta: MetaFunction = () => [
    { title: "Super QA - Sign Up" },
    { name: "description", content: "Sign up to your Super QA account" },
];

type ActionData =
    | { error: string }
    | { success: true; message: string; data: { email: string; name: string } }
    | Response;

export async function action({ request }: ActionFunctionArgs): Promise<ActionData> {
    const formData = await request.formData();
    const email = formData.get("email")?.toString();
    const password = formData.get("password")?.toString();
    const confirmPassword = formData.get("confirmPassword")?.toString();
    const name = formData.get("name")?.toString();

    if (!email || !password || !confirmPassword || !name) {
        return { error: "Invalid form data" };
    }

    if (password !== confirmPassword) {
        return { error: "Passwords do not match" };
    }

    try {
        // Hash the password before storing
        const hashedPassword = await generateHash(password);

        // Check if user already exists
        const user = await db.user.findUnique({ where: { email } });
        if (user) {
            return { error: "User already exists" };
        }

        // Check if temporary user exists
        const tempUser = await db.tempUser.findUnique({ where: { email } });
        console.log(tempUser);
        if (tempUser) {
            // Delete existing temporary user to allow new signup
            await db.tempUser.delete({ where: { email } });
        }

        const generatedOTP = generateOTP();
        const hashedOTP = await generateHash(generatedOTP);

        // Create user with hashed password
        const newUser = await db.tempUser.create({
            data: {
                name,
                email,
                password: hashedPassword,
                otp: hashedOTP,
            },
        });

        // send email with verification code
        const verificationUrl = `/verify?email=${email}&id=${newUser.id}`;
        await sendOTPEmail(email, generatedOTP, process.env.APP_URL + verificationUrl);
        return redirect(verificationUrl);
    } catch (error) {
        console.error("Error:", error);
        return { error: "Failed to process sign-up" };
    }
}

export default function SignUp() {
    const actionData = useActionData<typeof action>();
    const navigation = useNavigation();
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errors, setErrors] = useState<string[]>([]);

    const toggleVisibility = () => setPasswordVisible((prev) => !prev);
    const toggleConfirmVisibility = () => setConfirmPasswordVisible((prev) => !prev);
    const isSubmitting = navigation.state === "submitting";

    const validatePassword = (value: string) => {
        const newErrors: string[] = [];

        if (value.length < 5) {
            newErrors.push("Password must be at least 5 characters long");
        }
        if (!/[A-Z]/.test(value)) {
            newErrors.push("Password must contain at least one uppercase letter");
        }
        if (!/[a-z]/.test(value)) {
            newErrors.push("Password must contain at least one lowercase letter");
        }
        if (!/[!@#$%^&*]/.test(value)) {
            newErrors.push("Password must contain at least one special character (!@#$%^&*)");
        }

        setErrors(newErrors);
        return newErrors.length === 0;
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setPassword(value);
        validatePassword(value);
    };

    const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setConfirmPassword(value);
        validatePassword(password);
    };

    return (
        <>
            {isSubmitting ? (
                <AuthSkeleton />
            ) : (
                <div className="flex min-h-screen justify-center items-center bg-gray-50 dark:bg-gray-900">
                    <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                        <div className="text-center">
                            <div className="w-28 h-28 mx-auto">
                                <AppLogo />
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Super QA</h1>
                            <p className="text-gray-600 dark:text-gray-400">Register to your account</p>
                        </div>
                        <Form method="post" action="/signup" className="mt-8 space-y-6">
                            {actionData?.error && <div className="text-red-500 text-sm">{actionData.error}</div>}
                            {actionData?.success && <div className="text-green-500 text-sm">{actionData.message}</div>}
                            <div className="space-y-4">
                                <Input
                                    id="name"
                                    label="Name"
                                    name="name"
                                    type="text"
                                    required
                                    placeholder="Enter your name"
                                    disabled={actionData?.success}
                                    defaultValue={actionData?.data?.name}
                                />
                                <Input
                                    id="email"
                                    label="Email"
                                    name="email"
                                    type="email"
                                    required
                                    placeholder="Enter your email"
                                    disabled={actionData?.success}
                                    defaultValue={actionData?.data?.email}
                                    startContent={<MailIcon className="text-2xl text-default-400" />}
                                />
                                <div className="relative">
                                    <Input
                                        startContent={<PasswordIcon className="text-2xl text-default-400" />}
                                        endContent={
                                            <button type="button" onClick={toggleVisibility}>
                                                {passwordVisible ?
                                                    <EyeSlashFilledIcon className="text-2xl text-default-400" /> :
                                                    <EyeFilledIcon className="text-2xl text-default-400" />
                                                }
                                            </button>
                                        }
                                        label="Password"
                                        placeholder="Enter your password"
                                        type={passwordVisible ? "text" : "password"}
                                        value={password}
                                        name="password"
                                        onChange={handlePasswordChange}
                                        errorMessage={() => (
                                            <ul className="list-disc pl-4">
                                                {errors.map((error, i) => (
                                                    <li key={i} className="text-xs text-danger">{error}</li>
                                                ))}
                                            </ul>
                                        )}
                                        isInvalid={errors.length > 0}
                                    />
                                </div>
                                <div className="relative">
                                    <Input
                                        startContent={<PasswordIcon className="text-2xl text-default-400" />}
                                        endContent={
                                            <button type="button" onClick={toggleConfirmVisibility}>
                                                {confirmPasswordVisible ?
                                                    <EyeSlashFilledIcon className="text-2xl text-default-400" /> :
                                                    <EyeFilledIcon className="text-2xl text-default-400" />
                                                }
                                            </button>
                                        }
                                        label="Confirm Password"
                                        placeholder="Confirm your password"
                                        type={confirmPasswordVisible ? "text" : "password"}
                                        value={confirmPassword}
                                        name="confirmPassword"
                                        onChange={handleConfirmPasswordChange}
                                        isInvalid={password !== confirmPassword}
                                    />
                                </div>
                                {actionData?.success && (
                                    <div className="space-y-2">
                                        <label htmlFor="otp" className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                            Verification Code
                                        </label>
                                        <InputOtp length={4} name="otp" required />
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="remember-me" name="remember-me" />
                                    <label htmlFor="remember-me" className="text-sm text-gray-700 dark:text-gray-200">
                                        Remember me
                                    </label>
                                </div>
                                <a href="#" className="text-sm font-medium text-primary-600 hover:text-primary-500">
                                    Forgot your password?
                                </a>
                            </div>
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isSubmitting || errors.length > 0}
                                color="primary"
                            >
                                {actionData?.success ? "Verify Email" : "Sign Up"}
                            </Button>
                        </Form>
                        <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                            Already have an account? <a href="/signin" className="font-medium text-primary-600 hover:text-primary-500">Sign in</a>
                        </p>
                    </div>
                </div>
            )}
        </>
    );
}

