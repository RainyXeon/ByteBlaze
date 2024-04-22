import { metadata } from "./metadata.js";
import Library from "./Library/index.js";
import Plugin from "./Plugin/index.js";

// Export main class
export * from "./Rainlink.js";
// Export player class
export * from "./Player/RainlinkPlayer.js";
export * from "./Player/RainlinkQueue.js";
export * from "./Player/RainlinkTrack.js";
// Export node class
export * from "./Node/RainlinkNode.js";
export * from "./Node/RainlinkRest.js";
export * from "./Node/RainlinkPlayerEvents.js";
// Export manager class
export * from "./Manager/RainlinkNodeManager.js";
export * from "./Manager/RainlinkPlayerManager.js";
//// Export library class
export * from "./Library/AbstractLibrary.js";
export { Library };
//Export interface
export * from "./Interface/Connection.js";
export * from "./Interface/Constants.js";
export * from "./Interface/Manager.js";
export * from "./Interface/Node.js";
export * from "./Interface/Player.js";
export * from "./Interface/Rest.js";
export * from "./Interface/Track.js";
// Export plugin
export * from "./Plugin/RainlinkPlugin.js";
export * from "./Plugin/SourceRainlinkPlugin.js";
export { Plugin };
// Export driver
export * from "./Drivers/AbstractDriver.js";
export * from "./Drivers/Lavalink3.js";
export * from "./Drivers/Lavalink4.js";
export * from "./Drivers/Nodelink2.js";
// Export utilities
export * from "./Utilities/RainlinkDatabase.js";
export * from "./Utilities/RainlinkWebsocket.js";
// Export metadata
export * from "./metadata.js";
export const version = metadata.version;
