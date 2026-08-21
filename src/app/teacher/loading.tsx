import { AppLoadingScreen } from "@/components/molecules/AppLoadingScreen";

export default function TeacherLoading() {
  // Keep sidebar/header visible during soft navigations.
  return <AppLoadingScreen fullScreen={false} />;
}
