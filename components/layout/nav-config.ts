import type { Icon } from "@phosphor-icons/react";
import {
  AddressBookIcon,
  BrowserIcon,
  ChartBarIcon,
  ChatCircleIcon,
  ChatsCircleIcon,
  EnvelopeSimpleIcon,
  FolderSimpleIcon,
  HouseSimpleIcon,
  ChatTeardropTextIcon,
  ClipboardTextIcon,
  LifebuoyIcon,
  PlugsConnectedIcon,
  ListBulletsIcon,
  NotePencilIcon,
  PaperPlaneTiltIcon,
  RocketLaunchIcon,
  SlidersHorizontalIcon,
  StackIcon,
  TagIcon,
  TreeStructureIcon,
  WhatsappLogoIcon,
} from "@phosphor-icons/react/dist/ssr";

/**
 * Sidebar entries, in the order of the design. Every entry opens a page;
 * `type` marks the channel an entry stands for, so the plain Campaigns list
 * filtered to that channel (?type=) highlights it too.
 */
export interface NavItem {
  label: string;
  icon: Icon;
  href?: string;
  /** Campaigns list filtered by channel. */
  type?: "email" | "sms";
}

/** A titled sidebar section; the first section has no heading. */
export interface NavGroup {
  label?: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    items: [
      { label: "Getting Started", icon: RocketLaunchIcon, href: "/getting-started" },
      { label: "Home", icon: HouseSimpleIcon, href: "/dashboard" },
      { label: "Analytics", icon: ChartBarIcon, href: "/analytics" },
    ],
  },
  {
    label: "Campaigns",
    items: [
      { label: "All Campaigns", icon: PaperPlaneTiltIcon, href: "/campaigns" },
      { label: "Email", icon: EnvelopeSimpleIcon, href: "/campaigns/email", type: "email" },
      { label: "WhatsApp", icon: WhatsappLogoIcon, href: "/campaigns/whatsapp" },
      { label: "SMS", icon: ChatCircleIcon, href: "/campaigns/sms", type: "sms" },
      { label: "Inbox", icon: ChatTeardropTextIcon, href: "/inbox" },
    ],
  },
  {
    label: "Audience",
    items: [
      { label: "Contacts", icon: AddressBookIcon, href: "/contacts" },
      { label: "Lists", icon: ListBulletsIcon, href: "/lists" },
      { label: "Segments", icon: StackIcon, href: "/segments" },
      { label: "Tags", icon: TagIcon, href: "/tags" },
      { label: "Forms", icon: BrowserIcon, href: "/forms" },
      { label: "Surveys", icon: ClipboardTextIcon, href: "/surveys" },
      { label: "Preferences", icon: SlidersHorizontalIcon, href: "/preferences" },
    ],
  },
  {
    label: "Automation",
    items: [
      { label: "Workflows", icon: TreeStructureIcon, href: "/workflows" },
      { label: "Integrations", icon: PlugsConnectedIcon, href: "/integrations" },
    ],
  },
  {
    label: "Library",
    items: [
      { label: "Files", icon: FolderSimpleIcon, href: "/files" },
      { label: "Email Templates", icon: NotePencilIcon, href: "/templates" },
      { label: "WhatsApp Templates", icon: ChatsCircleIcon, href: "/templates/whatsapp" },
    ],
  },
  {
    label: "Support",
    items: [{ label: "Help Center", icon: LifebuoyIcon, href: "/help" }],
  },
];

export const NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap((g) => g.items);

const under = (pathname: string, base: string) => pathname === base || pathname.startsWith(`${base}/`);

/** The active entry: the most specific matching page; a channel entry wins on the Campaigns list when its filter is on. */
export function activeNav(pathname: string, type: string): NavItem | null {
  if (pathname === "/campaigns" && (type === "email" || type === "sms")) return NAV_ITEMS.find((i) => i.type === type) ?? null;
  const hits = NAV_ITEMS.filter((i) => i.href && under(pathname, i.href));
  return hits.sort((a, b) => b.href!.length - a.href!.length)[0] ?? null;
}

export const navHref = (item: NavItem) => item.href!;
