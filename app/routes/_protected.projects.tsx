import { type LoaderFunctionArgs, json } from "@remix-run/node";
import { Outlet, Link, useLoaderData, useLocation } from "@remix-run/react";
import { requireUserId } from "~/utils/session.server";
import { Button, Table, TableHeader, TableBody, TableColumn, TableRow, TableCell, Pagination } from "@heroui/react";
import { PlusIcon, PencilIcon } from "~/components/Icons";
import { db } from "~/utils/db.server";

const ITEMS_PER_PAGE = 10;

export async function loader({ request }: LoaderFunctionArgs) {
    const userId = await requireUserId(request);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");

    const [projects, total] = await Promise.all([
        db.project.findMany({
            where: {
                members: {
                    some: {
                        userId: userId,
                        role: "owner"
                    }
                }
            },
            include: {
                members: {
                    where: {
                        userId: userId
                    },
                    select: {
                        role: true,
                        status: true
                    }
                }
            },
            skip: (page - 1) * ITEMS_PER_PAGE,
            take: ITEMS_PER_PAGE,
            orderBy: {
                createdAt: "desc"
            }
        }),
        db.project.count({
            where: {
                members: {
                    some: {
                        userId: userId,
                        role: "owner"
                    }
                }
            }
        })
    ]);

    return json({ projects, total, totalPages: Math.ceil(total / ITEMS_PER_PAGE), currentPage: page });
}

export default function Projects() {
    const { projects, totalPages, currentPage } = useLoaderData<typeof loader>();
    const location = useLocation();
    const isNewProjectPage = location.pathname === "/projects/new";

    return (
        <div className="max-w-7xl mx-auto">
            <div className="px-4 py-6 sm:px-0">
                {!isNewProjectPage && (
                    <>
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                                    Projects
                                </h1>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                    Manage your projects and their settings
                                </p>
                            </div>
                            <Link to="/projects/new">
                                <Button
                                    color="primary"
                                    startContent={<PlusIcon className="w-4 h-4" />}
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    Create Project
                                </Button>
                            </Link>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                            <Table
                                aria-label="Projects table"
                                className="min-w-full"
                            >
                                <TableHeader>
                                    <TableColumn className="bg-gray-50 dark:bg-gray-900/50">Actions</TableColumn>
                                    <TableColumn className="bg-gray-50 dark:bg-gray-900/50">Name</TableColumn>
                                    <TableColumn className="bg-gray-50 dark:bg-gray-900/50">Description</TableColumn>
                                    <TableColumn className="bg-gray-50 dark:bg-gray-900/50">Environment</TableColumn>
                                    <TableColumn className="bg-gray-50 dark:bg-gray-900/50">Status</TableColumn>
                                    <TableColumn className="bg-gray-50 dark:bg-gray-900/50">Created At</TableColumn>
                                </TableHeader>
                                <TableBody>
                                    {projects.map((project) => (
                                        <TableRow
                                            key={project.id}
                                            className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                                        >
                                            <TableCell>
                                                <Link to={`/projects/${project.id}/edit`}>
                                                    <Button
                                                        isIconOnly
                                                        variant="light"
                                                        color="primary"
                                                        className="hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                                        startContent={<PencilIcon className="w-4 h-4 text-blue-600" />}
                                                    />
                                                </Link>
                                            </TableCell>
                                            <TableCell className="font-medium text-gray-900 dark:text-white">
                                                {project.name}
                                            </TableCell>
                                            <TableCell className="max-w-xs truncate text-gray-600 dark:text-gray-400">
                                                {project.description}
                                            </TableCell>
                                            <TableCell className="text-gray-600 dark:text-gray-400">
                                                {project.defaultEnvironment}
                                            </TableCell>
                                            <TableCell>
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${project.status === "active"
                                                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                                    : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                                                    }`}>
                                                    {project.status}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-gray-600 dark:text-gray-400">
                                                {new Date(project.createdAt).toLocaleDateString()}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            <div className="flex justify-end py-4 px-4 border-t border-gray-200 dark:border-gray-700">
                                <Pagination
                                    total={totalPages}
                                    page={currentPage}
                                    onChange={(page) => {
                                        window.location.href = `/projects?page=${page}`;
                                    }}
                                    showControls
                                    color="primary"
                                    className="gap-2"
                                />
                            </div>
                        </div>
                    </>
                )}

                <Outlet />
            </div>
        </div>
    );
} 