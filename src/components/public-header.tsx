import { EventLogo } from "./event-logo";
import { PublicHeaderClient } from "./public-header-client";

export { EventLogo };

export async function PublicHeader({ showBack = true }: { showBack?: boolean }) {
  return <PublicHeaderClient showAdminLink showBack={showBack} />;
}
