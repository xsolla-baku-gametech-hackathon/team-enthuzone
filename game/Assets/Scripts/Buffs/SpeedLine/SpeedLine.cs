using UnityEngine;

public class SpeedLine : MonoBehaviour
{
    public Vector2 offsetChange; 

    private Renderer objRenderer;

    void Start()
    {
        objRenderer = GetComponent<Renderer>();
    }

    void Update()
    {
        // Offset'i sürekli kaydırmak
        objRenderer.material.mainTextureOffset += offsetChange * Time.deltaTime;
    }
}
