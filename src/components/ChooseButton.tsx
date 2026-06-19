"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { choosePackage } from "@/lib/actions";
import { Btn } from "./ui";

export function ChooseButton({ recId }: { recId: string }) {
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <Btn
      full
      variant="dark"
      disabled={pending}
      onClick={() =>
        start(async () => {
          const id = await choosePackage(recId);
          if (id) router.push(`/app/package/${id}`);
        })
      }
    >
      {pending ? "Selecting…" : "Choose this pack"}
    </Btn>
  );
}
