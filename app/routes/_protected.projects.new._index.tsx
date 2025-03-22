import { type ActionFunctionArgs, type LoaderFunctionArgs, redirect, json } from "@remix-run/node";
import { Form, useActionData, useNavigation, useNavigate } from "@remix-run/react";
import { Button, Input, Textarea, Card, CardBody, CardHeader, Checkbox, Select, SelectItem } from "@heroui/react";
import { requireUserId } from "~/utils/session.server";
import { db } from "~/utils/db.server";
import { useState, useEffect } from "react";

type ActionData =
    | { success: true; projectId: string }
    | { success: false; error: string };

export async function loader({ request }: LoaderFunctionArgs) {
    await requireUserId(request);
    return null;
}

export async function action({ request }: ActionFunctionArgs) {
    const userId = await requireUserId(request);
    const formData = await request.formData();

    const name = formData.get("name")?.toString();
    const description = formData.get("description")?.toString();
    const defaultEnvironment = formData.get("defaultEnvironment")?.toString();
    const jiraToken = formData.get("jiraToken")?.toString();
    const mattermostToken = formData.get("mattermostToken")?.toString();
    const sentryToken = formData.get("sentryToken")?.toString();
    const emailNotifications = formData.get("emailNotifications") === "on";
    const slackNotifications = formData.get("slackNotifications") === "on";
    const mattermostNotifications = formData.get("mattermostNotifications") === "on";

    if (!name || !description || !defaultEnvironment) {
        return json<ActionData>({ success: false, error: "Please fill in all required fields" }, { status: 400 });
    }

    try {
        const project = await db.project.create({
            data: {
                name,
                description,
                status: "active",
                createdBy: userId,
                defaultEnvironment,
                jiraToken,
                mattermostToken,
                sentryToken,
                emailNotifications,
                slackNotifications,
                mattermostNotifications,
                members: {
                    create: {
                        userId: userId,
                        role: "owner",
                        status: "active",
                        permissions: {
                            canCreateTests: true,
                            canExecuteTests: true,
                            canManageMembers: true,
                            canViewReports: true
                        }
                    }
                }
            },
            include: {
                members: true
            }
        });

        return json<ActionData>({ success: true, projectId: project.id });
    } catch (error) {
        console.error("Project creation error:", error);
        return json<ActionData>({ success: false, error: "Failed to create project" }, { status: 500 });
    }
}

export default function NewProject() {
    const navigation = useNavigation();
    const actionData = useActionData<typeof action>();
    const navigate = useNavigate();
    const isSubmitting = navigation.state === "submitting";
    const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);

    useEffect(() => {
        if (actionData?.success) {
            setNotification({ message: "Project created successfully!", type: "success" });
            setTimeout(() => {
                navigate(`/projects/${actionData.projectId}`);
            }, 2000);
        } else if (actionData?.error) {
            setNotification({ message: actionData.error, type: "error" });
        }
    }, [actionData, navigate]);

    return (
        <div className="max-w-3xl mx-auto px-4 py-6 sm:px-0">
            {notification && (
                <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg ${notification.type === "success" ? "bg-green-500" : "bg-red-500"
                    } text-white`}>
                    {notification.message}
                </div>
            )}

            <Card>
                <CardHeader className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold">Create New Project</h1>
                    <p className="text-sm text-gray-500">
                        Fill in the details to create your new project
                    </p>
                </CardHeader>
                <CardBody>
                    <Form method="post" className="space-y-8">
                        <div className="space-y-6">
                            {/* Basic Information Section */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Basic Information</h3>
                                <Input
                                    label="Project Name"
                                    name="name"
                                    placeholder="Enter project name"
                                    required
                                />

                                <Textarea
                                    label="Description"
                                    name="description"
                                    placeholder="Enter project description"
                                    required
                                />

                                <Select
                                    label="Default Environment"
                                    name="defaultEnvironment"
                                    placeholder="Select default environment"
                                    required
                                >
                                    <SelectItem key="development" textValue="Development">
                                        Development
                                    </SelectItem>
                                    <SelectItem key="staging" textValue="Staging">
                                        Staging
                                    </SelectItem>
                                    <SelectItem key="production" textValue="Production">
                                        Production
                                    </SelectItem>
                                </Select>
                            </div>

                            {/* Integration Tokens Section */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Integration Tokens</h3>
                                <div className="space-y-4">
                                    <Input
                                        label="Jira Token"
                                        name="jiraToken"
                                        placeholder="Enter Jira token"
                                        type="password"
                                    />
                                    <Input
                                        label="Mattermost Token"
                                        name="mattermostToken"
                                        placeholder="Enter Mattermost token"
                                        type="password"
                                    />
                                    <Input
                                        label="Sentry Token"
                                        name="sentryToken"
                                        placeholder="Enter Sentry token"
                                        type="password"
                                    />
                                </div>
                            </div>

                            {/* Notification Preferences Section */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notification Preferences</h3>
                                <div className="space-y-4">
                                    <Checkbox name="emailNotifications">Email Notifications</Checkbox>
                                    <Checkbox name="slackNotifications">Slack Notifications</Checkbox>
                                    <Checkbox name="mattermostNotifications">Mattermost Notifications</Checkbox>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-4 pt-4">
                            <Button
                                type="button"
                                variant="flat"
                                color="danger"
                                onPress={() => window.history.back()}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                color="primary"
                                isLoading={isSubmitting}
                            >
                                Create Project
                            </Button>
                        </div>
                    </Form>
                </CardBody>
            </Card>
        </div>
    );
} 