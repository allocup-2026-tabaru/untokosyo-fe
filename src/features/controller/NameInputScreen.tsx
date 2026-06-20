"use client";


import React, { useState } from "react";
import "./NameInputScreen.css";

type Props = {
  onStart: () => void;
};

const NameInputScreen = ({ onStart }: Props) => {
  const [playerName, setPlayerName] = useState("");

  return (
    <div className="name-screen">
      {/* 入力エリア */}
      <div className="input-section">
        <p className="input-label"></p>

        <input
          type="text"
          className="name-input"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          maxLength={12}
          placeholder="名前を入力"
        />

        <button
          className="submit-button"
          onClick={() => {
            console.log("Player Name:", playerName);
            onStart();
          }}
        >
         Start
        </button>

      </div>

      {/* タイトルロゴ */}
      {/* <img
        src="/title.png"
        alt="Title Logo"
        className="title-logo"
      /> */}
    </div>
  );
};

export default NameInputScreen;