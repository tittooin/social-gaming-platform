using UnityEngine;
using UnityEngine.UI;

public class DMChatUI : MonoBehaviour
{
    public ChatManager Chat;
    public InputField PeerUserIdInput;
    public InputField MessageInput;
    public Text ChatLog;
    public Text StatusText;

    public void ConnectDM()
    {
        var peer = PeerUserIdInput != null ? PeerUserIdInput.text : null;
        if (string.IsNullOrEmpty(peer)) { StatusText.text = "Enter peer user id"; return; }
        Chat.ConnectDMChat(peer, (msg) => { ChatLog.text += "\n" + msg; });
        StatusText.text = "DM connected";
    }

    public void SendMessage()
    {
        var text = MessageInput != null ? MessageInput.text : "";
        if (!string.IsNullOrEmpty(text))
        {
            Chat.SendDMMessage(text);
            MessageInput.text = "";
        }
    }
}