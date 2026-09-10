using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class SaveLoadTransform : MonoBehaviour
{
    public static SaveLoadTransform Instance;

    
    [SerializeField] private List<Vector3> positionList = new List<Vector3>();
    [SerializeField] private List<Quaternion> rotationList = new List<Quaternion>();

    private Queue<Vector3> positionHistory = new Queue<Vector3>();
    private Queue<Quaternion> rotationHistory = new Queue<Quaternion>();

    public int historyLength = 4; // 4 saniye
    private float timer = 0f;
    public float freezeTimeAfterRewind = 3f;
    public bool isRecording = true;

    private void Awake()
    {
        Instance = this;
    }

    void Update()
    {
        if (isRecording && GameOverManager.Instance.gameOver == false)
        {
            timer += Time.deltaTime;
            if (timer >= 1f)
            {
                positionHistory.Enqueue(transform.position);
                rotationHistory.Enqueue(transform.rotation);

                while (positionHistory.Count > historyLength)
                    positionHistory.Dequeue();
                while (rotationHistory.Count > historyLength)
                    rotationHistory.Dequeue();

                timer = 0f;
            }
        }

        // Inspector için Queue'yu List'e kopyala (kaydı durdurduysan da gözükür)
        positionList = new List<Vector3>(positionHistory);
        rotationList = new List<Quaternion>(rotationHistory);

        if (Input.GetKeyDown(KeyCode.E))
        {
            Rewind();
        }
        if (ButtonManger.Instance.reSpawn)
        {
            Rewind();
            ButtonManger.Instance.reSpawn = false;
        }
    }




   

    public void Rewind()
    {
        if (positionHistory.Count > 0)
        {
            transform.position = positionHistory.Peek();
            transform.rotation = rotationHistory.Peek();
           // Debug.Log("4 saniye önceki haline dönüldü!");

            // Işınlamadan sonra tüm kayıtları temizle
            positionHistory.Clear();
            rotationHistory.Clear();
            timer = 0f;

            // UI ve diğer işlemler
            
            StartCoroutine(FreezeTimeCoroutine());
        }
        else
        {
            //Debug.Log("Henüz yeterli kayıt yok!");
        }
    }
    private IEnumerator FreezeTimeCoroutine()
    {
        TimeManager.Instance.StopTime(); // zamanı durdur
        yield return new WaitForSecondsRealtime(freezeTimeAfterRewind); // gerçek zaman bekleme
        TimeManager.Instance.StartTime(); // zamanı başlat
    }
}
