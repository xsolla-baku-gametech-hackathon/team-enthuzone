using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class SnakeTeleporter : MonoBehaviour
{
    public static SnakeTeleporter Instance;

    public Vector3 offset = Vector3.up;

    private void Awake()
    {
        Instance = this;
    }

    public void TeleportSnake()
    {
        Transform startPos = LevelManager.Instance.currentLevel.transform.Find("StartPosition");


        transform.position = startPos.position + offset;
        transform.rotation = Quaternion.LookRotation(Vector3.right, Vector3.up);
    }
}
