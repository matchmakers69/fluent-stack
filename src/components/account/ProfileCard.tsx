"use client";

import { useState } from "react";
import { ProfileAvatarUpload } from "./ProfileAvatarUpload";
import { ProfileForm } from "./ProfileForm";

interface ProfileCardProps {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export function ProfileCard({ firstName, lastName, email, phone }: ProfileCardProps) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <>
      <ProfileAvatarUpload />
      <ProfileForm
        firstName={firstName}
        lastName={lastName}
        email={email}
        phone={phone}
        isEditing={isEditing}
        onEditStart={() => setIsEditing(true)}
        onEditEnd={() => {
          setIsEditing(false);
        }}
      />
    </>
  );
}
