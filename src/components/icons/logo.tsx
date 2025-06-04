import { Video } from 'lucide-react';
import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement> & { showText?: boolean }) {
  const { showText = true, ...svgProps } = props;
  // Using a wrapper div for icon background and text for easier styling with Tailwind.
  // The SVG props are not directly applicable here, consider if specific SVG attributes are needed.
  return (
    <div className="flex items-center" aria-label="VibeEdit AI Logo">
      <div className="bg-primary p-1.5 rounded-lg flex items-center justify-center">
        <Video className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
      </div>
      {showText && (
        <span className="ml-2 text-xl font-headline font-semibold text-foreground">
          VibeEdit AI
        </span>
      )}
    </div>
  );
}
