import { AuthUpdateProfilePicture } from "@/components/auth/update-profile-picture";
import { UserUpdateProfile } from "@/components/auth/update";
import { Card, CardContent } from "@/components/ui/card";
import { definePageMeta } from "@core/client/page-meta";

export const meta = definePageMeta({ auth: true });

export default function Page() {
  return (
    <div className="container max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-16 space-y-10">
      <h2 className="text-3xl">Profile</h2>

      <Card className="[--card-spacing:--spacing(0)]">
        <CardContent className="divide-y *:py-5 *:px-5 ">
          <AuthUpdateProfilePicture />

          <UserUpdateProfile />
        </CardContent>
      </Card>
    </div>
  );
}
