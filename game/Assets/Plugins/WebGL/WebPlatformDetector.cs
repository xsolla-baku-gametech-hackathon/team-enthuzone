using UnityEngine;
using System.Runtime.InteropServices;

public static class WebPlatformDetector
{
#if UNITY_WEBGL && !UNITY_EDITOR
    [DllImport("__Internal")]
    private static extern int IsMobileWebGL();
#endif

    public static bool IsMobile()
    {
#if UNITY_WEBGL && !UNITY_EDITOR
        return IsMobileWebGL() == 1;
#else
        return Application.isMobilePlatform || SystemInfo.deviceType == DeviceType.Handheld;
#endif
    }
}
