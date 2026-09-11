using System.Collections;
using System.Collections.Generic;
using System.Transactions;
using UnityEngine;

public class SnakeBuffManager : MonoBehaviour
{
    public static SnakeBuffManager Instance;

    private void Awake()
    {
        Instance = this;
    }

    public void SpeedUp()
    {
        float currentSpeed = SnakeController.Instance.speed;
        SnakeController.Instance.speed += 5;
        
    }


}
