interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}
//HERE BY USING EXTENDS WE ARE SAYING{ “My Input component should accept every prop that a normal HTML <input> accepts, plus one extra prop called label.”}
export default function Input({ label, error, ...props }: InputProps) {
  return (
    <div>
      <label htmlFor={props.id}>{label}</label>
      <input {...props} />
      {error && <p>{error}</p>}
      {/* //if error exists then show this line other wise show nothing */}
    </div>
  );
}
