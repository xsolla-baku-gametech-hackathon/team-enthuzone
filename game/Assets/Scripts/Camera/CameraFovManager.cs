using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class CameraFovManager : MonoBehaviour
{



    private void Update()
    {
        float speed = SnakeController.Instance.speed;
        if (speed < 20)
        {
            CameraManager.Instance.ChangeFOV(40, 1f);
        }
        if (speed == 20 )
        {
            CameraManager.Instance.ChangeFOV(45, 1f);
        }
        if (speed >=20 && speed <= 30) 
        {
            CameraManager.Instance.ChangeFOV(55, 1f);
        }
        if (speed >= 30 && speed <= 40)
        {
            CameraManager.Instance.ChangeFOV(58, 1f);
        }
        if (speed >= 40 && speed <= 50)
        {
            CameraManager.Instance.ChangeFOV(62, 1f);
        }
    }
}
