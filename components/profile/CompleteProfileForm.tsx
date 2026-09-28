"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type CompleteProfileFormProps = {
    userId: string;
};

export default function CompleteProfileForm({
                                                userId,
                                            }: CompleteProfileFormProps) {
    const router = useRouter();

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const supabase = createClient();

        const { error } = await supabase
            .from("profiles")
            .update({
                first_name: firstName,
                last_name: lastName,
            })
            .eq("id", userId);

        if (error) {
            setMessage(`Something went wrong: ${error.message}`);
            return;
        }

        setMessage("Profile saved!");
        router.refresh();
    };

    return (
        <section>
            <h2>Complete your profile</h2>

            <p>
                Before continuing, tell us a little about yourself.
            </p>

            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="firstName">First name</label>
                    <input
                        id="firstName"
                        type="text"
                        value={firstName}
                        onChange={(event) => setFirstName(event.target.value)}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="lastName">Last name</label>
                    <input
                        id="lastName"
                        type="text"
                        value={lastName}
                        onChange={(event) => setLastName(event.target.value)}
                        required
                    />
                </div>

                <button type="submit">
                    Save profile
                </button>

                {message && <p>{message}</p>}
            </form>
        </section>
    );
}