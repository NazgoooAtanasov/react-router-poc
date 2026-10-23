import type { MetaFunction } from 'react-router';

export const meta: MetaFunction = () => [
  { title: 'Components | Figma to React PoC' },
  {
    name: 'description',
    content: 'The application preview for approved components from the UI workshop.',
  },
];

export default function Components() {
  return (
    <>
      <section className="page-header">
        <p className="eyebrow">Component preview</p>
        <h1>A place for the approved components.</h1>
        <p className="lede">
          This route is the integration point for the shared UI library.
        </p>
      </section>
      <section className="empty-preview" aria-labelledby="preview-status">
        <div>
          <p className="eyebrow">Ready for the package handoff</p>
          <h2 id="preview-status">Waiting for the first approved component</h2>
          <p>
            After the Button is reviewed in Storybook, its local package archive
            will provide the component shown here.
          </p>
        </div>
      </section>
    </>
  );
}
