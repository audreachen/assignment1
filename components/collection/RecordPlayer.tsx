"use client";
import GenerateSceneForm from "./GenerateSceneForm";
import { useState } from "react";
import VoteButtons from "./VoteButtons";

type Song = {
    id: number;
    title: string;
    artist: string;
    year: number;
};

type Generation = {
    id: number;
    user_id: string;
    song_id: number;
    prompt: string;
    image_url: string;
    created_at: string;
};

type RecordPlayerProps = {
    songs: Song[];
    userId: string;
    generations: Generation[];
};

export default function RecordPlayer({
                                         songs,
                                         userId,
                                         generations,
                                     }: RecordPlayerProps)  {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showLinerNotes, setShowLinerNotes] = useState(false);
    if (songs.length === 0) {
        return <p>Your collection is empty.</p>;
    }

    const currentSong = songs[currentIndex];
    const currentGeneration = generations.find(
        (generation) => generation.song_id === currentSong.id
    );

    const showPrevious = () => {
        setShowLinerNotes(false);
        setCurrentIndex((currentIndex - 1 + songs.length) % songs.length);
    };

    const showNext = () => {
        setShowLinerNotes(false);
        setCurrentIndex((currentIndex + 1) % songs.length);
    };

    return (
        <section className="record-player">
            {/* Open lid */}
            {/* Minecraft-inspired jukebox */}
            <div className="jukebox">
                <div className="jukebox-top">
                    <div className="jukebox-slot">
                        <div className="music-disc">
                            <div className="music-disc-center" />
                        </div>
                    </div>
                </div>

                <div className="jukebox-front">
                    <div className="jukebox-speaker">
                        <div className="speaker-pattern" />
                    </div>

                    <div className="jukebox-song">
                        <span>NOW PLAYING</span>
                        <strong>{currentSong.title}</strong>
                        <small>
                            {currentSong.artist} · {currentSong.year}
                        </small>
                    </div>
                </div>

                <div className="jukebox-controls">
                    <button onClick={showPrevious}>
                        ◀ PREV
                    </button>

                    <button
                        onClick={() => setShowLinerNotes(!showLinerNotes)}
                    >
                        {showLinerNotes ? "CLOSE" : "INFO"}
                    </button>

                    <button onClick={showNext}>
                        NEXT ▶
                    </button>
                </div>
            </div>

            {showLinerNotes && (
                <div className="jukebox-info">
                    <span>JUKEBOX</span>
                    <h3>{currentSong.title}</h3>
                    <p>{currentSong.artist}</p>
                    <p>Released {currentSong.year}</p>
                </div>
            )}
            <GenerateSceneForm
                userId={userId}
                songId={currentSong.id}
                songTitle={currentSong.title}
            />
            {currentGeneration && (
                <section className="community-painting">
                    <div className="community-heading">
                        <span>✦ COMMUNITY GALLERY ✦</span>
                        <h3>Listener Painting</h3>
                        <p>A scene imagined while listening to {currentSong.title}</p>
                    </div>

                    <div className="gallery-frame">
                        {currentGeneration.image_url === "test-image" ? (
                            <div className="painting-placeholder">
                                <span className="placeholder-sun" />
                                <span className="placeholder-hill" />
                                <span className="placeholder-caption">
            PAINTING NOT YET GENERATED
          </span>
                            </div>
                        ) : (
                            <img
                                src={currentGeneration.image_url}
                                alt={`Listener painting inspired by ${currentSong.title}`}
                            />
                        )}
                    </div>

                    <p className="painting-description">
                        {currentGeneration.prompt}
                    </p>

                    <div className="gallery-votes">
                        <VoteButtons
                            userId={userId}
                            generationId={currentGeneration.id}
                        />
                    </div>
                </section>
            )}
        </section>
    );
}


