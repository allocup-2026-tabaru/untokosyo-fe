import { LobbyPageShell } from "../layout/LobbyPageShell";
import { StartLobbyActions } from "./StartLobbyActions";

export function StartLobbyView() {
  return (
    <LobbyPageShell align="start">
      <div className="w-full max-w-4xl px-2 py-6">
        <StartLobbyActions />
      </div>
    </LobbyPageShell>
  );
}
