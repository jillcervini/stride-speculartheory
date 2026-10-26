import DateRangeSelect from './DateRangeSelect.jsx';

/** Brand and the one global control: the date range. */
export default function Header({ range, onRangeChange }) {
  return (
    <header className="header">
      <a className="skip-link" href="#main">Skip to content</a>
      <div className="header__inner">
        <p className="brand">
          <span className="brand__mark" aria-hidden="true" />
          Stride
        </p>
        <DateRangeSelect id="range-header" value={range} onChange={onRangeChange} />
      </div>
    </header>
  );
}
