using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class TrailManager : MonoBehaviour
{
    public GameObject trail;
   
    void Update()
    {
        if (SnakeController.Instance.speed >= 35)
        {
            trail.SetActive(true);
        }
        else
        {
            trail.SetActive(false);
        }
    }
}
