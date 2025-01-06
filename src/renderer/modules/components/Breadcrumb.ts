import { filters, waitForModule } from "../webpack";

interface Breadcrumb {
  id: string;
  label: string;
}

interface BreadcrumbProps {
  activeId: string;
  breadcrumbs: Breadcrumb[];
  onBreadcrumbClick: (breadcrumb: Breadcrumb) => void;
  renderCustomBreadcrumb: (breadcrumb: Breadcrumb, active: boolean) => React.ReactNode;
}

export type BreadcrumbType = React.ComponentClass<BreadcrumbProps>;

export default waitForModule<BreadcrumbType>(filters.bySource(/\w+.breadcrumbFinalWrapper/));
