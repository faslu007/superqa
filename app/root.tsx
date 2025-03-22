import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import "./styles/theme.css";
import { Providers } from "./providers";

export function links() {
  return [{ rel: "stylesheet", href: "/styles/theme.css" }];
}

export default function App() {
  return (
    <html lang="en" data-theme="light">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Scripts />
        <ScrollRestoration />
        <div id="root">
          <Providers>
            <Outlet />
          </Providers>
        </div>
        <LiveReload />
      </body>
    </html>
  );
}
