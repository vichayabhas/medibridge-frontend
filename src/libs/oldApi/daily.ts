import { getBackendUrl } from "@/components/utility/setup";

export type DailyMeetingRole = "patient" | "pharmacist";

export interface FetchTelemedicineMeetingTokenOptions {
  handoffId: string;
  participantName?: string;
  role: DailyMeetingRole;
  audioOnly?: boolean;
}

function getApiUrl() {
  return getBackendUrl()
}

export async function fetchTelemedicineMeetingToken(
  options: FetchTelemedicineMeetingTokenOptions
): Promise<{ token: string; roomUrl: string; roomName: string }> {
  const response = await fetch(`${getApiUrl()}/api/telemedicine/meeting-token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(options),
  });

  const data = (await response.json()) as {
    success?: boolean;
    token?: string;
    roomUrl?: string;
    roomName?: string;
    message?: string;
  };

  if (!response.ok || !data.success || !data.token || !data.roomUrl || !data.roomName) {
    throw new Error(data.message || `HTTP ${response.status}: Failed to create meeting token`);
  }

  return {
    token: data.token,
    roomUrl: data.roomUrl,
    roomName: data.roomName,
  };
}
