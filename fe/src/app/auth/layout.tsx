export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <h1>This is the layout of auth</h1>
      {children}
    </div>
  );
}
