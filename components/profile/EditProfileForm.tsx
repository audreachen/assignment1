"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type EditProfileFormProps = {
    userId: string;
    initialFirstName: string;
    initialLastName: string;
};

export default function EditProfileForm({
                                            userId,
                                            initialFirstName,
                                            initialLastName,
                                        }: EditProfileFormProps) {
    const router = useRouter();

    const [firstName, setFirstName] = useState(initialFirstName);
    const [lastName, setLastName] = useState(initialLastName);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [message, setMessage] = useState("");

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const supabase = createClient();

        let avatarUrl: string | null = null;

        // If the user selected a photo, upload it first.
        if (avatarFile) {
            const fileExtension = avatarFile.name.split(".").pop();
            const filePath = `${userId}/avatar.${fileExtension}`;

            const { error: uploadError } = await supabase.storage
                .from("avatars")
                .upload(filePath, avatarFile, {
                    upsert: true,
                });

            if (uploadError) {
                setMessage(`Photo upload failed: ${uploadError.message}`);
                return;
            }

            const { data } = supabase.storage
                .from("avatars")
                .getPublicUrl(filePath);

            avatarUrl = data.publicUrl;
        }

        const profileUpdates: {
            first_name: string;
            last_name: string;
            avatar_url?: string;
        } = {
            first_name: firstName,
            last_name: lastName,
        };

        if (avatarUrl) {
            profileUpdates.avatar_url = avatarUrl;
        }

        const { error } = await supabase
            .from("profiles")
            .update(profileUpdates)
            .eq("id", userId);

        if (error) {
            setMessage(`Something went wrong: ${error.message}`);
            return;
        }

        setMessage("Profile updated!");
        router.refresh();
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label htmlFor="profile-first-name">First name</label>
                <input
                    id="profile-first-name"
                    type="text"
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                    required
                />
            </div>

            <div>
                <label htmlFor="profile-last-name">Last name</label>
                <input
                    id="profile-last-name"
                    type="text"
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                    required
                />
            </div>

            <div>
                <label htmlFor="profile-photo">Profile photo</label>
                <input
                    id="profile-photo"
                    type="file"
                    accept="image/*"
                    onChange={(event) => {
                        const file = event.target.files?.[0] ?? null;
                        setAvatarFile(file);
                    }}
                />
            </div>

            <button type="submit">Save changes</button>

            {message && <p>{message}</p>}
        </form>
    );
}