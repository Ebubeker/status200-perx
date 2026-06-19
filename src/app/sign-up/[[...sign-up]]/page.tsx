import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="grain grid min-h-dvh place-items-center px-6 py-10">
      <SignUp />
    </div>
  );
}
