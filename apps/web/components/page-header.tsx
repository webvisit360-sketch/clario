interface PageHeaderProps {
  title: string;
  badge?: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, badge, children }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        {badge && (
          <span className="text-xs font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
            {badge}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}
