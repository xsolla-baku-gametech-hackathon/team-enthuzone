using UnityEngine;

public class LevelManager : MonoBehaviour
{
    public static LevelManager Instance;
    public GameObject currentLevel;  // Hazırda səhnədə olan level obyekti 
    public GameObject oldLevel = null;
    public GameObject[] levelPrefabs;    // İnspetordən təyin ediləcək level prefabları
    public bool level = true;
    public int levelCounter = 0;
    public string diff = "Easy";

    

    void Awake()
    {
        Instance = this;
    }

    public void LoadLevel(int index)
    {
        if (oldLevel != null) 
        {
            Destroy(oldLevel);
        }
        
        
        oldLevel = currentLevel;
        // currentLevel içində SpawnPosition adlı child obyekt tapılır
        Transform spawnPos = currentLevel.transform.Find("SpawnPosition");
        if (spawnPos == null)
        {
            Debug.LogError("currentLevel içində 'SpawnPosition' tapılmadı!");
            return;
        }

        // levelPrefabs massivinin dolu və düzgün indexdə olduğunu yoxla
        if (levelPrefabs == null || index < 0 || index >= levelPrefabs.Length)
        {
            Debug.LogError("Düzgün level indexi deyil və ya levelPrefabs boşdur!");
            return;
        }

        // İstədiyimiz prefabi səhnəyə əlavə et (instantiate et)
        GameObject levelInstance = Instantiate(levelPrefabs[index]);

        // Yeni yaradılan prefabın içində 'StartPosition' adlı child obyekt tapılır
        Transform startPos = levelInstance.transform.Find("StartPosition");
        if (startPos == null)
        {
            Debug.LogError("Prefab içində 'StartPosition' tapılmadı!");
            return;
        }

        // Prefabın ümumi mövqeyi ilə StartPosition mövqeyi arasındakı fərqi hesabla
        Vector3 offset = levelInstance.transform.position - startPos.position;

        // Prefabı SpawnPosition-un mövqeyinə uyğun yerləşdir (offset nəzərə alınır)
        levelInstance.transform.position = spawnPos.position + offset;
        levelInstance.transform.rotation = spawnPos.rotation; // Rotasiyanı da uyğunlaşdır

        // currentLevel dəyişənini yeni yaradılan level obyektinə təyin et
        
        currentLevel = levelInstance;
        
    }
    public bool whLevel
    {
        get { return level; }
    }
}
