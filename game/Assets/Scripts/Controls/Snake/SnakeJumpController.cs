using DG.Tweening;
using System.Collections;
using UnityEngine;

public class SnakeJumpController : MonoBehaviour
{
    public float groundCheckDistance = 1f; // Mesafe sınırı
    public LayerMask groundLayer;            // Sadece "Ground" layer'ına bakar

    private void Update()
    {
        bool isGrounded = Physics.Raycast(transform.position, Vector3.down, groundCheckDistance, groundLayer);

        if (isGrounded)
        {
            JumpManager.Instance.isJumping = false;
            
        }
        else
        {
            
            JumpManager.Instance.isJumping = true;
            
        }



        

          
        



        // Debug için ışını sahnede göster
        Debug.DrawRay(transform.position, Vector3.down * groundCheckDistance, isGrounded ? Color.green : Color.red);
    }


}
