import { Outlet } from "@remix-run/react";

export default function NewProjectLayout() {
    return (
        <div className="max-w-7xl mx-auto">
            <div className="px-4 py-6 sm:px-0">
                <Outlet />
            </div>
        </div>
    );
} 