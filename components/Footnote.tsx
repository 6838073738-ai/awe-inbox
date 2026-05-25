type Props = {
  index: number;
  href: string;
  label: string;
};

export function Footnote({ index, href, label }: Props) {
  return (
    <li className="grid grid-cols-[2rem_1fr] items-baseline gap-4 py-2">
      <span className="mono text-[var(--color-faded)] tabular-nums">
        [{index}]
      </span>
      <a
        href={href}
        rel="noopener noreferrer"
        target="_blank"
        className="underline decoration-[color-mix(in_oklab,var(--accent)_55%,transparent)] underline-offset-[5px] hover:decoration-[var(--accent)] transition-[text-decoration-color] duration-300"
        style={{ textDecorationThickness: "1px" }}
      >
        {label}
      </a>
    </li>
  );
}
