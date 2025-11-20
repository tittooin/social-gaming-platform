using UnityEngine;
using System.Collections;
using UnityEngine.Networking;

namespace Racing {
  public class RaceManager : MonoBehaviour {
    public Transform[] checkpoints;
    public PlayerController player;
    public AIController[] aiOpponents;
    public string baseUrl = "http://localhost:4000";
    public string authToken = "";
    public string gameType = "bike"; // or "car"
    public string trackId = "forest_road_rash";

    private string raceId;
    private float raceStartTime;
    private bool raceActive;
    private int nextCheckpointIndex;
    private int nitroUsed;
    private System.Collections.Generic.List<Vector3> positions = new System.Collections.Generic.List<Vector3>();

    IEnumerator Start() {
      // Countdown
      yield return new WaitForSeconds(1f);
      yield return StartRace();
    }

    void Update() {
      if (raceActive) {
        positions.Add(player.transform.position);
      }
    }

    IEnumerator StartRace() {
      var url = baseUrl + "/racing/start";
      var bodyObj = new { game_type = gameType, track_id = trackId };
      var json = JsonUtility.ToJson(bodyObj);
      using (var req = UnityWebRequest.Post(url, json)) {
        byte[] bodyRaw = System.Text.Encoding.UTF8.GetBytes(json);
        req.uploadHandler = new UploadHandlerRaw(bodyRaw);
        req.downloadHandler = new DownloadHandlerBuffer();
        req.SetRequestHeader("Content-Type", "application/json");
        if (!string.IsNullOrEmpty(authToken)) req.SetRequestHeader("Authorization", "Bearer " + authToken);
        yield return req.SendWebRequest();
        if (req.result != UnityWebRequest.Result.Success) {
          Debug.LogError("StartRace failed: " + req.error);
        } else {
          var resp = JsonUtility.FromJson<StartResp>(req.downloadHandler.text);
          raceId = resp.race_id; raceStartTime = Time.time; raceActive = true; nextCheckpointIndex = 0; nitroUsed = 0;
        }
      }
    }

    public void OnCheckpoint(Transform cp) {
      // simple ordered checkpoint detection
      if (checkpoints[nextCheckpointIndex] == cp) {
        nextCheckpointIndex++;
      }
    }

    public IEnumerator FinishRace(int[] rivalsTimesMs) {
      if (!raceActive) yield break;
      raceActive = false;
      int finishMs = (int)((Time.time - raceStartTime) * 1000f);
      nitroUsed = player.GetNitroUsed();
      var payload = new Payload {
        finishTimeMs = finishMs,
        checkpointsHit = new int[] { }, // for simplicity, send indices from server track
        nitroUsed = nitroUsed,
        positions = positions.ToArray(),
        rivalsTimesMs = rivalsTimesMs
      };
      var reqObj = new SubmitReq { race_id = raceId, game_type = gameType, track_id = trackId, payload = payload };
      var json = JsonUtility.ToJson(reqObj);
      var url = baseUrl + "/racing/finish";
      using (var req = UnityWebRequest.Post(url, json)) {
        byte[] bodyRaw = System.Text.Encoding.UTF8.GetBytes(json);
        req.uploadHandler = new UploadHandlerRaw(bodyRaw);
        req.downloadHandler = new DownloadHandlerBuffer();
        req.SetRequestHeader("Content-Type", "application/json");
        if (!string.IsNullOrEmpty(authToken)) req.SetRequestHeader("Authorization", "Bearer " + authToken);
        yield return req.SendWebRequest();
        if (req.result != UnityWebRequest.Result.Success) {
          Debug.LogError("FinishRace failed: " + req.error);
        } else {
          Debug.Log("Finish response: " + req.downloadHandler.text);
        }
      }
    }

    [System.Serializable]
    private struct StartResp { public string race_id; public string seed; }
    [System.Serializable]
    private struct Payload { public int finishTimeMs; public int[] checkpointsHit; public int nitroUsed; public Vector3[] positions; public int[] rivalsTimesMs; }
    [System.Serializable]
    private struct SubmitReq { public string race_id; public string game_type; public string track_id; public Payload payload; }
  }
}