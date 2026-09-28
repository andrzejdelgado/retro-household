// The TV app: dark, full screen, no parent chrome (docs/06-screen-specs.md §4).
export default function TvLayout({ children }: LayoutProps<"/tv">) {
  return (
    <div className="dark bg-background text-foreground min-h-dvh">
      {children}
    </div>
  );
}
