using System;
using System.Collections.Generic;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using UnityEngine;
using UnityEngine.Networking;

[System.Serializable]
public class TelemetryEvent
{
    public string eventId;
    public string playerId;
    public string sessionId;
    public string target;
    public string eventType;
    public int duration;
    public string build;
}

[System.Serializable]
public class TelemetryPayload
{
    public List<TelemetryEvent> events;
}

public class TelemetrySender : MonoBehaviour
{
    // Singleton Instance
    public static TelemetrySender Instance { get; private set; }

    private const string ApiUrl = "http://169.58.183.137:3000/api/platform/ingest/telemetry";
    private const string ApiKey = "I2UxatyUGOGkWRNzOPzzmsptioQoif4z9A06PaY7jjc";

    private CancellationTokenSource _cts;
    private List<TelemetryEvent> _mockEventsPool;
    private int _currentIndex = 0;
    private bool _isRunning = false;

    private void Awake()
    {
        // Singleton Configuration
        if (Instance == null)
        {
            Instance = this;
            DontDestroyOnLoad(gameObject);
        }
        else
        {
            Destroy(gameObject);
            return;
        }
    }

    void Start()
    {
        // Initialize mock data pool on start
        InitializeMockData();
    }

    /// <summary>
    /// Starts the telemetry request loop (Sends data every 5 seconds).
    /// </summary>
    public void StartRequest()
    {
        if (_isRunning)
        {
            Debug.LogWarning("Telemetry tracking is already running!");
            return;
        }

        _cts = new CancellationTokenSource();
        _isRunning = true;
        Debug.Log("Telemetry tracking started.");

        _ = SendLoopAsync(_cts.Token);
    }

    /// <summary>
    /// Stops the telemetry request loop.
    /// </summary>
    public void EndRequest()
    {
        if (!_isRunning) return;

        _cts?.Cancel();
        _isRunning = false;
        Debug.Log("Telemetry tracking stopped.");
    }

    private async Task SendLoopAsync(CancellationToken token)
    {
        while (!token.IsCancellationRequested)
        {
            TelemetryEvent currentEvent = _mockEventsPool[_currentIndex];
            _currentIndex = (_currentIndex + 1) % _mockEventsPool.Count;

            await SendTelemetryDataAsync(currentEvent);

            try
            {
                // Wait for 5 seconds
                await Task.Delay(5000, token);
            }
            catch (TaskCanceledException)
            {
                break;
            }
        }
    }

    private async Task SendTelemetryDataAsync(TelemetryEvent telemetryEvent)
    {
        TelemetryPayload payload = new TelemetryPayload
        {
            events = new List<TelemetryEvent> { telemetryEvent }
        };

        string jsonData = JsonUtility.ToJson(payload);
        byte[] bodyRaw = Encoding.UTF8.GetBytes(jsonData);

        using (UnityWebRequest request = new UnityWebRequest(ApiUrl, "POST"))
        {
            request.uploadHandler = new UploadHandlerRaw(bodyRaw);
            request.downloadHandler = new DownloadHandlerBuffer();

            request.SetRequestHeader("Content-Type", "application/json");
            request.SetRequestHeader("x-api-key", ApiKey);

            var operation = request.SendWebRequest();

            while (!operation.isDone)
            {
                await Task.Yield();
            }

            if (request.result == UnityWebRequest.Result.Success)
            {
                Debug.Log($"[Telemetry Sent] EventID: {telemetryEvent.eventId} | Type: {telemetryEvent.eventType} | Target: {telemetryEvent.target}");
            }
            else
            {
                Debug.LogError($"[Telemetry Error] {request.error} | Code: {request.responseCode} | Response: {request.downloadHandler.text}");
            }
        }
    }

    private void InitializeMockData()
    {
        string[] eventTypes = { "start", "attempt", "complete", "quit", "session_end" };

        // Target names restricted strictly to level formats as requested
        string[] targets = { "level_1", "level_2", "level_3", "level_4", "level_5", "level_6" };

        string[] playerIds = { "player-123", "player-456", "player-789", "player-999" };
        string sessionId = "session-" + UnityEngine.Random.Range(1000, 9999);

        _mockEventsPool = new List<TelemetryEvent>();

        // Generate 50 rich mock telemetry records
        for (int i = 1; i <= 50; i++)
        {
            _mockEventsPool.Add(new TelemetryEvent
            {
                eventId = "evt-uuid-" + Guid.NewGuid().ToString().Substring(0, 8),
                playerId = playerIds[UnityEngine.Random.Range(0, playerIds.Length)],
                sessionId = sessionId,
                target = targets[UnityEngine.Random.Range(0, targets.Length)],
                eventType = eventTypes[UnityEngine.Random.Range(0, eventTypes.Length)],
                duration = UnityEngine.Random.Range(10, 300),
                build = "1.0.0"
            });
        }

        Debug.Log($"[Telemetry] {_mockEventsPool.Count} mock events successfully generated.");
    }

    private void OnDestroy()
    {
        if (Instance == this)
        {
            EndRequest();
        }
    }
}