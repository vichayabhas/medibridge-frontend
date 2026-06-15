// /**
//  * React Hook: useTelemedicineRoom
//  * 
//  * Custom hook for managing telemedicine room creation and cleanup
//  * Communicates with backend to generate Daily.co room URLs
//  */

import { useState, useCallback } from "react";
import { getBackendUrl } from "../../utility/setup";
// import { getBackendUrl } from "../utility/setup";

// /**
//  * Response from create-room endpoint
//  */
export interface TelemedicineRoomData {
  success: boolean;
  roomUrl: string;
  roomId: string;
  expiresAt?: string;
  message?: string;
}

/**
 * Options for creating a room
 */
export interface CreateRoomOptions {
  taskId: string;
  pharmacistName: string;
  expiresInHours?: number;
  enableRecording?: boolean;
}

// /**
//  * Hook state
//  */
// export interface UseTelemedicineRoomState {
//   roomData: TelemedicineRoomData | null;
//   isLoading: boolean;
//   error: string | null;
// }

// /**
//  * useTelemedicineRoom Hook
//  * 
//  * Manages the creation and cleanup of telemedicine rooms
//  * 
//  * @example
//  * ```tsx
//  * const { createRoom, completeSession, isLoading, error, roomData } = 
//  *   useTelemedicineRoom();
//  * 
//  * const handleStartCall = async () => {
//  *   await createRoom({
//  *     taskId: "TM-25001",
//  *     pharmacistName: "Dr. Sarah"
//  *   });
//  * };
//  * 
//  * const handleEndCall = async () => {
//  *   await completeSession({
//  *     taskId: "TM-25001",
//  *     roomId: roomData!.roomId,
//  *     duration: 1800
//  *   });
//  * };
//  * ```
//  */
export function useTelemedicineRoom() {
  const [roomData, setRoomData] = useState<TelemedicineRoomData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Get API base URL from environment
   */
  const getApiUrl = () => {
    return getBackendUrl()
  };

  /**
   * Create a new telemedicine room
   */
  const createRoom = useCallback(
    async (options: CreateRoomOptions): Promise<TelemedicineRoomData> => {
      setIsLoading(true);
      setError(null);

      try {
        // Validate required fields
        if (!options.taskId || !options.pharmacistName) {
          throw new Error("Missing required fields: taskId, pharmacistName");
        }

        // Call backend API
        const response = await fetch(
          `${getApiUrl()}/api/telemedicine/create-room`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              taskId: options.taskId,
              pharmacistName: options.pharmacistName,
              expiresInHours: options.expiresInHours || 2,
              enableRecording: options.enableRecording || false,
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || `HTTP ${response.status}: Failed to create room`
          );
        }

        const data: TelemedicineRoomData = await response.json();

        if (!data.success) {
          throw new Error(data.message || "Failed to create room");
        }

        // Store room data
        setRoomData(data);

        return data;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error occurred";
        setError(message);
        throw new Error(message);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Mark a session as complete and clean up resources
   */
  const completeSession = useCallback(
    async (options: {
      taskId: string;
      roomId: string;
      duration?: number;
      notes?: string;
    }): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        if (!options.taskId || !options.roomId) {
          throw new Error("Missing required fields: taskId, roomId");
        }

        const response = await fetch(
          `${getApiUrl()}/api/telemedicine/session-complete`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(options),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || "Failed to complete session"
          );
        }

        // Clear room data
        setRoomData(null);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error occurred";
        setError(message);
        throw new Error(message);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * List all active rooms
   */
  const listRooms = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${getApiUrl()}/api/telemedicine/rooms`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch rooms");
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Delete a specific room
   */
  const deleteRoom = useCallback(
    async (roomId: string): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        if (!roomId) {
          throw new Error("Room ID is required");
        }

        const response = await fetch(
          `${getApiUrl()}/api/telemedicine/rooms/${roomId}`,
          {
            method: "DELETE",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to delete room");
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
        throw new Error(message);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Clear current room data and error state
   */
  const reset = useCallback(() => {
    setRoomData(null);
    setError(null);
  }, []);

  return {
    // State
    roomData,
    isLoading,
    error,

    // Methods
    createRoom,
    completeSession,
    listRooms,
    deleteRoom,
    reset,
  };
}

// /**
//  * Helper hook for managing video call UI state
//  */
// export function useVideoCallState() {
//   const [isCallActive, setIsCallActive] = useState(false);
//   const [callError, setCallError] = useState<string | null>(null);

//   const startCall = useCallback(() => {
//     setIsCallActive(true);
//     setCallError(null);
//   }, []);

//   const endCall = useCallback(() => {
//     setIsCallActive(false);
//   }, []);

//   const setError = useCallback((error: string | null) => {
//     setCallError(error);
//   }, []);

//   return {
//     isCallActive,
//     callError,
//     startCall,
//     endCall,
//     setError,
//   };
// }
