import Image from "next/image";

export function AuthBrand({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="auth-brand">
      <Image
        src="/chalosse.webp"
        alt=""
        width={72}
        height={72}
        className="auth-logo"
        priority
      />
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </div>
  );
}
