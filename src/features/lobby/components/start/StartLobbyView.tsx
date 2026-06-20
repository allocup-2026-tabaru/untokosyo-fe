import { LobbyPageShell } from "../layout/LobbyPageShell";
import { LobbyPanel } from "../layout/LobbyPanel";
import { StartLobbyActions } from "./StartLobbyActions";
import { StartLobbyHero } from "./StartLobbyHero";

export function StartLobbyView() {
  return (
    <LobbyPageShell align="start">
      <LobbyPanel className="w-full max-w-xl">
        <div className="space-y-6">
          <StartLobbyHero />
          <StartLobbyActions />
        </div>
      </LobbyPanel>
    </LobbyPageShell>
  );
}
