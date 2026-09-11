using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using static UnityEngine.ParticleSystem;

public class ParticleManager : MonoBehaviour
{
    public static ParticleManager Instance;
    public ParticleSystem snakeBuffParticle;
    private void Awake()
    {
        Instance = this;
    }

    public void PlayBuffParticle()
    {
        snakeBuffParticle.Play();
    }

   
}
