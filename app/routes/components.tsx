import { Button, type ButtonProps } from '@poc/ui';
import { useState } from 'react';
import type { MetaFunction } from 'react-router';

export const meta: MetaFunction = () => [
  { title: 'Components | Figma to React PoC' },
  {
    name: 'description',
    content: 'The application preview for approved components from the UI workshop.',
  },
];

const variants = [
  { value: 'primary', label: 'Primary' },
  { value: 'secondary', label: 'Secondary' },
] as const;

const sizes = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
] as const;

export default function Components() {
  const [variant, setVariant] = useState<NonNullable<ButtonProps['variant']>>('primary');
  const [size, setSize] = useState<NonNullable<ButtonProps['size']>>('small');
  const [disabled, setDisabled] = useState(false);
  const [activations, setActivations] = useState(0);

  return (
    <>
      <section className="page-header">
        <p className="eyebrow">Component preview</p>
        <h1>Try the approved Button.</h1>
        <p className="lede">
          Choose a variant and size, then try the Button in this application.
          Its implementation comes from the approved shared UI library.
        </p>
      </section>
      <section className="component-preview" aria-label="Button preview">
        <div className="component-controls">
          <fieldset>
            <legend>Variant</legend>
            {variants.map((option) => (
              <label key={option.value}>
                <input
                  type="radio"
                  name="variant"
                  checked={variant === option.value}
                  onChange={() => setVariant(option.value)}
                />
                {option.label}
              </label>
            ))}
          </fieldset>
          <fieldset>
            <legend>Size</legend>
            {sizes.map((option) => (
              <label key={option.value}>
                <input
                  type="radio"
                  name="size"
                  checked={size === option.value}
                  onChange={() => setSize(option.value)}
                />
                {option.label}
              </label>
            ))}
          </fieldset>
          <label>
            <input
              type="checkbox"
              checked={disabled}
              onChange={(event) => setDisabled(event.currentTarget.checked)}
            />
            Disable preview
          </label>
        </div>
        <div className="component-preview__canvas">
          <div className="component-preview__actions">
            <Button
              label="Continue"
              variant={variant}
              size={size}
              disabled={disabled}
              onClick={() => setActivations((count) => count + 1)}
            />
            <Button
              label="Reset count"
              variant="secondary"
              size={size}
              disabled={activations === 0}
              onClick={() => setActivations(0)}
            />
          </div>
          <p className="component-preview__status" role="status">
            Continue activated {activations} {activations === 1 ? 'time' : 'times'}.
          </p>
          <p className="component-preview__hint">
            Use Tab to focus the buttons, then Enter or Space to activate them.
          </p>
        </div>
      </section>
    </>
  );
}
