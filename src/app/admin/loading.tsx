import { AppLoadingScreen } from "@/components/molecules/AppLoadingScreen";

export default function AdminLoading() {
  // Keep sidebar/header visible during soft navigations.
  return <AppLoadingScreen fullScreen={false} />;
}
