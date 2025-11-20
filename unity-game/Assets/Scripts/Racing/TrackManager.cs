using UnityEngine;

namespace Racing {
  public class TrackManager : MonoBehaviour {
    public Transform waypointPrefab;
    public Transform[] waypoints;

    public void LoadTrack(Vector3[] points) {
      waypoints = new Transform[points.Length];
      for (int i = 0; i < points.Length; i++) {
        var wp = Instantiate(waypointPrefab, points[i], Quaternion.identity, transform);
        wp.name = "WP_" + i;
        waypoints[i] = wp;
      }
    }
  }
}