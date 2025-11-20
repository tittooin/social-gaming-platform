using System;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Net.WebSockets;
using UnityEngine;
using UnityEngine.Networking;

public class GameAPI : MonoBehaviour
{
    [SerializeField] public string baseUrl = "http://localhost:4000";
    [SerializeField] public string authToken = ""; // set after login

    public async Task<(string matchId, string stateJson)> StartMatch(string gameType)
    {
        var url = $"{baseUrl}/game/start";
        var payload = JsonUtility.ToJson(new StartReq { game_type = gameType });
        using (var req = UnityWebRequest.Post(url, payload))
        {
            byte[] bodyRaw = Encoding.UTF8.GetBytes(payload);
            req.uploadHandler = new UploadHandlerRaw(bodyRaw);
            req.downloadHandler = new DownloadHandlerBuffer();
            req.SetRequestHeader("Content-Type", "application/json");
            if (!string.IsNullOrEmpty(authToken)) req.SetRequestHeader("Authorization", $"Bearer {authToken}");
            var op = req.SendWebRequest();
            while (!op.isDone) await Task.Yield();
            if (req.result != UnityWebRequest.Result.Success)
                throw new Exception($"StartMatch failed: {req.error}");
            var resp = JsonUtility.FromJson<StartResp>(req.downloadHandler.text);
            return (resp.match_id.ToString(), JsonUtility.ToJson(resp.state));
        }
    }

    public async Task<string> SendMove(string gameType, long matchId, object move, int cpu = 0)
    {
        var url = $"{baseUrl}/game/move";
        var reqObj = new MoveReq { game_type = gameType, match_id = matchId, move = move, cpu = cpu };
        var payload = JsonUtility.ToJson(reqObj);
        using (var req = UnityWebRequest.Post(url, payload))
        {
            byte[] bodyRaw = Encoding.UTF8.GetBytes(payload);
            req.uploadHandler = new UploadHandlerRaw(bodyRaw);
            req.downloadHandler = new DownloadHandlerBuffer();
            req.SetRequestHeader("Content-Type", "application/json");
            if (!string.IsNullOrEmpty(authToken)) req.SetRequestHeader("Authorization", $"Bearer {authToken}");
            var op = req.SendWebRequest();
            while (!op.isDone) await Task.Yield();
            if (req.result != UnityWebRequest.Result.Success)
                throw new Exception($"SendMove failed: {req.error}");
            return req.downloadHandler.text;
        }
    }

    public async Task<string> EndMatch(string gameType, long matchId, object payloadObj)
    {
        var url = $"{baseUrl}/game/end";
        var reqObj = new EndReq { game_type = gameType, match_id = matchId, payload = payloadObj };
        var payload = JsonUtility.ToJson(reqObj);
        using (var req = UnityWebRequest.Post(url, payload))
        {
            byte[] bodyRaw = Encoding.UTF8.GetBytes(payload);
            req.uploadHandler = new UploadHandlerRaw(bodyRaw);
            req.downloadHandler = new DownloadHandlerBuffer();
            req.SetRequestHeader("Content-Type", "application/json");
            if (!string.IsNullOrEmpty(authToken)) req.SetRequestHeader("Authorization", $"Bearer {authToken}");
            var op = req.SendWebRequest();
            while (!op.isDone) await Task.Yield();
            if (req.result != UnityWebRequest.Result.Success)
                throw new Exception($"EndMatch failed: {req.error}");
            return req.downloadHandler.text;
        }
    }

    public async Task<string> GetLeaderboard(string gameType, string period = "daily")
    {
        var url = $"{baseUrl}/game/leaderboard/{gameType}?period={period}";
        using (var req = UnityWebRequest.Get(url))
        {
            req.downloadHandler = new DownloadHandlerBuffer();
            if (!string.IsNullOrEmpty(authToken)) req.SetRequestHeader("Authorization", $"Bearer {authToken}");
            var op = req.SendWebRequest();
            while (!op.isDone) await Task.Yield();
            if (req.result != UnityWebRequest.Result.Success)
                throw new Exception($"GetLeaderboard failed: {req.error}");
            return req.downloadHandler.text;
        }
    }

#if UNITY_2020_1_OR_NEWER && !UNITY_WEBGL
    private ClientWebSocket ws;
    public async Task ConnectRealtime(string gameType, long matchId, Action<string> onMessage)
    {
        ws = new ClientWebSocket();
        var uri = new Uri($"ws://localhost:4000"); // Socket.IO uses its own protocol; for demo, raw ws
        await ws.ConnectAsync(uri, CancellationToken.None);
        // Simple loop demo: receive data
        _ = Task.Run(async () =>
        {
            var buf = new byte[4096];
            while (ws.State == WebSocketState.Open)
            {
                var res = await ws.ReceiveAsync(new ArraySegment<byte>(buf), CancellationToken.None);
                if (res.MessageType == WebSocketMessageType.Text)
                {
                    var msg = Encoding.UTF8.GetString(buf, 0, res.Count);
                    onMessage?.Invoke(msg);
                }
            }
        });
    }
#endif

    [Serializable]
    private struct StartReq { public string game_type; }
    [Serializable]
    private struct StartResp { public long match_id; public object state; }
    [Serializable]
    private struct MoveReq { public string game_type; public long match_id; public object move; public int cpu; }
    [Serializable]
    private struct EndReq { public string game_type; public long match_id; public object payload; }
}