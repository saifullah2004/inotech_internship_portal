import Image from 'next/image';
import Link from 'next/link';

interface LogoProps {
  iconOnly?: boolean;
  width?: number;
  height?: number;
  className?: string;
  href?: string;
}

export default function Logo({
  iconOnly = false,
  width,
  height,
  className = '',
  href,
}: LogoProps) {
  const defaultWidth = iconOnly ? 40 : 180;
  const defaultHeight = iconOnly ? 48 : 48;
  const src = iconOnly ? '/icon.svg' : '/logo.svg';
  const alt = iconOnly ? 'Inotech Logo Icon' : 'Inotech Solutions Logo';

  const content = (
    <div className={`relative flex items-center justify-center ${className}`}>
      <Image
        src={src}
        alt={alt}
        width={width ?? defaultWidth}
        height={height ?? defaultHeight}
        priority
        className="object-contain"
      />
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
