using System;
using System.Collections.Generic;
using System.Data;
using UnityEngine;

public class SnakeController : MonoBehaviour
{
    public static SnakeController Instance;

    public float gravity = 50f;
    public float maxSpeed = 50f;
    public float normalSpeed = 20f;
    public float speed = 20f;
    public float rotationSpeed = 720f;
    public float bodySpeed = 30f;
    public int gap = 1;
    public float bodySpeedRatio = 0.75f;
    public float smoothnessRatio = 12f / 25f;

    public bool timeControl = false;

    private Rigidbody rb;
    private Vector3 targetMoveDirection = Vector3.right;
    public float driftSmoothness = 25f;
    private Vector3 moveDirection = Vector3.right;
    private Quaternion targetRotation;

    private bool dragBool= false;

    // Beden prefablari
    public GameObject bodyPrefab1;
    public GameObject bodyPrefab2;
    public GameObject bodyPrefab3;
    public GameObject bodyPrefab4;
    public GameObject bodyPrefab5;
    public GameObject bodyPrefab6;
    public GameObject tailPrefab;

    public List<GameObject> bodyParts = new List<GameObject>();
    private List<Vector3> positionHistory = new List<Vector3>();

    public int countbody = 0;

    // Dönüş sınırlamaları
    public float maxTurnAngle = 45f;
    public float currentTurnAngle = 0f;
    public float turnSpeed = 90f;
    public float turnSpeedDrag = 2f;
    public bool turn = false;
    public int turnDirection = 0; // -1 sola, 1 sağ, 0 noTurn

    public float sens = 0.01f;

    public float maxPos;
    private void Awake()
    {
        Instance = this;
        speed = normalSpeed;
    }

    void Start()
    {
        if (ResponsiveManager.Instance.IsMobile)
        {
            maxTurnAngle = 20f;
        }
        if (ResponsiveManager.Instance.IsDesktop)
        {
            maxTurnAngle = 35f;
        }




        for (int i = 0; i < 6; i++) GrowSnake();

        bool firstTime = PlayerPrefs.GetInt("firstTime", 1) == 1;

        if (firstTime)
        {
            // true ise çalışacak kod
          
            TimeManager.Instance.StopTime();
        }
        else
        {
            // false ise çalışacak kod
           ButtonManger.Instance.StartGame();
           
        }

        rb = GetComponent<Rigidbody>();
        rb.useGravity = false;
        rb.drag = 0f;
        rb.angularDrag = 0f;

        targetRotation = Quaternion.LookRotation(moveDirection);
        transform.rotation = targetRotation;
    }

    void FixedUpdate()
    {
       
        bodySpeed = rb.velocity.magnitude * bodySpeedRatio;
        if (rb.velocity.magnitude > maxSpeed)
        {
           rb.velocity = rb.velocity.normalized * maxSpeed;
        }
        if (!SnakeSizeManager.Instance.bigSize)
        {
           // driftSmoothness = speed * smoothnessRatio;
        }
        
        if (speed > maxSpeed)
        {
            speed = normalSpeed;
        }
        bool isOver = GameOverManager.Instance.isGameOver;

        if (!isOver)
        {
            if (turnDirection == 1)
                // currentTurnAngle += turnSpeed * Time.fixedDeltaTime * (dragBool?turnSpeedDrag:1);
                currentTurnAngle = dragBool ? 50 : 35;
            else if (turnDirection == -1)
                //currentTurnAngle -= turnSpeed * Time.fixedDeltaTime* (dragBool ? turnSpeedDrag : 1);
                currentTurnAngle = dragBool ? -50 : -35;
            else
                        currentTurnAngle = Mathf.Lerp(currentTurnAngle, 0f, driftSmoothness * Time.fixedDeltaTime);

            currentTurnAngle = Mathf.Clamp(currentTurnAngle, -maxTurnAngle, maxTurnAngle);

            Quaternion turnRotation = Quaternion.Euler(0f, currentTurnAngle, 0f);
            targetMoveDirection = turnRotation * Vector3.right;
        }

        moveDirection = Vector3.Lerp(moveDirection, targetMoveDirection, driftSmoothness * Time.fixedDeltaTime).normalized;

        Vector3 currentVelocity = rb.velocity;
        rb.velocity = new Vector3(
            moveDirection.x * speed,
            currentVelocity.y,
            moveDirection.z * speed
        );
        rb.AddForce(Vector3.down * gravity, ForceMode.Acceleration);

        if (rb.velocity != Vector3.zero)
        {
            targetRotation = Quaternion.LookRotation(rb.velocity);

            // Pitch (x ekseni) sınırlaması ±45°
            Vector3 euler = targetRotation.eulerAngles;
            if (euler.x > 180f) euler.x -= 360f;
            if (!JumpManager.Instance.isJumping)
            {
                euler.x = Mathf.Clamp(euler.x, -0f, 0f);
            }
            else
            {
                euler.x = Mathf.Clamp(euler.x, -60f, 60f);
            }

                targetRotation = Quaternion.Euler(euler);
        }

        transform.rotation = Quaternion.RotateTowards(transform.rotation, targetRotation, rotationSpeed * Time.fixedDeltaTime);

        positionHistory.Insert(0, transform.position);

        int index = 0;
        foreach (var body in bodyParts)
        {
            int historyIndex = Mathf.Min(index * gap, positionHistory.Count - 1);
            Vector3 point = positionHistory[historyIndex];
            Vector3 moveDir = point - body.transform.position;

            body.transform.position += moveDir * bodySpeed * Time.fixedDeltaTime;
            body.transform.LookAt(point);
            index++;
        }

        if (!JumpManager.Instance.isJumping)
        {
            //sol -13
            //sag  12


            if (transform.localPosition.x <= -maxPos)
            {
                
                transform.localPosition = new Vector3(-maxPos, transform.localPosition.y, transform.localPosition.z);
                transform.rotation = Quaternion.Euler(transform.rotation.x, 90, transform.rotation.z);

            }
            else if (transform.localPosition.x >= maxPos-1)
            {
                


                transform.localPosition = new Vector3(maxPos-1, transform.localPosition.y, transform.localPosition.z);

                transform.rotation = Quaternion.Euler(transform.rotation.x, 90, transform.rotation.z);

            }
        }
    }
    private void Update()
    {
        
    }
    public void GrowSnake()
    {
        countbody++;
        if (countbody > 25) return;

        Vector3 spawnPosition = bodyParts.Count == 0 ? transform.position - transform.forward * 0.5f :
            bodyParts[bodyParts.Count - 1].transform.position - bodyParts[bodyParts.Count - 1].transform.forward * 0.5f;

        if (bodyParts.Count > 0)
        {
            GameObject previousTail = bodyParts[bodyParts.Count - 1];
            GameObject newBody = Instantiate(bodyPrefab1, previousTail.transform.position, previousTail.transform.rotation);
            Destroy(previousTail);
            bodyParts[bodyParts.Count - 1] = newBody;
        }

        GameObject tail = Instantiate(tailPrefab, spawnPosition, Quaternion.identity);
        tail.transform.rotation = bodyParts.Count > 0 ? bodyParts[bodyParts.Count - 1].transform.rotation : transform.rotation;

        bodyParts.Add(tail);
    }

    public void FreezAll()
    {
        transform.rotation = Quaternion.identity;
    }
    public void NoFreezAll()
    {
        rb.constraints = RigidbodyConstraints.None;
    }
    public void JumpBlock(float jumpForce)
    {
        rb.AddForce(Vector3.up * jumpForce, ForceMode.Impulse);
    }
    public void TurnSnakeRight(bool drag)
    {
        dragBool = drag;
        turnDirection = 1;
       // transform.position = new Vector3(transform.position.x, transform.position.y, transform.position.z - sens);
    }
    public void TurnSnakeLeft(bool drag)
    {
        dragBool = drag;
        turnDirection = -1;
       // transform.position = new Vector3(transform.position.x, transform.position.y, transform.position.z + sens);
    }
    public void NoTurn() => turnDirection = 0;
}
