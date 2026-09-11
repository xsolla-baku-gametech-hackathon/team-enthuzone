export function ConfidenceGauge({ value }: { value: number }) {
  return <div aria-label={`${value}% correlation confidence`}>