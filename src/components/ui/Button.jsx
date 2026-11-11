const variants = {
  primary: 'border border-brand bg-brand text-white hover:bg-[#92203e]',
  secondary: 'border border-line bg-white text-ink hover:bg-surface',
};
export default function Button({ children, href, variant = 'primary', className = '', type = 'button', ...props }) {
  const classes = `inline-flex min-h-12 items-center justify-center rounded-lg px-4 py-3 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant] ?? variants.primary} ${className}`;
  if (href) return <a href={href} className={classes} {...props}>{children}</a>;
  return <button type={type} className={classes} {...props}>{children}</button>;
}
