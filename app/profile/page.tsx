import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import EditProfileForm from "@/components/profile/EditProfileForm";
import SignOutButton from "@/components/auth/SignOutButton";

export default async function ProfilePage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/");
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("first_name, last_name, avatar_url")
        .eq("id", user.id)
        .single();

    return (
        <main
            style={{
                maxWidth: "600px",
                margin: "0 auto",
                padding: "40px 20px",
                fontFamily: "Arial, sans-serif",
            }}
        >
            <h1>Profile</h1>
            {profile?.avatar_url && (
                <img
                    src={profile.avatar_url}
                    alt="Profile photo"
                    width={150}
                    height={150}
                    style={{
                        borderRadius: "50%",
                        objectFit: "cover",
                    }}
                />
            )}
            <p>
                <strong>Email:</strong> {user.email}
            </p>

            <EditProfileForm
                userId={user.id}
                initialFirstName={profile?.first_name ?? ""}
                initialLastName={profile?.last_name ?? ""}
            />
            <SignOutButton />
        </main>
    );
}