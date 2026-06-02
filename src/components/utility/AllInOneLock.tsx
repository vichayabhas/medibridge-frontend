import React from "react";
import BackToHome from "./BackToHome";
import PasswordLock from "./PasswordLock";
export type LockLinkType = "lock" | "wait for password" | "pass";
export const lockLinkInit: boolean = false;

export default function AllInOneLock({
  children,
  token,
  bypass,
  lock,
  pushToHome,
  link,
  alternativeChildren,
}: {
  children: React.ReactNode;
  token?: string;
  bypass?: boolean;
  lock?: boolean;
  pushToHome?: boolean;
  link?: [LockLinkType, React.Dispatch<React.SetStateAction<LockLinkType>>];
  alternativeChildren?: React.ReactNode;
  
}) {
  if (bypass) {
    return children;
  }
  if (lock) {
    if (pushToHome) {
      return <BackToHome />;
    } else {
      return null;
    }
  }
  if (token) {
    return (
      <PasswordLock link={link} token={token} bypass={false}>
        {children}
      </PasswordLock>
    );
  } else {
    if (link) {
      switch (link[0]) {
        case "lock": {
          if (pushToHome) {
            return <BackToHome />;
          } else {
            return null;
          }
        }
        case "wait for password": {
          return alternativeChildren;
        }
        case "pass": {
          return children;
        }
      }
    }
  }
}
// export function checkValid({
//   role,
//   bypass,
//   lock,
//   mode,
//   spacialBypass,
// }: {
//   role?: RoleCamp;
//   bypass?: boolean;
//   lock?: boolean;
//   mode?: Mode;
//   spacialBypass?: {
//     role: Role;
//     bypass: boolean;
//   };
// }) {
//   if (bypass) {
//     return true;
//   }
//   if (lock) {
//     return false;
//   }
//   if (role) {
//     switch (role) {
//       case "nong": {
//         return (
//           mode == "pee" &&
//           !!spacialBypass &&
//           spacialBypass.bypass &&
//           spacialBypass.role != "nong"
//         );
//       }
//       case "pee": {
//         if (mode) {
//           switch (mode) {
//             case "nong":
//               return false;
//             case "pee":
//               return true;
//           }
//         } else {
//           if (spacialBypass) {
//             return spacialBypass.bypass && spacialBypass.role != "nong";
//           } else {
//             return true;
//           }
//         }
//         break;
//       }
//       case "peto": {
//         if (mode) {
//           switch (mode) {
//             case "nong":
//               return false;
//             case "pee":
//               return true;
//           }
//         } else {
//           return true;
//         }
//       }
//     }
//   } else {
//     if (mode) {
//       switch (mode) {
//         case "nong":
//           return false;
//         case "pee":
//           return true;
//       }
//     } else {
//       return true;
//     }
//   }
// }

// export function getDefaultLockInit({
//   token,
//   role,
//   bypass,
//   lock,
//   mode,
//   spacialBypass,
//   inBaan,
//   nongBypass,
//   canNongAccidentallySee,
// }: {
//   token?: string;
//   role?: RoleCamp;
//   bypass?: boolean;
//   lock?: boolean;
//   mode?: Mode;
//   spacialBypass?: {
//     role: Role;
//     bypass: boolean;
//   };
//   inBaan?: boolean;
//   nongBypass?: boolean;
//   canNongAccidentallySee?: boolean;
// }): LockLinkType {
//   if (bypass) {
//     return "pass";
//   }
//   if (lock) {
//     return "lock";
//   }
//   if (token) {
//     if (role) {
//       switch (role) {
//         case "nong": {
//           if (nongBypass) {
//             return "wait for password";
//           }
//           return "lock";
//         }
//         case "pee": {
//           if (nongBypass) {
//             return "wait for password";
//           }
//           if (mode) {
//             switch (mode) {
//               case "nong":
//                 return "wait for password";
//               case "pee":
//                 return "pass";
//             }
//           } else {
//             if (spacialBypass) {
//               if (!spacialBypass.bypass) {
//                 return "lock";
//               }
//               if (spacialBypass.role == "nong") {
//                 return "wait for password";
//               } else {
//                 return "pass";
//               }
//             } else {
//               return "pass";
//             }
//           }
//           break;
//         }
//         case "peto": {
//           if (inBaan) {
//             return "lock";
//           }
//           if (mode) {
//             switch (mode) {
//               case "nong":
//                 return "wait for password";
//               case "pee":
//                 return "pass";
//             }
//           } else {
//             if (spacialBypass) {
//               if (spacialBypass.bypass && spacialBypass.role != "nong") {
//                 return "pass";
//               } else {
//                 return "wait for password";
//               }
//             } else {
//               return "pass";
//             }
//           }
//         }
//       }
//     } else {
//       if (mode) {
//         switch (mode) {
//           case "nong":
//             return "wait for password";
//           case "pee":
//             return "pass";
//         }
//       } else return "wait for password";
//     }
//   } else {
//     if (role) {
//       switch (role) {
//         case "nong": {
//           if (nongBypass) {
//             return "pass";
//           }
//           if (
//             mode == "pee" &&
//             spacialBypass &&
//             spacialBypass.bypass &&
//             spacialBypass.role != "nong"
//           ) {
//             return "pass";
//           }
//           return "lock";
//         }
//         case "pee": {
//           if (nongBypass) {
//             return "pass";
//           }
//           if (canNongAccidentallySee) {
//             return "pass";
//           }
//           if (mode) {
//             switch (mode) {
//               case "nong":
//                 return "lock";
//               case "pee":
//                 return "pass";
//             }
//           } else {
//             return "pass";
//           }
//           break;
//         }
//         case "peto": {
//           if (inBaan) {
//             return "lock";
//           }
//           if (canNongAccidentallySee) {
//             return "pass";
//           }
//           if (mode) {
//             switch (mode) {
//               case "nong":
//                 return "lock";
//               case "pee":
//                 return "pass";
//             }
//           } else {
//             return "pass";
//           }
//         }
//       }
//     } else {
//       if (mode) {
//         switch (mode) {
//           case "nong":
//             return "lock";
//           case "pee":
//             return "pass";
//         }
//       } else {
//         return "pass";
//       }
//     }
//   }
// }
// export function getAllInOneDefaultLockInit<
//   T extends Partial<{
//     token: string;
//     role: RoleCamp;
//     bypass: boolean;
//     lock: boolean;
//     mode: Mode;
//     spacialBypass?: {
//       role: Role;
//       bypass: boolean;
//     };
//     inBaan: boolean;
//     nongBypass?: boolean;
//     canNongAccidentallySee: boolean;
//   }>,
// >(data: T) {
//   const putInUseState = getDefaultLockInit(data);
//   return { putInUseState, data };
// }
// const t = getAllInOneDefaultLockInit({ role: "pee", token: "123" });
