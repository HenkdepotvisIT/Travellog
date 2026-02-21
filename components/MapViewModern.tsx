import { Platform } from "react-native";

// Re-export the appropriate component based on platform
// For web, Metro will automatically use MapViewModern.web.tsx
// For native, this file will be used

import MapViewModernNative from "./MapViewModernNative";

export default MapViewModernNative;