import { OrganisationLogoUpdate } from "@/components/organisation/update-logo";
import { OrganisationNameUpdate } from "@/components/organisation/update-name";
import { Card, CardContent } from "@/components/ui/card";
import { definePageMeta } from "@core/client/page-meta";

export const meta = definePageMeta({ auth: true });

export default function Page() {
  return (
    <div className="container max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-16 space-y-10">
      <h2 className="text-3xl">Organisation</h2>

      <Card className="[--card-spacing:--spacing(0)]">
        <CardContent className="divide-y *:py-3 *:px-5 ">
          <OrganisationLogoUpdate />

          <OrganisationNameUpdate />
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Laborum
          molestias reprehenderit placeat molestiae corrupti quos et repudiandae
          fuga rerum officiis ratione, iusto quis repellendus ut accusamus nisi
          velit corporis incidunt.
        </CardContent>
      </Card>
    </div>
  );
}
