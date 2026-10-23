import type { ReactNode } from 'react';
import {
  isRouteErrorResponse,
  Link,
  Links,
  Meta,
  NavLink,
  Outlet,
  Scripts,
  ScrollRestoration,
} from 'react-router';

import type { Route } from './+types/root';
import './app.css';

export function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <Meta />
        <Links />
      </head>
      <body>
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <div className="app-shell">
          <header className="site-header">
            <Link className="brand" to="/">
              Figma to React<span>Consumer PoC</span>
            </Link>
            <nav aria-label="Main navigation">
              <NavLink className="nav-link" to="/" end>
                Overview
              </NavLink>
              <NavLink className="nav-link" to="/components">
                Components
              </NavLink>
            </nav>
          </header>
          <main id="main-content">{children}</main>
          <footer className="site-footer">
            Shared components, reviewed in the workshop and used here.
          </footer>
        </div>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const notFound = isRouteErrorResponse(error) && error.status === 404;

  return (
    <section className="page-header">
      {notFound && <p className="eyebrow">404</p>}
      <h1>{notFound ? 'Page not found' : 'Something went wrong'}</h1>
      <p className="lede">
        {notFound
          ? 'Choose a page from the navigation to continue.'
          : 'Please return to the overview and try again.'}
      </p>
      <Link className="action-link" to="/">
        Back to overview <span aria-hidden="true">↗</span>
      </Link>
    </section>
  );
}
