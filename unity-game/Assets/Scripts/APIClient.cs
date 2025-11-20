using System.Collections;
using System.Text;
using UnityEngine;
using UnityEngine.Networking;

public class APIClient : MonoBehaviour
{
    [Header("Backend Config")]
    public string baseUrl = "http://localhost:4000";
    public string bearerToken = ""; // Supabase access token from OTP verify

    public IEnumerator SendRequest(string endpoint, string method, string jsonBody, System.Action<long, string> callback)
    {
        string url = baseUrl.TrimEnd('/') + endpoint;
        UnityWebRequest req;

        if (method == "GET")
        {
            req = UnityWebRequest.Get(url);
        }
        else
        {
            byte[] bodyRaw = Encoding.UTF8.GetBytes(string.IsNullOrEmpty(jsonBody) ? "{}" : jsonBody);
            req = new UnityWebRequest(url, method);
            req.uploadHandler = new UploadHandlerRaw(bodyRaw);
            req.downloadHandler = new DownloadHandlerBuffer();
            req.SetRequestHeader("Content-Type", "application/json");
        }

        if (!string.IsNullOrEmpty(bearerToken))
        {
            req.SetRequestHeader("Authorization", "Bearer " + bearerToken);
        }

        yield return req.SendWebRequest();
        callback(req.responseCode, req.downloadHandler.text);
    }

    public IEnumerator GetWallet(System.Action<long, string> callback)
    {
        return SendRequest("/wallet", "GET", null, callback);
    }

    public IEnumerator StartMatch(System.Action<long, string> callback)
    {
        return SendRequest("/match/start", "POST", "{}", callback);
    }

    public IEnumerator EndMatch(string matchId, int clientRoll, System.Action<long, string> callback)
    {
        string body = JsonUtility.ToJson(new EndMatchBody { matchId = matchId, clientRoll = clientRoll });
        return SendRequest("/match/end", "POST", body, callback);
    }

    [System.Serializable]
    private class EndMatchBody
    {
        public string matchId;
        public int clientRoll;
    }
}