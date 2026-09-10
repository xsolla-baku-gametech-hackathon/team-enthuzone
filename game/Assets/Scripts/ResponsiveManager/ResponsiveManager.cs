using UnityEngine;

#if UNITY_EDITOR
using UnityEditor;
#endif

public class ResponsiveManager : MonoBehaviour
{
    public static ResponsiveManager Instance;

#if UNITY_EDITOR
    public enum EditorDeviceType { Auto, Mobile, Desktop }
    [Header("Editor Simulation")]
    public EditorDeviceType SimulateEditorDevice = EditorDeviceType.Auto;
#endif

    private void Awake()
    {
            Instance = this;
    }    

    /// <summary> Cihaz mobil mi? </summary>
    public bool IsMobile
    {
        get
        {
#if UNITY_WEBGL && !UNITY_EDITOR
            return WebPlatformDetector.IsMobile();
#elif UNITY_EDITOR
            switch (SimulateEditorDevice)
            {
                case EditorDeviceType.Mobile: return true;
                case EditorDeviceType.Desktop: return false;
                case EditorDeviceType.Auto:
                    return SystemInfo.deviceType == DeviceType.Handheld;
            }
            return false;
#else
            return Application.isMobilePlatform || SystemInfo.deviceType == DeviceType.Handheld;
#endif
        }
    }

    /// <summary> Cihaz masaüstü mü? </summary>
    public bool IsDesktop => !IsMobile;
}

#if UNITY_EDITOR
[CustomEditor(typeof(ResponsiveManager))]
public class ResponsiveManagerEditor : Editor
{
    public override void OnInspectorGUI()
    {
        DrawDefaultInspector();

        ResponsiveManager manager = (ResponsiveManager)target;

        if (Application.isEditor)
        {
            EditorGUILayout.Space();
            EditorGUILayout.LabelField("Editor Simulation Info", EditorStyles.boldLabel);
            EditorGUILayout.LabelField("Simulated Device:", manager.IsMobile ? "Mobile" : "Desktop");
        }
    }
}
#endif

















