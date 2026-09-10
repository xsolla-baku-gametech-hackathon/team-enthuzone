using System.Collections;
using UnityEngine;

public class CameraManager : MonoBehaviour
{
    public static CameraManager Instance;

    [SerializeField] private Transform target;
    [SerializeField] private float followSpeed = 5f;
    private Coroutine fovCoroutine;

    [Header("Distance Settings")]
    [SerializeField] private float distanceX; // sadece x inspector'da değişir
    private Vector3 distance; // y ve z otomatik

    public bool follow = true;
    private Vector3 fixedPosition;
    public Camera cam; // Kamera referansı

    private float yToXRatio; // y / x oranını tutar
    private float initialZ;  // z sabit

    private void Awake()
    {
        Instance = this;
        cam = GetComponent<Camera>();
    }

    private void Start()
    {
        if (target != null)
        {
            // Başlangıçta x ve y farkını al
            Vector3 initialOffset = transform.position - target.position;

           // distanceX = initialOffset.x; // x başlangıç pozisyonu
            yToXRatio = initialOffset.y / initialOffset.x; // y/x oranı
            initialZ = initialOffset.z; // z sabit

            distance = new Vector3(distanceX, distanceX * yToXRatio, initialZ);
        }
    }

    private void Update()
    {
        if (SnakeSizeManager.Instance.bigSize)
        {
            // -20'ye yavaşça düşür
            distanceX = Mathf.MoveTowards(distanceX, -18f, 2f * Time.deltaTime);
        }
        else
        {
            // -16'ya yavaşça çıkar
            distanceX = Mathf.MoveTowards(distanceX, -12f, 2f * Time.deltaTime);
        }

    }
    private void LateUpdate()
    {
        if (target == null) return;

        // x inspector'dan, y otomatik olarak orantılı
        distance = new Vector3(distanceX, distanceX * yToXRatio, initialZ);


        {
            if (follow)
            {
                transform.position = Vector3.Lerp(transform.position, target.position + distance, followSpeed);
                fixedPosition = transform.position;
            }
            if (!follow)
            {
                transform.position = Vector3.Lerp(transform.position, fixedPosition, followSpeed * Time.deltaTime);
            }
        }

    }

    public void ChangeFOV(float targetFOV, float duration)
    {
        // Eğer daha önce bir FOV değiştirme Coroutine çalışıyorsa durdur
        if (fovCoroutine != null)
        {
            StopCoroutine(fovCoroutine);
        }

        // Yeni Coroutine başlat ve referansını sakla
        fovCoroutine = StartCoroutine(ChangeFOVRoutine(targetFOV, duration));
    }

    private IEnumerator ChangeFOVRoutine(float targetFOV, float duration)
    {
        float startFOV = cam.fieldOfView;
        float elapsed = 0f;

        while (elapsed < duration)
        {
            elapsed += Time.deltaTime;
            cam.fieldOfView = Mathf.Lerp(startFOV, targetFOV, elapsed / duration);
            yield return null;
        }

        cam.fieldOfView = targetFOV;
        fovCoroutine = null; // Coroutine bittiğinde referansı temizle
    }






}
