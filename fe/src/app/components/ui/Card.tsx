interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export default function Card({
  children,
  className = "",
  ...props
}: CardProps) {
  return (
    <div
      className={`
        rounded-2xl
        border
        border-zinc-200/80
        bg-white
        p-6
        shadow-sm
        shadow-zinc-900/5
        ring-1
        ring-black/[0.02]
        transition-shadow
        duration-300
        dark:border-zinc-800
        dark:bg-zinc-900
        dark:shadow-none
        dark:ring-white/[0.03]
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}
