import { type LoaderFunctionArgs } from "@remix-run/node";
import { requireUserId } from "~/utils/session.server";

export async function loader({ request }: LoaderFunctionArgs) {
    await requireUserId(request);
    return null;
}

export default function Projects() {
    return (
        <div className="max-w-7xl mx-auto">
            <div className="px-4 py-6 sm:px-0">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Projects
                </h1>
                <p className="mt-4 text-gray-600 dark:text-gray-400">
                    Your projects will appear here.
                </p>
            </div>
        </div>
    );
} 