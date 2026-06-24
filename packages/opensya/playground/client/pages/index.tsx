import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function Page() {
  const navigate = useNavigate();

  return (
    <>
      <p>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Officia ratione
        expedita suscipit quidem vel veritatis id facere ducimus mollitia nihil
        autem molestias, illum, impedit eaque quam. Quaerat ipsum similique
        maxime.
      </p>

      <Button onClick={() => navigate("/admin")} variant={"link"}>
        Admin
      </Button>
    </>
  );
}
