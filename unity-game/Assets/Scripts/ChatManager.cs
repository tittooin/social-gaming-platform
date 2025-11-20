using System;
using UnityEngine;
using WebSocketSharp;

public class ChatManager : MonoBehaviour
{
    public SocialAPI Api;
    public string BaseWsUrl = "ws://localhost:4000";

    private WebSocket lobbyWs;
    private WebSocket dmWs;

    public void ConnectLobbyChat(Action<string> onMsg)
    {
        var url = BaseWsUrl + "/ws/lobby?token=" + Api.Token;
        lobbyWs = new WebSocket(url);
        lobbyWs.OnMessage += (s, e) => onMsg?.Invoke(e.Data);
        lobbyWs.Connect();
    }

    public void ConnectDMChat(string peerUserId, Action<string> onMsg)
    {
        var url = BaseWsUrl + "/ws/dm?token=" + Api.Token + "&peer=" + peerUserId;
        dmWs = new WebSocket(url);
        dmWs.OnMessage += (s, e) => onMsg?.Invoke(e.Data);
        dmWs.Connect();
    }

    public void SendLobbyMessage(string text)
    {
        if (lobbyWs != null && lobbyWs.IsAlive) lobbyWs.Send(text);
    }

    public void SendDMMessage(string text)
    {
        if (dmWs != null && dmWs.IsAlive) dmWs.Send(text);
    }

    private void OnDestroy()
    {
        lobbyWs?.Close();
        dmWs?.Close();
    }
}