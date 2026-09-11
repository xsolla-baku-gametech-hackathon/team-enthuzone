using UnityEngine;

public class SnakeKeyBoardControl : MonoBehaviour
{
    private bool isDragging = false;
    private Vector2 lastMousePosition;
    public float turnSensitivity = 0.1f;
    public float mobileTurnSensitivity = 1f;

    private bool turnRight = false;
    private bool turnLeft = false;
    Vector2 currentMousePosition;



    void Update()
    {
        //if (ResponsiveManager.Instance.IsMobile)
        //{
        //    turnSensitivity = mobileTurnSensitivity;
        //}
        //else
        //{

        //}

        //if (ResponsiveManager.Instance.IsDesktop)
        {
            turnSensitivity = 0.1f;
            // 🎮 Klavye kontrolü
            bool keyboardRight = Input.GetKey(KeyCode.D) || Input.GetKey(KeyCode.RightArrow);
            bool keyboardLeft = Input.GetKey(KeyCode.A) || Input.GetKey(KeyCode.LeftArrow);

            float dragDeltaX = 0f;

            turnRight = keyboardRight;
            turnLeft = keyboardLeft;
            // 🖱️ Mouse drag kontrolü
            if (Input.GetMouseButtonDown(0))
            {
                isDragging = true;

            }
            if (Input.GetMouseButton(0))
            {
                currentMousePosition = Input.mousePosition;
                dragDeltaX = currentMousePosition.x - lastMousePosition.x;
                lastMousePosition = currentMousePosition;
                turnRight = keyboardRight || (dragDeltaX > turnSensitivity);
                turnLeft = keyboardLeft || (dragDeltaX < -turnSensitivity);
            }
            if (Input.GetMouseButtonUp(0))
            {
                isDragging = false;

            }



            // 🔀 Yön belirleme


            // 🐍 Yılan yönlendirme
            if ((turnRight && turnLeft) || (!turnRight && !turnLeft))
                SnakeController.Instance.NoTurn();
            else if (turnRight)
                SnakeController.Instance.TurnSnakeRight(isDragging);
            else if (turnLeft)
                SnakeController.Instance.TurnSnakeLeft(isDragging);

            // ⏸️ Escape ile durdurma
            if (Input.GetKeyDown(KeyCode.Escape) && !GameOverManager.Instance.gameOver && !UIManager.Instance.menuUI.activeSelf)
                ButtonManger.Instance.PauseGame();
        }

            if (Input.GetKeyDown(KeyCode.Space) && UIManager.Instance.gameUI.activeSelf)
            {
                ButtonManger.Instance.SpeedUp();
            }
                

        if (ResponsiveManager.Instance.IsMobile)
        {
            {
               





            }


        }
    }





    public void LeftTurn()
    {
        SnakeController.Instance.TurnSnakeLeft(false);
    }
    public void RightTurn()
    {
        SnakeController.Instance.TurnSnakeRight(false);
    }

    public void NoTurn()
    {
        SnakeController.Instance.NoTurn();
    }
}