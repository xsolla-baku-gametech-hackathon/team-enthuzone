using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class EnvColor : MonoBehaviour
{
    public static EnvColor Instance;
    public bool change = false;

    [Header("References")]
    [SerializeField] private Camera targetCamera;
    [SerializeField] private GameObject targetObject;

    [Header("Materials")]
    [SerializeField] private Material[] envMaterials;

    [Header("Transition")]
    [SerializeField] private float transitionDuration = 1f;

    private void Awake()
    {
        Instance = this;
    }

    //private void Update()
    //{
    //    if (Input.GetKeyDown(KeyCode.C))
    //    {
    //        ChangeColor();
    //    }
    //}

    public void ChangeColor()
    {
       
        
            // Rastgele materyal seç
            int randomIndex = Random.Range(0, envMaterials.Length);
            Material chosenMat = envMaterials[randomIndex];
            Color targetColor = chosenMat.color;
            UIManager.Instance.Fade.GetComponent<UnityEngine.UI.Image>().color = targetColor;

            // currentLevel ve oldLevel üzerinde uygula
            GameObject[] levels = new GameObject[]
            {
            LevelManager.Instance.currentLevel,
            LevelManager.Instance.oldLevel
            };

            foreach (GameObject level in levels)
            {
                if (level == null) continue;

                // Env altındaki tüm Renderer'lar
                Transform envParent = level.transform.Find("Env");
                if (envParent != null)
                {
                    foreach (Renderer r in envParent.GetComponentsInChildren<Renderer>())
                    {
                        StartCoroutine(LerpMaterialColor(r, targetColor, transitionDuration));
                    }
                }

                // Blocks altındaki tüm Renderer'lar
                Transform blocksParent = level.transform.Find("Blocks");
                if (blocksParent != null)
                {
                    foreach (Renderer r in blocksParent.GetComponentsInChildren<Renderer>())
                    {
                        StartCoroutine(LerpMaterialColor(r, targetColor, transitionDuration));
                    }
                }


                // Target Object (sadece kendi Renderer’ına uygula)
                if (targetObject != null)
                {
                    Renderer objRenderer = targetObject.GetComponent<Renderer>();
                    if (objRenderer != null)
                    {
                        StartCoroutine(LerpMaterialColor(objRenderer, targetColor, transitionDuration));
                    }
                }

                // Kamera fog rengi
                if (targetCamera != null)
                {
                    StartCoroutine(LerpFogColor(targetColor, transitionDuration));
                }
               
            }
       
        
    }

    private IEnumerator LerpMaterialColor(Renderer renderer, Color targetColor, float duration)
    {
        if (renderer == null) yield break;

        Material mat = renderer.material;
        Color startColor = mat.color;
        float time = 0f;

        while (time < duration)
        {
            mat.color = Color.Lerp(startColor, targetColor, time / duration);
            time += Time.deltaTime;
            yield return null;
        }

        mat.color = targetColor;
    }

    private IEnumerator LerpFogColor(Color targetColor, float duration)
    {
        RenderSettings.fog = true;
        Color startColor = RenderSettings.fogColor;
        float time = 0f;

        while (time < duration)
        {
            RenderSettings.fogColor = Color.Lerp(startColor, targetColor, time / duration);
            time += Time.deltaTime;
            yield return null;
        }

        RenderSettings.fogColor = targetColor;
    }
}
