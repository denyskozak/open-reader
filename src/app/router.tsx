import { lazy, Suspense } from "react";
import { Navigate, useRoutes } from "react-router-dom";

import { PageSkeleton } from "@/shared/ui/PageSkeleton";

const HomeCategoriesPage = lazy(() => import("@/pages/HomeCategories/HomeCategories"));
const CategoryBooksPage = lazy(() => import("@/pages/CategoryBooks/CategoryBooks"));
const BookPage = lazy(() => import("@/pages/BookPage/BookPage"));

export function AppRouter(): JSX.Element {
  const element = useRoutes([
    { path: "/", element: <HomeCategoriesPage /> },
    { path: "/category/:id", element: <CategoryBooksPage /> },
    { path: "/book/:id", element: <BookPage /> },
    { path: "*", element: <Navigate to="/" replace /> },
  ]);

  return <Suspense fallback={<PageSkeleton />}>{element}</Suspense>;
}
