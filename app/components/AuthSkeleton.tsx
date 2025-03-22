import { Skeleton } from "@heroui/react";
import AppLogo from "./appLogo";

export default function AuthSkeleton() {
    return (
        <div className="flex min-h-screen justify-center items-center bg-gray-50 dark:bg-gray-900">
            <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <div className="text-center">
                    <div className="w-28 h-28 mx-auto">
                        <AppLogo />
                    </div>
                    <Skeleton className="h-8 w-32 mx-auto mt-4" />
                    <Skeleton className="h-5 w-48 mx-auto mt-2" />
                </div>
                <div className="space-y-6">
                    <div className="space-y-4">
                        <Skeleton className="h-12 w-full rounded-lg" />
                        <Skeleton className="h-12 w-full rounded-lg" />
                        <Skeleton className="h-12 w-full rounded-lg" />
                        <Skeleton className="h-12 w-full rounded-lg" />
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <Skeleton className="h-4 w-4 rounded" />
                            <Skeleton className="h-4 w-24 rounded" />
                        </div>
                        <Skeleton className="h-4 w-32 rounded" />
                    </div>
                    <Skeleton className="h-10 w-full rounded-lg" />
                    <div className="text-center">
                        <Skeleton className="h-4 w-48 mx-auto rounded" />
                    </div>
                </div>
            </div>
        </div>
    );
}
