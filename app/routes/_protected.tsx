import { Outlet, Link, useLocation } from "@remix-run/react";
import { Button } from "@heroui/react";
import {
    HomeIcon,
    SettingsIcon,
    UsersIcon,
    LogoutIcon,
    MenuIcon,
    CloseIcon,
    FolderIcon
} from "~/components/Icons";
import { useState } from "react";
import AppLogo from "~/components/appLogo";
import { type LoaderFunctionArgs, redirect } from "@remix-run/node";
import { requireUserId } from "~/utils/session.server";

export async function loader({ request }: LoaderFunctionArgs) {
    await requireUserId(request);
    return null;
}

export default function ProtectedLayout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const location = useLocation();

    const navigation = [
        { name: "Dashboard", href: "/", icon: HomeIcon },
        { name: "Projects", href: "/projects", icon: FolderIcon },
        { name: "Users", href: "/users", icon: UsersIcon },
        { name: "Settings", href: "/settings", icon: SettingsIcon },
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-200 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex flex-col h-full">
                    {/* Top Section */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8">
                                <AppLogo />
                            </div>
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Super QA</h1>
                        </div>
                        <Button
                            isIconOnly
                            variant="light"
                            onClick={() => setIsSidebarOpen(false)}
                            className="lg:hidden"
                        >
                            <CloseIcon className="text-gray-500" />
                        </Button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-1">
                        {navigation.map((item) => {
                            const isActive = location.pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className={`flex items-center px-4 py-2 rounded-lg transition-colors ${isActive
                                        ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400'
                                        : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                                        }`}
                                >
                                    <item.icon className={`w-5 h-5 mr-3 ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'}`} />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Bottom Section */}
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                        <form action="/logout" method="post">
                            <Button
                                type="submit"
                                variant="light"
                                color="danger"
                                className="w-full justify-start"
                            >
                                <LogoutIcon className="w-5 h-5 mr-3" />
                                Logout
                            </Button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className={`${isSidebarOpen ? 'lg:ml-64' : ''} transition-margin duration-200 ease-in-out`}>
                {/* Mobile Header */}
                <div className="lg:hidden bg-white dark:bg-gray-800 shadow-sm">
                    <div className="flex items-center justify-between p-4">
                        <Button
                            isIconOnly
                            variant="light"
                            onClick={() => setIsSidebarOpen(true)}
                        >
                            <MenuIcon className="text-gray-500" />
                        </Button>
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8">
                                <AppLogo />
                            </div>
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Super QA</h1>
                        </div>
                    </div>
                </div>

                {/* Page Content */}
                <main className="p-4">
                    <Outlet />
                </main>
            </div>
        </div>
    );
} 