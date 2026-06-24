import { definePageMeta } from "@core/client/page-meta";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthProvider";

definePageMeta({
  auth: true,
});

export default function Page() {
  const { logout } = useAuth();

  return (
    <>
      Lorem ipsum dolor sit amet consectetur adipisicing elit. Officia ratione
      expedita suscipit quidem vel veritatis id facere ducimus mollitia nihil
      autem molestias, illum, impedit eaque quam. Quaerat ipsum similique
      maxime.
      <Button onClick={logout}>logout</Button>
    </>
  );
}
