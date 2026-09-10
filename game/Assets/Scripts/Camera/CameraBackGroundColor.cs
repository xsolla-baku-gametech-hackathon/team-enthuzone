using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class CameraBackGroundColor : MonoBehaviour
{
    [SerializeField] Color[] backGroundColor;
    void Start()
    {
        Camera.main.backgroundColor = backGroundColor[0];
    }

 
}
