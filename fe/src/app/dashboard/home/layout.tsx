export default function HomeLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <div className="flex">{children}</div>;
}
