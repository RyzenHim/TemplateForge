export default function ProfileLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <div className="flex">{children}</div>;
}
