// import {
//   InterSize,
//   InterActionPlan,
//   MapObjectId,
//   MyMap,
//   HealthIssueBody,
//   Id,
//   UpdateTimeOffsetRaw,
//   SocketEvent,
//   TriggerDataPack,
// } from "../../../interface";
import dayjs from "dayjs";
import React from "react";
// import getUserProfile from "@/libs/user/getUserProfile";
// import getTimeOffset from "@/libs/user/getTimeOffset";
// import { Session } from "next-auth";
// import { Socket } from "socket.io-client";
type Id=string

export function startSize(): Map<
  "S" | "M" | "L" | "XL" | "XXL" | "3XL",
  number
> {
  const size: Map<"S" | "M" | "L" | "XL" | "XXL" | "3XL", number> = new Map();
  const s: ("S" | "M" | "L" | "XL" | "XXL" | "3XL")[] = [
    "S",
    "M",
    "L",
    "XL",
    "XXL",
    "3XL",
  ];
  s.forEach((e: "S" | "M" | "L" | "XL" | "XXL" | "3XL") => {
    size.set(e, 0);
  });
  return size;
}

export function calculate(
  input: unknown | number | undefined,
  plus: unknown | number | undefined,
  minus: unknown | number | undefined,
) {
  return (input as number) + (plus as number) - (minus as number);
}
export const resOk = { success: true };
export const resError = { success: false };


export function isInTime(start: Date, end: Date): boolean {
  const now = new Date(Date.now());
  return now > start && now < end;
}

export function getBackendUrl() {
  return process.env.NEXT_PUBLIC_BACKEND_URL;
}
export const userPath = "api/v1/auth";

export function notEmpty<TValue>(
  value: TValue | null | undefined,
): value is TValue {
  if (value === null || value === undefined) return false;
  return true;
}
export function sendNotification(body: string) {
  if (!("Notification" in window)) {
    throw new Error("Your browser does not support push notification");
  }
  Notification.requestPermission().then(() => {
    const notificationOptions = {
      body,
      //icon:"./image.png"
    };
    new Notification("Push Notification", notificationOptions);
  });
}

export function peeLookupNong<P, N>(
  pees: readonly P[],
  nongs: readonly N[],
): (P | N)[] {
  if (pees.length == 0) {
    return nongs.map(copy);
  }
  if (pees.length == 1) {
    const outs: (P | N)[] = [pees[0], ...nongs];
    return outs;
  }
  const mp = pees.length;
  const mn = nongs.length;
  let n = 0;
  let p = 0;
  const outs: (P | N)[] = [];
  let i = 0;
  if (mp > mn) {
    let count = mp / (mn + 1);
    const exc = mp % (mn + 1);
    if (exc) {
      outs.push(pees[p++]);
      count--;
    }
    let j = 0;
    while (j < count) {
      outs.push(pees[p++]);
      j++;
    }
    while (i < mn) {
      outs.push(nongs[n++]);
      if (exc > ++i) {
        outs.push(pees[p++]);
      }
      let j = 0;
      while (j < count) {
        outs.push(pees[p++]);
        j++;
      }
    }
  } else {
    let count = mn / (mp - 1);
    const exc = mn % (mp - 1);
    outs.push(pees[p++]);
    if (exc) {
      outs.push(nongs[n++]);
      count--;
    }
    let j = 0;
    while (j < count) {
      outs.push(nongs[n++]);
      j++;
    }
    while (i < mp - 2) {
      outs.push(pees[p++]);
      if (exc > ++i) {
        outs.push(nongs[n++]);
      }
      let j = 0;
      while (j < count) {
        outs.push(nongs[n++]);
        j++;
      }
    }
    outs.push(pees[p++]);
  }
  return outs;
}


export function getDifferentMinute(start: Date, end: Date) {
  return dayjs(end).diff(start, "minute");
}
export function stringToId(input: string) {
  return input;
}
export function removeElementInUseStateArray<T>(input: T[]) {
  return input.filter((e, i, a) => i < a.length - 1);
}
export function modifyElementInUseStateArray<T>(
  i: number,
): (v: T, array: T[]) => T[] {
  return (v: T, array: T[]) => {
    return array.map((v2: T, i2: number) => {
      if (i == i2) {
        return v;
      } else {
        return v2;
      }
    });
  };
}
export function copyArray<T>(input: T[]): T[] {
  return input.map((e) => e);
}
export async function waiting(
  update: () => Promise<void>,
  setTimeOut: (isTimeout: boolean) => void,
) {
  setTimeOut(true);
  await update();
  setTimeOut(false);
}
export function copy<T>(input: T): T {
  return input;
}
export function modifyElementInUseStateArray2Dimension<T>(
  i: number,
  j: number,
): (v: T, array: T[][]) => T[][] {
  return (value: T, arrays: T[][]) =>
    modifyElementInUseStateArray<T[]>(i)(
      modifyElementInUseStateArray<T>(j)(value, arrays[i]),
      arrays,
    );
}
export function setTextToInt(
  set: (input: number) => void,
): React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> {
  return (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const out = parseInt(event.target.value);
    if (isNaN(out)) {
      set(0);
    } else {
      set(out);
    }
  };
}
export function setTextToFloat(
  set: (input: number) => void,
): React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> {
  return (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const out = parseFloat(event.target.value);
    if (isNaN(out)) {
      set(0);
    } else {
      set(out);
    }
  };
}
export function setMap<T, T2>(
  set: (setter: (input: T2) => T2) => void,
  mapIn: (v: T, array: T2) => T2,
): (get: T) => void {
  return (get: T) => {
    set((array) => mapIn(get, array));
  };
}
export function setTextToString(
  set: (input: string) => void,
  keepOriginal?: boolean,
): React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> {
  return (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (keepOriginal) {
      set(event.target.value);
    } else {
      set(event.target.value.replace(/\s/g, ""));
    }
  };
}
export function setSwop(
  input: Id | null,
  set: (setter: (input: Id[]) => Id[]) => void,
): (event: React.ChangeEvent<HTMLInputElement>) => void {
  return (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!input) {
      return;
    }
    if (event.target.checked) {
      set(addItemInUseStateArray(input));
    } else {
      set((previous: Id[]) =>
        previous.filter((e) => e.toString() != input.toString()),
      );
    }
  };
}
export function setBoolean(
  set: (input: boolean) => void,
): (event: React.ChangeEvent<HTMLInputElement>) => void {
  return (event: React.ChangeEvent<HTMLInputElement>) => {
    set(event.target.checked);
  };
}
// export async function getTimeOffsetByToken(token: string) {
//   const user = await getUserProfile(token);
//   return await getTimeOffset(user.displayOffsetId);
// }

// export function selectTimeToSystem(
//   input: dayjs.ConfigType,
//   add: UpdateTimeOffsetRaw,
// ): Date {
//   return dayjs(input)
//     .add(add.day, "days")
//     .add(add.hour, "hours")
//     .add(add.minute, "minutes")
//     .toDate();
// }
export function cleanString(input: string) {
  return input.replace(/\s/g, "");
}
export const downloadText = "download";
export function setSwop2DimensionArray(
  id: Id,
  index: number,
  set: (setter: (input: Id[][]) => Id[][]) => void,
): (event: React.ChangeEvent<HTMLInputElement>) => void {
  return setSwop(id, (c) => {
    set((previous) =>
      modifyElementInUseStateArray<Id[]>(index)(c(previous[index]), previous),
    );
  });
}
export function addItemInUseStateArray<T>(add: T): (previous: T[]) => T[] {
  return (previous) => [...previous, add];
}
export interface UpDownPack {
  up: boolean;
  down: boolean;
}
export interface UpMiddleDownPack {
  up: boolean;
  middle: boolean;
  down: boolean;
}
export class SetUpDownPack {
  private set: React.Dispatch<React.SetStateAction<UpDownPack>>;
  public readonly up: boolean;
  public readonly down: boolean;
  constructor(
    input: [UpDownPack, React.Dispatch<React.SetStateAction<UpDownPack>>],
  ) {
    this.set = input[1];
    this.up = input[0].up;
    this.down = input[0].down;
    this.setUp = (input) => {
      if (input) {
        this.set(({ down }) => ({ up: true, down }));
      } else {
        this.set({ up: false, down: false });
      }
    };
    this.setDown = (input) => {
      if (input) {
        this.set({ up: true, down: true });
      } else {
        this.set(({ up }) => ({ up, down: false }));
      }
    };
  }
  public readonly setUp: (event: boolean) => void;
  public readonly setDown: (event: boolean) => void;
  public static init(up: boolean, down: boolean): UpDownPack {
    return { up, down };
  }
}
export class SetUpMiddleDownPack {
  private set: React.Dispatch<React.SetStateAction<UpMiddleDownPack>>;
  public readonly up: boolean;
  public readonly middle: boolean;
  public readonly down: boolean;
  constructor(
    input: [
      UpMiddleDownPack,
      React.Dispatch<React.SetStateAction<UpMiddleDownPack>>,
    ],
  ) {
    this.set = input[1];
    this.up = input[0].up;
    this.middle = input[0].middle;
    this.down = input[0].down;
    this.setUp = (input) => {
      if (input) {
        this.set(({ down, middle }) => ({ up: true, middle, down }));
      } else {
        this.set({ up: false, middle: false, down: false });
      }
    };
    this.setMiddle = (input) => {
      if (input) {
        this.set(({ down }) => ({ up: true, middle: true, down }));
      } else {
        this.set(({ up }) => ({ up, middle: false, down: false }));
      }
    };
    this.setDown = (input) => {
      if (input) {
        this.set({ up: true, middle: true, down: true });
      } else {
        this.set(({ up, middle }) => ({ up, middle, down: false }));
      }
    };
  }
  public readonly setUp: (event: boolean) => void;
  public readonly setMiddle: (event: boolean) => void;
  public readonly setDown: (event: boolean) => void;
  public static init(
    up: boolean,
    middle: boolean,
    down: boolean,
  ): UpMiddleDownPack {
    return { up, middle, down };
  }
}
export function doIfTrue(input: () => void): (valid: boolean) => void {
  return (valid) => {
    if (valid) {
      input();
    }
  };
}
export class AddRemoveHigh {
  private addIds: Id[];
  private setAddIds: React.Dispatch<React.SetStateAction<Id[]>>;
  private removeIds: Id[];
  private setRemoveIds: React.Dispatch<React.SetStateAction<Id[]>>;
  constructor(
    addIds: Id[],
    setAddIds: React.Dispatch<React.SetStateAction<Id[]>>,
    removeIds: Id[],
    setRemoveIds: React.Dispatch<React.SetStateAction<Id[]>>,
  ) {
    this.addIds = addIds;
    this.setAddIds = setAddIds;
    this.removeIds = removeIds;
    this.setRemoveIds = setRemoveIds;
  }
  public set(addId: Id, removeId: Id | null) {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
      setBoolean((input) => {
        if (!removeId) {
          setSwop(addId, this.setAddIds)(event);
        } else {
          if (input) {
            this.setRemoveIds((previous: Id[]) =>
              previous.filter((e) => e.toString() != removeId.toString()),
            );
          } else {
            this.setRemoveIds(addItemInUseStateArray(removeId));
          }
        }
      })(event);
    };
  }
  public get(addId: Id, removeId: Id | null) {
    return (
      (!!removeId && !this.removeIds.includes(removeId)) ||
      this.addIds.includes(addId)
    );
  }
}

// export class SocketReady<T> {
//   private socket: Socket;
//   private eventName: SocketEvent;
//   private room: string;
//   constructor(socket: Socket, event: SocketEvent, room: string | Id) {
//     this.socket = socket;
//     this.eventName = event;
//     this.room = room.toString();
//   }
//   public listen(event: (arg0: T) => void) {
//     this.socket.on(this.eventName, (data: T, r: string) => {
//       if (r == this.room) {
//         event(data);
//       }
//     });
//   }
//   public trigger(data: T) {
//     this.socket.emit(`${this.eventName}Send`, data, this.room);
//   }
//   public static trigger<T>(
//     data: T,
//     eventName: SocketEvent,
//     room: string,
//     socket: Socket,
//   ) {
//     socket.emit(`${eventName}Send`, data, room);
//   }
//   public static triggerPack<T>(
//     { data, room, event }: TriggerDataPack<T>,
//     socket: Socket,
//   ) {
//     socket.emit(`${event}Send`, data, room);
//   }
//   public triggerPack<T>({ data, room, event }: TriggerDataPack<T>) {
//     this.socket.emit(`${event}Send`, data, room);
//   }
//   public triggerToOther(data: T, room: Id | string) {
//     this.socket.emit(`${this.eventName}Send`, data, room.toString());
//   }
//   public disconnect() {
//     this.socket.off(this.eventName);
//   }
//   public static listenMany<T>(
//     event: (arg0: T, room: string) => void,
//     eventName: SocketEvent,
//     socket: Socket,
//   ) {
//     socket.on(eventName, (data: T, r: string) => {
//       event(data, r);
//     });
//     return () => socket.off(eventName);
//   }
// }
export function notify(message: string) {
  if (typeof window === "undefined") return;
  if (!("Notification" in window)) return;

  Notification.requestPermission().then((permission) => {
    if (permission === "granted") {
      new Notification(message);
    }
  });
}
export function getLastAnd(names: string[]) {
  if (names.length == 1) {
    return names[0];
  }
  let out = "";
  let i = 0;
  while (i < names.length - 2) {
    out += names[i] + ", ";
    i++;
  }
  out += names[i] + " และ " + names[i + 1];
  return out;
}

export function ifIsTrue<T>(
  input: boolean,
  id: T,
  array1: T[],
  array2?: T[],
  array3?: T[],
) {
  if (input) {
    array1.push(id);
    if (array2) {
      array2.push(id);
    }
    if (array3) {
      array3.push(id);
    }
  }
  return array1;
}
export function getIndexArray(length: number) {
  return Array.from(Array(length).keys());
}
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function generateOTP(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}
