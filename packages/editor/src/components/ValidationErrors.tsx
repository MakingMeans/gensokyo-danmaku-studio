interface ValidationErrorsProps {
  readonly errors: readonly string[];
}

export function ValidationErrors({ errors }: ValidationErrorsProps) {
  if (errors.length === 0) {
    return <p className="status ok">Pattern is valid.</p>;
  }
  return (
    <div className="status error">
      <p>The preview shows the last valid pattern. Fix these to update it:</p>
      <ul>
        {errors.map((error) => (
          <li key={error}>
            <code>{error}</code>
          </li>
        ))}
      </ul>
    </div>
  );
}
