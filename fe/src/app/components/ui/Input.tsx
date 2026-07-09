interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}
//HERE BY USING EXTENDS WE ARE SAYING{ “My Input component should accept every prop that a normal HTML <input> accepts, plus one extra prop called label.”}
export default function Input({
  label,
  error,
  className,
  ...props
}: InputProps) {
  return (
    <div className="space-y-2">
      <label
        className="block text-sm font-medium text-gray-700 dark:text-gray-200"
        htmlFor={props.id}
      >
        {label}
      </label>
      <input
        className={`w-full rounded-lg border border-zinc-200 bg-white px-4 py-2 text-zinc-900 placeholder:text-zinc-400 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-900 dark:border-zinc-700 dark:text-white dark:placeholder:text-zinc-500 ${className} ${
          error
            ? "border-red-500 focus:ring-red-500/40"
            : "border-zinc-200 focus:ring-indigo-500/40"
        }`}
        {...props}
      />

      {error && (
        <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
      )}
      {/* //if error exists then show this line other wise show nothing */}
    </div>
  );
}
