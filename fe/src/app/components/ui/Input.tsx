interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}
//HERE BY USING EXTENDS WE ARE SAYING{ “My Input component should accept every prop that a normal HTML <input> accepts, plus one extra prop called label.”}
export default function Input({ label, ...props }: InputProps) {
  return (
    <div>
      <label htmlFor={props.id}>{label}</label>
      <input {...props} />
    </div>
  );
}
