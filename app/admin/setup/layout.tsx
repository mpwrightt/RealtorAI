// Override the admin layout for the setup page
// This allows non-admins to access the setup page
export default function SetupLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen">{children}</div>;
}
