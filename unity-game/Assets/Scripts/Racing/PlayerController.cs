using UnityEngine;

namespace Racing {
  [RequireComponent(typeof(Rigidbody))]
  public class PlayerController : MonoBehaviour {
    public float acceleration = 12f;
    public float maxSpeed = 25f;
    public float brakeForce = 20f;
    public float steerSpeed = 3f;
    public float nitroBoost = 15f;
    public int nitroCharges = 5;

    public Transform attackHitbox;
    public float attackDuration = 0.2f;
    public float attackCooldown = 0.8f;

    private Rigidbody rb;
    private float steerInput;
    private float accelInput;
    private bool nitroPressed;
    private int nitroUsed;
    private float lastAttackTime;
    private bool attacking;

    void Awake() { rb = GetComponent<Rigidbody>(); }

    void Update() {
      accelInput = Input.GetAxis("Vertical");
      steerInput = Input.GetAxis("Horizontal");
      nitroPressed = Input.GetKeyDown(KeyCode.LeftShift);

      if (Input.GetKeyDown(KeyCode.Space)) TryAttack();
    }

    void FixedUpdate() {
      // Steering
      var turn = steerInput * steerSpeed;
      transform.Rotate(0f, turn, 0f);

      // Acceleration/brake
      if (accelInput > 0) {
        rb.AddForce(transform.forward * acceleration, ForceMode.Acceleration);
      } else if (accelInput < 0) {
        rb.AddForce(-transform.forward * brakeForce, ForceMode.Acceleration);
      }

      // Clamp speed
      var vel = rb.velocity;
      var forwardSpeed = Vector3.Dot(vel, transform.forward);
      var lateral = vel - transform.forward * forwardSpeed;
      var clampedForward = Mathf.Clamp(forwardSpeed, -maxSpeed, maxSpeed);
      rb.velocity = transform.forward * clampedForward + lateral * 0.95f; // damping

      // Nitro
      if (nitroPressed && nitroUsed < nitroCharges) {
        rb.AddForce(transform.forward * nitroBoost, ForceMode.VelocityChange);
        nitroUsed++;
      }
    }

    public int GetNitroUsed() => nitroUsed;

    void TryAttack() {
      if (Time.time - lastAttackTime < attackCooldown) return;
      lastAttackTime = Time.time; attacking = true;
      if (attackHitbox != null) {
        attackHitbox.gameObject.SetActive(true);
        Invoke(nameof(EndAttack), attackDuration);
      }
    }

    void EndAttack() {
      attacking = false;
      if (attackHitbox != null) attackHitbox.gameObject.SetActive(false);
    }
  }
}