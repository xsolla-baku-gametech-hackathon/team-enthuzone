using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class TimeManager : MonoBehaviour
{
    public static TimeManager Instance;

    private void Awake()
    {
        Instance = this;
    }

    public void StopTime()
    {
        Time.timeScale = 0f;
    }

    public void StartTime()
    {
        Time.timeScale = 1f;
    }
}
