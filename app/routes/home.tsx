import { Link, type MetaFunction } from 'react-router';

export const meta: MetaFunction = () => [
  { title: 'Overview | Figma to React PoC' },
  {
    name: 'description',
    content: 'A React Router application for trying approved shared UI components.',
  },
];

export default function Home() {
  return (
    <>
      <section className="page-header">
        <p className="eyebrow">Figma to React · Proof of concept</p>
        <h1>See approved UI in a working application.</h1>
        <p className="lede">
          This is the consumer app. Use it to try shared components alongside
          page layouts and navigation after reviewing them in Storybook.
        </p>
        <Link className="action-link" to="/components">
          Open component preview <span aria-hidden="true">↗</span>
        </Link>
      </section>
      <aside className="handoff-note">
        <h2>One shared implementation</h2>
        <p>
          Component source lives in the workshop. After approval, a versioned
          package archive brings that implementation into this application.
        </p>
      </aside>
    </>
  );
}
