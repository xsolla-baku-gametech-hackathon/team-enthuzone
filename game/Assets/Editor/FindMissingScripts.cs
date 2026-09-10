using System.IO;
using UnityEditor;
using UnityEngine;

public class FindMissingScripts : MonoBehaviour
{
    [MenuItem("Tools/Find All Missing Scripts")]
    static void FindMissingScriptss()
    {
        int goCount = 0;
        int missingCount = 0;

        // 1️⃣ Sahnedeki tüm GameObject'leri tara
        GameObject[] sceneObjects = GameObject.FindObjectsOfType<GameObject>(true);
        foreach (GameObject go in sceneObjects)
        {
            goCount++;
            Component[] components = go.GetComponents<Component>();
            for (int i = 0; i < components.Length; i++)
            {
                if (components[i] == null)
                {
                    missingCount++;
                    Debug.Log("Missing script in Scene: " + GetFullPath(go), go);
                }
            }
        }

        // 2️⃣ Project panelindeki tüm prefab’ları tara
        string[] allPrefabs = AssetDatabase.FindAssets("t:Prefab");
        foreach (string guid in allPrefabs)
        {
            string path = AssetDatabase.GUIDToAssetPath(guid);
            GameObject prefab = AssetDatabase.LoadAssetAtPath<GameObject>(path);
            if (prefab == null) continue;

            Component[] components = prefab.GetComponentsInChildren<Component>(true);
            foreach (Component comp in components)
            {
                if (comp == null)
                {
                    missingCount++;
                    Debug.Log("Missing script in Prefab: " + path, prefab);
                }
            }
        }

        Debug.Log($"Sahnedeki GameObject sayısı: {goCount}, Bulunan Missing Script sayısı: {missingCount}");
    }

    // GameObject’in sahne hiyerarşisini tam olarak gösterir
    static string GetFullPath(GameObject go)
    {
        string path = go.name;
        while (go.transform.parent != null)
        {
            go = go.transform.parent.gameObject;
            path = go.name + "/" + path;
        }
        return path;
    }
}






public class CodeLineCounter
{
    [MenuItem("Tools/Count Lines of Code (No Comments/Empty)")]
    public static void CountLines()
    {
        string[] files = Directory.GetFiles(Application.dataPath, "*.cs", SearchOption.AllDirectories);
        int total = 0;

        foreach (string file in files)
        {
            foreach (var line in File.ReadAllLines(file))
            {
                string trimmed = line.Trim();
                if (string.IsNullOrEmpty(trimmed)) continue;       // boş satır
                if (trimmed.StartsWith("//")) continue;            // tek satırlık yorum
                if (trimmed.StartsWith("/*") || trimmed.StartsWith("*") || trimmed.StartsWith("*/")) continue; // blok yorum basit kontrol

                total++;
            }
        }

        Debug.Log("Toplam kod satırı (yorum/boş hariç): " + total);
    }
}
