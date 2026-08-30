import {
  IconCode,
  IconChartBar,
  IconBrain,
  IconCloud,
  IconDeviceMobile,
  IconShieldLock,
  IconSparkles,
  IconDatabase,
  IconServer2,
  IconCpu,
  IconActivity,
  IconBriefcase,
  IconChecklist,
  IconLink,
  IconServerBolt,
  IconBuildingStore,
  IconDeviceGamepad2,
  IconPalette,
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
    case "gen-ai":
      return <IconSparkles className={className} />;
    case "data-engineering":
      return <IconDatabase className={className} />;
    case "enterprise-fullstack":
      return <IconServer2 className={className} />;
    case "embedded-iot":
      return <IconCpu className={className} />;
    case "sre-observability":
      return <IconActivity className={className} />;
    case "product-management":
      return <IconBriefcase className={className} />;
    case "qa-test-automation":
      return <IconChecklist className={className} />;
    case "blockchain-web3":
      return <IconLink className={className} />;
    case "mainframe-modernization":
      return <IconServerBolt className={className} />;
    case "sap-enterprise-erp":
      return <IconBuildingStore className={className} />;
    case "game-dev":
      return <IconDeviceGamepad2 className={className} />;
    case "ui-ux-design":
      return <IconPalette className={className} />;
    default:
      return <IconCompass className={className} />;
  }
}
