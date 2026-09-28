"use client";

import { useState } from "react";

type Song = {
    id: number;
    title: string;
    artist: string;
    year: number;
};

type RecordPlayerProps = {
    songs: Song[];
};

export default function RecordPlayer({ songs }: RecordPlayerProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showLinerNotes, setShowLinerNotes] = useState(false);
    if (songs.length === 0) {
        return <p>Your collection is empty.</p>;
    }

    const currentSong = songs[currentIndex];

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
            <div className={`liner-notes ${showLinerNotes ? "open" : ""}`}>
                <p className="notes-album">JUBILEE</p>

                <h3>{currentSong.title}</h3>

                <p className="notes-artist">Japanese Breakfast · 2021</p>

                <div className="notes-divider" />

                <p className="notes-text">
                    Liner notes for {currentSong.title} will live here.
                </p>
            </div>
            <div className="player-lid">
                <div className="lid-content">
                    <p className="album-label">JAPANESE BREAKFAST</p>

                    <h2>JUBILEE</h2>

                    <div className="now-playing">
                        <span>NOW PLAYING</span>
                        <strong>{currentSong.title}</strong>
                        <span>{currentSong.year}</span>
                    </div>
                </div>
            </div>

            {/* Bottom half of suitcase */}
            <div className="player-base">
                <div className="turntable">
                    <div className="platter">
                        <div className="record-disc">
                            <div className="record-label">
                                <span>JUBILEE</span>
                                <div className="spindle-hole" />
                                <small>{currentSong.title}</small>
                            </div>
                        </div>
                    </div>

                    <div className="tonearm">
                        <div className="tonearm-pivot" />
                        <div className="tonearm-arm" />
                        <div className="needle" />
                    </div>
                </div>

                <div className="player-controls">
                    <button onClick={showPrevious}>← Previous</button>

                    <button
                        className="liner-button"
                        onClick={() => setShowLinerNotes(!showLinerNotes)}
                    >
                        {showLinerNotes ? "Close Notes" : "Liner Notes"}
                    </button>

                    <button onClick={showNext}>Next →</button>
                </div>
            </div>
        </section>
    );
}