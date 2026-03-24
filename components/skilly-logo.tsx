export function SkillyLogo({ className = "h-8 w-auto" }: { className?: string }) {
  return (
    <img
      src="/skilly-logo.svg"
      alt="Skilly"
      className={className}
    />
  );
}
