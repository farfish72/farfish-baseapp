interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 bg-slate-900/80 backdrop-blur-md border-b border-white/10">
      <div className="container mx-auto px-4 py-4 max-w-lg">
        <h1 className="text-xl font-bold text-white">{title}</h1>
      </div>
    </header>
  );
}