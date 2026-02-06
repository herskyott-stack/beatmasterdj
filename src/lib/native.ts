import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';

// Check if we're running on a native platform
export const isNative = Capacitor.isNativePlatform();
export const platform = Capacitor.getPlatform();

// Haptic feedback utilities
export const haptics = {
  impact: async (style: 'light' | 'medium' | 'heavy' = 'medium') => {
    if (!isNative) return;
    const styleMap = {
      light: ImpactStyle.Light,
      medium: ImpactStyle.Medium,
      heavy: ImpactStyle.Heavy,
    };
    await Haptics.impact({ style: styleMap[style] });
  },
  
  notification: async (type: 'success' | 'warning' | 'error' = 'success') => {
    if (!isNative) return;
    const typeMap = {
      success: NotificationType.Success,
      warning: NotificationType.Warning,
      error: NotificationType.Error,
    };
    await Haptics.notification({ type: typeMap[type] });
  },
  
  vibrate: async (duration: number = 300) => {
    if (!isNative) return;
    await Haptics.vibrate({ duration });
  },
  
  selectionStart: async () => {
    if (!isNative) return;
    await Haptics.selectionStart();
  },
  
  selectionChanged: async () => {
    if (!isNative) return;
    await Haptics.selectionChanged();
  },
  
  selectionEnd: async () => {
    if (!isNative) return;
    await Haptics.selectionEnd();
  },
};

// Status bar utilities
export const statusBar = {
  setStyle: async (style: 'dark' | 'light' = 'dark') => {
    if (!isNative) return;
    await StatusBar.setStyle({ style: style === 'dark' ? Style.Dark : Style.Light });
  },
  
  hide: async () => {
    if (!isNative) return;
    await StatusBar.hide();
  },
  
  show: async () => {
    if (!isNative) return;
    await StatusBar.show();
  },
  
  setBackgroundColor: async (color: string) => {
    if (!isNative) return;
    await StatusBar.setBackgroundColor({ color });
  },
};

// Splash screen utilities
export const splashScreen = {
  hide: async () => {
    if (!isNative) return;
    await SplashScreen.hide();
  },
  
  show: async () => {
    if (!isNative) return;
    await SplashScreen.show({
      autoHide: false,
    });
  },
};

// Initialize native features
export const initializeNativeFeatures = async () => {
  if (!isNative) return;
  
  try {
    // Set status bar style for dark theme
    await statusBar.setStyle('light');
    await statusBar.setBackgroundColor('#0a0a0f');
    
    // Hide splash screen after app loads
    await splashScreen.hide();
  } catch (error) {
    console.error('Error initializing native features:', error);
  }
};
