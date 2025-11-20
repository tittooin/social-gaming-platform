using UnityEngine;

namespace Racing {
  [RequireComponent(typeof(Rigidbody))]
  public class AIController : MonoBehaviour {
    public Transform[] waypoints;
    public int targetIndex = 0;
    public float baseSpeed = 18f;
    public int aggression = 1; // 0..3
    public int difficulty = 1; // 0..2
    public Transform player;

    private Rigidbody rb;

    void Awake() { rb = GetComponent<Rigidbody>(); }

    void FixedUpdate() {
      if (waypoints == null || waypoints.Length == 0) return;
      var target = waypoints[targetIndex % waypoints.Length];
      var dir = (target.position - transform.position);
      dir.y = 0f;
      var dist = dir.magnitude;
      dir = dir.normalized;

      // Speed variance and rubber-banding
      float speed = baseSpeed + difficulty * 2 + Random.Range(-0.75f, 0.75f);
      float dToPlayer = (player ? Vector3.Distance(transform.position, player.position) : 0f);
      if (player) {
        if (dToPlayer > 50f) speed += 4f; else if (dToPlayer < 20f) speed -= 2f;
      }
      speed += aggression * 1.2f;

      // Move and steer
      var desiredVel = dir * speed;
      rb.velocity = Vector3.Lerp(rb.velocity, desiredVel, 0.15f);
      if (desiredVel.sqrMagnitude > 0.1f) {
        var rot = Quaternion.LookRotation(desiredVel, Vector3.up);
        transform.rotation = Quaternion.Slerp(transform.rotation, rot, 0.2f);
      }

      // Advance waypoint
      if (dist < 4f) targetIndex = (targetIndex + 1) % waypoints.Length;

      // Attack logic (inform other systems)
      if (player && dToPlayer < 5f) {
        float chance = 0.05f + 0.05f * aggression; // 5..20%
        if (Random.value < chance) {
          // Here you can trigger a slow-down or animation event
        }
      }
    }
  }
}