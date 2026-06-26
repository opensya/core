import { definePageMeta } from "@core/client/page-meta";

export const meta = definePageMeta({ auth: true });

export default function Page() {
  return (
    <div className="container max-w-4xl my-5 mx-auto w-full px-4 sm:px-6 lg:px-8">
      <p>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Officia ratione
        expedita suscipit quidem vel veritatis id facere ducimus mollitia nihil
        autem molestias, illum, impedit eaque quam. Quaerat ipsum similique
        maxime.
      </p>
    </div>
  );
}
