import { UserProfile } from "@clerk/nextjs";

export default function ProfilePage() {
  return (
    <div className="flex justify-center py-12 px-4">
      <UserProfile routing="hash" />
    </div>
  );
}
