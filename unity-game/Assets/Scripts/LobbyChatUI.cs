using UnityEngine;
using UnityEngine.UI;

public class LobbyChatUI : MonoBehaviour
{
    public ChatManager Chat;
    public InputField MessageInput;
    public Text ChatLog;
    public Text StatusText;

    public void ConnectLobby()
    {
        if (Chat == null)
        {
            StatusText.text = "ChatManager not assigned";
            return;
        }
        Chat.ConnectLobbyChat((msg) =>
        {
            ChatLog.text += "\n" + msg;
        });
        StatusText.text = "Lobby connected";
    }

    public void SendMessage()
    {
        if (Chat == null)
        {
            StatusText.text = "ChatManager not assigned";
            return;
        }
        var text = MessageInput != null ? MessageInput.text : "";
        if (!string.IsNullOrEmpty(text))
        {
            Chat.SendLobbyMessage(text);
            MessageInput.text = "";
        }
    }
}