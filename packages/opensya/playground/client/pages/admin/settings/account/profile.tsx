import { UserUpdateProfilePicture } from "@/components/user/update-profile-picture";
import { UserUpdateProfile } from "@/components/user/update";
import { Card, CardContent } from "@/components/ui/card";
import { definePageMeta } from "@core/client/page-meta";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/components/providers/user";

export const meta = definePageMeta({ auth: true });

export default function Page() {
  const { isLoading, user } = useUser();

  return (
    <div className="container max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-16 space-y-10">
      {isLoading ? (
        <div className="flex w-full flex-col gap-7 mt-16">
          <div className="flex flex-col gap-3">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
          <div className="flex flex-col gap-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-9/12" />
            <Skeleton className="h-8 w-10/12" />
          </div>
          <Skeleton className="h-8 w-24" />
        </div>
      ) : (
        user && (
          <>
            <h2 className="text-2xl px-2">Profile</h2>
            <Card className="[--card-spacing:--spacing(0)]">
              <CardContent className="divide-y *:py-5 *:px-5 ">
                <UserUpdateProfilePicture />
                <UserUpdateProfile />
              </CardContent>
            </Card>
          </>
        )
      )}
    </div>
  );
}
