// This script creates a demo scene with UI wired to Profile, Post, and Lobby chat.
#if UNITY_EDITOR
using UnityEditor;
using UnityEditor.Events;
using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.UI;

public static class SocialDemoSceneCreator
{
    [MenuItem("Tools/Create Social Demo Scene")]
    public static void CreateScene()
    {
        var scene = EditorSceneManager.NewScene(NewSceneSetup.DefaultGameObjects, NewSceneMode.Single);

        // Canvas & EventSystem are already created with DefaultGameObjects in newer Unity;
        // ensure Canvas exists and has required components.
        Canvas canvas = Object.FindObjectOfType<Canvas>();
        if (canvas == null)
        {
            var canvasGO = new GameObject("Canvas");
            canvas = canvasGO.AddComponent<Canvas>();
            canvas.renderMode = RenderMode.ScreenSpaceOverlay;
            canvasGO.AddComponent<CanvasScaler>();
            canvasGO.AddComponent<GraphicRaycaster>();
        }
        var root = canvas.transform;

        // Managers
        var apiGO = new GameObject("SocialAPI");
        var api = apiGO.AddComponent<SocialAPI>();
        api.BaseUrl = "http://localhost:4000";

        var profileGO = new GameObject("ProfileManager");
        var profile = profileGO.AddComponent<ProfileManager>();
        profile.Api = api;

        var postGO = new GameObject("PostManager");
        var post = postGO.AddComponent<PostManager>();
        post.Api = api;

        var chatGO = new GameObject("ChatManager");
        var chat = chatGO.AddComponent<ChatManager>();
        chat.Api = api;

        var lobbyUIGO = new GameObject("LobbyChatUI");
        var lobbyUI = lobbyUIGO.AddComponent<LobbyChatUI>();
        lobbyUI.Chat = chat;

        // Common font
        Font defaultFont = Resources.GetBuiltinResource<Font>("Arial.ttf");

        // Helper functions
        RectTransform Panel(string name, Vector2 anchorMin, Vector2 anchorMax)
        {
            var go = new GameObject(name, typeof(RectTransform), typeof(Image));
            go.transform.SetParent(root, false);
            var rt = go.GetComponent<RectTransform>();
            rt.anchorMin = anchorMin; rt.anchorMax = anchorMax;
            rt.offsetMin = Vector2.zero; rt.offsetMax = Vector2.zero;
            go.GetComponent<Image>().color = new Color(0,0,0,0.25f);
            return rt;
        }

        Text Label(string text, Transform parent, Vector2 pos)
        {
            var go = new GameObject("Label", typeof(Text));
            go.transform.SetParent(parent, false);
            var t = go.GetComponent<Text>();
            t.text = text; t.font = defaultFont; t.color = Color.white; t.alignment = TextAnchor.MiddleLeft;
            var rt = t.GetComponent<RectTransform>();
            rt.sizeDelta = new Vector2(200, 24); rt.anchoredPosition = pos;
            return t;
        }

        InputField Field(Transform parent, Vector2 pos, string placeholder)
        {
            var go = new GameObject("InputField", typeof(RectTransform), typeof(Image));
            go.transform.SetParent(parent, false);
            var img = go.GetComponent<Image>(); img.color = Color.white;
            var rt = go.GetComponent<RectTransform>(); rt.sizeDelta = new Vector2(250, 28); rt.anchoredPosition = pos;

            var tfGO = new GameObject("Text", typeof(Text)); tfGO.transform.SetParent(go.transform, false);
            var tf = tfGO.GetComponent<Text>(); tf.font = defaultFont; tf.color = Color.black; tf.alignment = TextAnchor.MiddleLeft;
            var tfRT = tf.GetComponent<RectTransform>(); tfRT.anchorMin = Vector2.zero; tfRT.anchorMax = Vector2.one; tfRT.offsetMin = new Vector2(10, 6); tfRT.offsetMax = new Vector2(-10, -6);

            var phGO = new GameObject("Placeholder", typeof(Text)); phGO.transform.SetParent(go.transform, false);
            var ph = phGO.GetComponent<Text>(); ph.text = placeholder; ph.font = defaultFont; ph.color = new Color(0,0,0,0.5f); ph.alignment = TextAnchor.MiddleLeft;
            var phRT = ph.GetComponent<RectTransform>(); phRT.anchorMin = Vector2.zero; phRT.anchorMax = Vector2.one; phRT.offsetMin = new Vector2(10, 6); phRT.offsetMax = new Vector2(-10, -6);

            var input = go.AddComponent<InputField>();
            input.textComponent = tf; input.placeholder = ph;
            return input;
        }

        Button Btn(Transform parent, Vector2 pos, string text)
        {
            var go = new GameObject("Button", typeof(RectTransform), typeof(Image), typeof(Button));
            go.transform.SetParent(parent, false);
            var rt = go.GetComponent<RectTransform>(); rt.sizeDelta = new Vector2(140, 30); rt.anchoredPosition = pos;
            go.GetComponent<Image>().color = new Color(0.2f,0.5f,0.8f,1f);
            var label = new GameObject("Text", typeof(Text)); label.transform.SetParent(go.transform, false);
            var t = label.GetComponent<Text>(); t.text = text; t.font = defaultFont; t.color = Color.white; t.alignment = TextAnchor.MiddleCenter;
            var tRT = t.GetComponent<RectTransform>(); tRT.anchorMin = Vector2.zero; tRT.anchorMax = Vector2.one; tRT.offsetMin = Vector2.zero; tRT.offsetMax = Vector2.zero;
            return go.GetComponent<Button>();
        }

        Text Status(Transform parent, Vector2 pos)
        {
            var go = new GameObject("Status", typeof(Text));
            go.transform.SetParent(parent, false);
            var t = go.GetComponent<Text>(); t.font = defaultFont; t.color = Color.yellow; t.alignment = TextAnchor.MiddleLeft;
            var rt = t.GetComponent<RectTransform>(); rt.sizeDelta = new Vector2(400, 24); rt.anchoredPosition = pos;
            return t;
        }

        // Panels
        var pProfile = Panel("ProfilePanel", new Vector2(0.05f, 0.60f), new Vector2(0.45f, 0.95f));
        var pPost = Panel("PostPanel", new Vector2(0.05f, 0.20f), new Vector2(0.45f, 0.55f));
        var pChat = Panel("LobbyChatPanel", new Vector2(0.50f, 0.55f), new Vector2(0.95f, 0.95f));
        var pFollowers = Panel("FollowersPanel", new Vector2(0.50f, 0.20f), new Vector2(0.95f, 0.50f));
        var pDM = Panel("DMPanel", new Vector2(0.05f, 0.05f), new Vector2(0.45f, 0.15f));
        var pUpload = Panel("UploadPanel", new Vector2(0.50f, 0.05f), new Vector2(0.95f, 0.15f));

        // Profile UI
        Label("Username", pProfile, new Vector2(10, -10));
        var username = Field(pProfile, new Vector2(10, -40), "username");
        Label("Display Name", pProfile, new Vector2(10, -80));
        var displayName = Field(pProfile, new Vector2(10, -110), "display name");
        Label("Bio", pProfile, new Vector2(10, -150));
        var bio = Field(pProfile, new Vector2(10, -180), "bio");
        var loginBtn = Btn(pProfile, new Vector2(10, -220), "Login");
        var updateBtn = Btn(pProfile, new Vector2(160, -220), "Update Profile");
        var statusProfile = Status(pProfile, new Vector2(10, -260));
        profile.UsernameInput = username;
        profile.DisplayNameInput = displayName;
        profile.BioInput = bio;
        profile.StatusText = statusProfile;
        UnityEventTools.AddPersistentListener(loginBtn.onClick, profile.LoginAndSetup);
        UnityEventTools.AddPersistentListener(updateBtn.onClick, profile.UpdateProfile);

        // Post UI
        Label("Post Content", pPost, new Vector2(10, -10));
        var postContent = Field(pPost, new Vector2(10, -40), "what's on your mind?");
        var createPostBtn = Btn(pPost, new Vector2(10, -80), "Create Post");
        var refreshFeedBtn = Btn(pPost, new Vector2(160, -80), "Refresh Feed");
        var feedText = Label("Feed", pPost, new Vector2(10, -120));
        feedText.alignment = TextAnchor.UpperLeft; feedText.color = Color.white;
        var statusPost = Status(pPost, new Vector2(10, -300));
        post.ContentInput = postContent;
        post.FeedText = feedText;
        post.StatusText = statusPost;
        UnityEventTools.AddPersistentListener(createPostBtn.onClick, post.CreatePost);
        UnityEventTools.AddPersistentListener(refreshFeedBtn.onClick, post.RefreshFeed);

        // Chat UI (Lobby)
        Label("Lobby Chat", pChat, new Vector2(10, -10));
        var chatConnectBtn = Btn(pChat, new Vector2(10, -40), "Connect Lobby");
        var chatMsg = Field(pChat, new Vector2(10, -80), "message...");
        var chatSendBtn = Btn(pChat, new Vector2(270, -80), "Send");
        var chatLog = Label("Messages will appear here...", pChat, new Vector2(10, -120));
        chatLog.alignment = TextAnchor.UpperLeft; chatLog.color = Color.white;
        var statusChat = Status(pChat, new Vector2(10, -300));
        lobbyUI.MessageInput = chatMsg;
        lobbyUI.ChatLog = chatLog;
        lobbyUI.StatusText = statusChat;
        UnityEventTools.AddPersistentListener(chatConnectBtn.onClick, lobbyUI.ConnectLobby);
        UnityEventTools.AddPersistentListener(chatSendBtn.onClick, lobbyUI.SendMessage);

        // Followers UI
        var followersGO = new GameObject("FollowersUI");
        var followersUI = followersGO.AddComponent<FollowersUI>();
        followersUI.Api = api;
        Label("Target User ID", pFollowers, new Vector2(10, -10));
        var targetId = Field(pFollowers, new Vector2(10, -40), "user id to follow");
        var followBtn = Btn(pFollowers, new Vector2(10, -80), "Follow");
        var unfollowBtn = Btn(pFollowers, new Vector2(160, -80), "Unfollow");
        var loadFollowersBtn = Btn(pFollowers, new Vector2(10, -120), "Load Followers");
        var loadFollowingBtn = Btn(pFollowers, new Vector2(160, -120), "Load Following");
        var followersOut = Label("Followers/Following JSON", pFollowers, new Vector2(10, -160));
        followersOut.alignment = TextAnchor.UpperLeft; followersOut.color = Color.white;
        var statusFollowers = Status(pFollowers, new Vector2(10, -300));
        followersUI.TargetUserIdInput = targetId;
        followersUI.OutputText = followersOut;
        followersUI.StatusText = statusFollowers;
        UnityEventTools.AddPersistentListener(followBtn.onClick, followersUI.Follow);
        UnityEventTools.AddPersistentListener(unfollowBtn.onClick, followersUI.Unfollow);
        UnityEventTools.AddPersistentListener(loadFollowersBtn.onClick, followersUI.LoadFollowers);
        UnityEventTools.AddPersistentListener(loadFollowingBtn.onClick, followersUI.LoadFollowing);

        // DM UI
        var dmGO = new GameObject("DMChatUI");
        var dmUI = dmGO.AddComponent<DMChatUI>();
        dmUI.Chat = chat;
        Label("DM Peer User ID", pDM, new Vector2(10, -10));
        var dmPeer = Field(pDM, new Vector2(10, -40), "peer user id");
        var dmConnectBtn = Btn(pDM, new Vector2(270, -40), "Connect DM");
        var dmMsg = Field(pDM, new Vector2(10, -80), "message...");
        var dmSendBtn = Btn(pDM, new Vector2(270, -80), "Send");
        var dmLog = Label("DM messages here...", pDM, new Vector2(10, -120));
        dmLog.alignment = TextAnchor.UpperLeft; dmLog.color = Color.white;
        var dmStatus = Status(pDM, new Vector2(10, -150));
        dmUI.PeerUserIdInput = dmPeer;
        dmUI.MessageInput = dmMsg;
        dmUI.ChatLog = dmLog;
        dmUI.StatusText = dmStatus;
        UnityEventTools.AddPersistentListener(dmConnectBtn.onClick, dmUI.ConnectDM);
        UnityEventTools.AddPersistentListener(dmSendBtn.onClick, dmUI.SendMessage);

        // Upload UI
        var uploadGO = new GameObject("UploadUI");
        var uploadUI = uploadGO.AddComponent<UploadUI>();
        uploadUI.Api = api;
        Label("Upload Sample Image", pUpload, new Vector2(10, -10));
        var uploadBtn = Btn(pUpload, new Vector2(10, -40), "Upload");
        var uploadUrl = Label("URL will appear here", pUpload, new Vector2(160, -40));
        uploadUrl.alignment = TextAnchor.MiddleLeft; uploadUrl.color = Color.white;
        var uploadStatus = Status(pUpload, new Vector2(10, -70));
        uploadUI.UrlText = uploadUrl;
        uploadUI.StatusText = uploadStatus;
        UnityEventTools.AddPersistentListener(uploadBtn.onClick, uploadUI.UploadSample);

        // Arrange manager objects in hierarchy for clarity
        apiGO.transform.SetParent(root, false);
        profileGO.transform.SetParent(root, false);
        postGO.transform.SetParent(root, false);
        chatGO.transform.SetParent(root, false);
        lobbyUIGO.transform.SetParent(root, false);
        followersGO.transform.SetParent(root, false);
        dmGO.transform.SetParent(root, false);
        uploadGO.transform.SetParent(root, false);

        // Save scene
        var path = "Assets/Scenes";
        if (!System.IO.Directory.Exists(path)) System.IO.Directory.CreateDirectory(path);
        var scenePath = path + "/SocialDemo.unity";
        EditorSceneManager.SaveScene(scene, scenePath);
        EditorUtility.DisplayDialog("Social Demo", "Scene created at " + scenePath, "OK");
    }
}
#endif