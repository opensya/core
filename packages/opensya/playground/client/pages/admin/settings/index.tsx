import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { definePageMeta } from "@core/client/page-meta";

export const meta = definePageMeta({ auth: true });

export default function Page() {
  return (
    <div className="container max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <Card className="[--card-spacing:--spacing(0)]">
        <CardContent className="divide-y *:py-3 *:px-5">
          <div className="flex items-center ">
            Name
            <div className="ml-auto">
              <Input placeholder="Enter text" />
            </div>
          </div>

          <div className="flex items-center ">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Velit quia
            soluta sed rem possimus dignissimos ea voluptatem ullam? Consectetur
            aliquam mollitia est consequuntur numquam voluptas unde voluptatem
            ex repudiandae dolorem?
          </div>
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
