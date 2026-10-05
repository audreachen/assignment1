"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type VoteButtonsProps = {
    userId: string;
    generationId: number;
};

export default function VoteButtons({
                                        userId,
                                        generationId,
                                    }: VoteButtonsProps) {
    const [message, setMessage] = useState("");

    const submitVote = async (vote: 1 | -1) => {
        const supabase = createClient();

        const { error } = await supabase
            .from("votes")
            .upsert(
                {
                    user_id: userId,
                    generation_id: generationId,
                    vote: vote,
                },
                {
                    onConflict: "user_id,generation_id",
                }
            );

        if (error) {
            setMessage(`Vote failed: ${error.message}`);
            return;
        }

        setMessage(vote === 1 ? "You liked this scene!" : "You disliked this scene!");
    };

    return (
        <div className="vote-area">
            <span className="vote-label">RATE THIS PAINTING</span>

            <div className="vote-buttons">
                <button
                    className="vote-button vote-like"
                    onClick={() => submitVote(1)}
                >
                    ▲ LIKE
                </button>

                <button
                    className="vote-button vote-dislike"
                    onClick={() => submitVote(-1)}
                >
                    ▼ DISLIKE
                </button>
            </div>

            {message && <p className="vote-message">{message}</p>}
        </div>
    );
}
