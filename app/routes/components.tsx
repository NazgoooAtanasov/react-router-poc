import { Button, HeroCard, Input, Select, type ButtonProps, type HeroCardProps } from '@poc/ui';
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

const countries = ['Bulgaria', 'France', 'Germany', 'United Kingdom'];

const heroCardVariants = [
  { value: 'default', label: 'Default' },
  { value: 'tinted', label: 'Tinted' },
  { value: 'compact', label: 'Compact' },
  { value: 'dark', label: 'Dark' },
] as const;

export default function Components() {
  const [variant, setVariant] = useState<NonNullable<ButtonProps['variant']>>('primary');
  const [size, setSize] = useState<NonNullable<ButtonProps['size']>>('small');
  const [disabled, setDisabled] = useState(false);
  const [activations, setActivations] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [inputDisabled, setInputDisabled] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectDisabled, setSelectDisabled] = useState(false);
  const [heroCardVariant, setHeroCardVariant] = useState<NonNullable<HeroCardProps['variant']>>('default');
  const [heroCardDisabled, setHeroCardDisabled] = useState(false);
  const [heroCardActivations, setHeroCardActivations] = useState(0);

  return (
    <>
      <section className="page-header">
        <p className="eyebrow">Component preview</p>
        <h1>Try the approved components.</h1>
        <p className="lede">
          Explore the Button, Input, Select, and Hero Card in this application. Change
          their values and states to try the approved shared UI components.
        </p>
      </section>
      <section className="component-preview" aria-labelledby="button-preview-heading">
        <h2 className="component-preview__title" id="button-preview-heading">
          Button
        </h2>
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
            Disable Button
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
      <section className="component-preview" aria-labelledby="input-preview-heading">
        <h2 className="component-preview__title" id="input-preview-heading">
          Input
        </h2>
        <div className="component-controls">
          <label>
            <input
              type="checkbox"
              checked={inputDisabled}
              onChange={(event) => setInputDisabled(event.currentTarget.checked)}
            />
            Disable Input
          </label>
        </div>
        <div className="component-preview__canvas">
          <Input
            label="Name"
            placeholder="Enter your name"
            hint="Use the name you want others to see."
            autoComplete="name"
            value={inputValue}
            disabled={inputDisabled}
            onChange={(event) => setInputValue(event.currentTarget.value)}
          />
          <p className="component-preview__status" role="status">
            {inputValue ? `Current value: ${inputValue}` : 'No name entered.'}
          </p>
        </div>
      </section>
      <section className="component-preview" aria-labelledby="select-preview-heading">
        <h2 className="component-preview__title" id="select-preview-heading">
          Select
        </h2>
        <div className="component-controls">
          <label>
            <input
              type="checkbox"
              checked={selectDisabled}
              onChange={(event) => setSelectDisabled(event.currentTarget.checked)}
            />
            Disable Select
          </label>
        </div>
        <div className="component-preview__canvas">
          <Select
            label="Country"
            hint="Choose where you live."
            value={selectedCountry}
            disabled={selectDisabled}
            onChange={(event) => setSelectedCountry(event.currentTarget.value)}
          >
            {countries.map((country) => (
              <option key={country} value={country}>{country}</option>
            ))}
          </Select>
          <p className="component-preview__status" role="status">
            {selectedCountry ? `Selected country: ${selectedCountry}.` : 'No country selected.'}
          </p>
        </div>
      </section>
      <section className="component-preview" aria-labelledby="hero-card-preview-heading">
        <h2 className="component-preview__title" id="hero-card-preview-heading">
          Hero Card
        </h2>
        <div className="component-controls">
          <fieldset>
            <legend>Style</legend>
            {heroCardVariants.map((option) => (
              <label key={option.value}>
                <input
                  type="radio"
                  name="hero-card-variant"
                  checked={heroCardVariant === option.value}
                  onChange={() => setHeroCardVariant(option.value)}
                />
                {option.label}
              </label>
            ))}
          </fieldset>
          <label>
            <input
              type="checkbox"
              checked={heroCardDisabled}
              onChange={(event) => setHeroCardDisabled(event.currentTarget.checked)}
            />
            Disable Hero Card action
          </label>
        </div>
        <div className="component-preview__canvas">
          <HeroCard
            variant={heroCardVariant}
            headingLevel={3}
            buttonProps={{
              disabled: heroCardDisabled,
              onClick: () => setHeroCardActivations((count) => count + 1),
            }}
          />
          <p className="component-preview__status" role="status">
            Get started activated {heroCardActivations} {heroCardActivations === 1 ? 'time' : 'times'}.
          </p>
        </div>
      </section>
    </>
  );
}
