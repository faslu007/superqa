import { type LoaderFunctionArgs, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { requireUserId } from "~/utils/session.server";
import { db } from "~/utils/db.server";

export async function loader({ request }: LoaderFunctionArgs) {
	const userId = await requireUserId(request);
	if (!userId) {
		throw redirect("/signin");
	}

	const user = await db.user.findUnique({
		where: { id: userId },
		select: { id: true, name: true, email: true }
	});

	if (!user) {
		throw redirect("/signin");
	}

	return { user };
}

export default function Index() {
	const { user } = useLoaderData<typeof loader>();

	return (
		<div className="max-w-7xl mx-auto">
			<div className="px-4 py-6 sm:px-0">
				<h1 className="text-3xl font-bold text-gray-900 dark:text-white">
					Welcome, {user.name}!
				</h1>
				<p className="mt-4 text-gray-600 dark:text-gray-400">
					You are signed in as {user.email}
				</p>
			</div>
		</div>
	);
}