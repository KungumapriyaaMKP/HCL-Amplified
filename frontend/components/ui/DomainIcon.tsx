import {
  IconCode,
  IconChartBar,
  IconBrain,
  IconCloud,
  IconDeviceMobile,
  IconShieldLock,
  IconCompass,
} from "@tabler/icons-react";

export function DomainIcon({ id, className = "h-5 w-5" }: { id?: string; className?: string }) {
  switch (id) {
    case "web-dev":
      return <IconCode className={className} />;
    case "data-science":
      return <IconChartBar className={className} />;
    case "ai-ml":
      return <IconBrain className={className} />;
    case "cloud-devops":
      return <IconCloud className={className} />;
    case "mobile-dev":
      return <IconDeviceMobile className={className} />;
    case "cybersecurity":
      return <IconShieldLock className={className} />;
    default:
      return <IconCompass className={className} />;
  }
}
