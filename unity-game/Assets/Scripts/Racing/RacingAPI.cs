using UnityEngine;
using UnityEngine.Networking;
using System.Text;
using System.Collections;

namespace Racing {
  public class RacingAPI : MonoBehaviour {
    public string baseUrl = "http://localhost:4002";
    public string authToken = "";

    public IEnumerator StartRace(string gameType, string trackId, System.Action<long, string> cb) {
      var url = baseUrl + "/racing/start";
      var obj = new ReqStart { game_type = gameType, track_id = trackId };
      var json = JsonUtility.ToJson(obj);
      using (var req = UnityWebRequest.Post(url, json)) {
        byte[] raw = Encoding.UTF8.GetBytes(json);
        req.uploadHandler = new UploadHandlerRaw(raw);
        req.downloadHandler = new DownloadHandlerBuffer();
        req.SetRequestHeader("Content-Type", "application/json");
        if (!string.IsNullOrEmpty(authToken)) req.SetRequestHeader("Authorization", "Bearer " + authToken);
        yield return req.SendWebRequest();
        cb((long)req.responseCode, req.downloadHandler.text);
      }
    }

    public IEnumerator SubmitRaceResult(string raceId, string gameType, string trackId, string payloadJson, System.Action<long, string> cb) {
      var url = baseUrl + "/racing/finish";
      var obj = new ReqFinish { race_id = raceId, game_type = gameType, track_id = trackId, payload = payloadJson };
      var json = JsonUtility.ToJson(obj);
      using (var req = UnityWebRequest.Post(url, json)) {
        byte[] raw = Encoding.UTF8.GetBytes(json);
        req.uploadHandler = new UploadHandlerRaw(raw);
        req.downloadHandler = new DownloadHandlerBuffer();
        req.SetRequestHeader("Content-Type", "application/json");
        if (!string.IsNullOrEmpty(authToken)) req.SetRequestHeader("Authorization", "Bearer " + authToken);
        yield return req.SendWebRequest();
        cb((long)req.responseCode, req.downloadHandler.text);
      }
    }

    public IEnumerator GetLeaderboard(string trackId, string period, System.Action<long, string> cb) {
      var url = baseUrl + "/racing/leaderboard?track=" + trackId + "&period=" + period;
      using (var req = UnityWebRequest.Get(url)) {
        req.downloadHandler = new DownloadHandlerBuffer();
        if (!string.IsNullOrEmpty(authToken)) req.SetRequestHeader("Authorization", "Bearer " + authToken);
        yield return req.SendWebRequest();
        cb((long)req.responseCode, req.downloadHandler.text);
      }
    }

    [System.Serializable]
    private struct ReqStart { public string game_type; public string track_id; }
    [System.Serializable]
    private struct ReqFinish { public string race_id; public string game_type; public string track_id; public string payload; }
  }
}