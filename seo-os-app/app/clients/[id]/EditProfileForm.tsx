"use client";

import { useTransition, useState } from "react";
import { updateProfile } from "./actions";

interface EditProfileFormProps {
  clientId: string;
  initialProfileData: unknown;
}

export function EditProfileForm({
  clientId,
  initialProfileData,
}: EditProfileFormProps) {
  const [value, setValue] = useState(
    JSON.stringify(initialProfileData, null, 2)
  );
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  const boundAction = updateProfile.bind(null, clientId);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await boundAction(formData);
      if (result.success) {
        setSaved(true);
      } else {
        setError(result.error ?? "Unknown error");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="profileData">Profile Data (JSON)</label>
      </div>
      <div>
        <textarea
          id="profileData"
          name="profileData"
          rows={20}
          cols={80}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setSaved(false);
          }}
        />
      </div>
      <div>
        <button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save Profile"}
        </button>
      </div>
      {saved && <p>Saved successfully.</p>}
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
    </form>
  );
}
