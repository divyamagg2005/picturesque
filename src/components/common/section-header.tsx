import type { ReactNode } from "react";

type SectionHeaderProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  headingId?: string;
};

export function SectionHeader({ title, description, action, headingId }: SectionHeaderProps) {
  return (
    <div className="section-header">
      <div>
        <h2 id={headingId}>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {action}
    </div>
  );
}