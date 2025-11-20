using System;
using System.Collections;
using System.Text;
using UnityEngine;
using UnityEngine.Networking;

public class SocialAPI : MonoBehaviour
{
    [Header("Backend Settings")]
    public string BaseUrl = "http://localhost:4000";
    [NonSerialized] public string Token = null;
    [NonSerialized] public string UserId = null;

    public IEnumerator Login(string username, Action<string> onToken, Action<string> onError)
    {
        var url = BaseUrl + "/auth/login";
        var body = JsonUtility.ToJson(new LoginBody { username = username });
        var req = new UnityWebRequest(url, "POST");
        byte[] payload = Encoding.UTF8.GetBytes(body);
        req.uploadHandler = new UploadHandlerRaw(payload);
        req.downloadHandler = new DownloadHandlerBuffer();
        req.SetRequestHeader("Content-Type", "application/json");
        yield return req.SendWebRequest();
        if (req.result != UnityWebRequest.Result.Success)
        {
            onError?.Invoke(req.error);
            yield break;
        }
        var resp = JsonUtility.FromJson<LoginResp>(req.downloadHandler.text);
        Token = resp.token;
        UserId = resp.user != null ? resp.user.id : null;
        onToken?.Invoke(resp.token);
    }

    public IEnumerator UpdateProfile(string displayName, string bio, string avatarUrl, Action<string> onOk, Action<string> onError)
    {
        var url = BaseUrl + "/profile/update";
        var body = JsonUtility.ToJson(new ProfileBody { display_name = displayName, bio = bio, avatar_url = avatarUrl });
        var req = new UnityWebRequest(url, "POST");
        byte[] payload = Encoding.UTF8.GetBytes(body);
        req.uploadHandler = new UploadHandlerRaw(payload);
        req.downloadHandler = new DownloadHandlerBuffer();
        req.SetRequestHeader("Content-Type", "application/json");
        if (!string.IsNullOrEmpty(Token)) req.SetRequestHeader("Authorization", "Bearer " + Token);
        yield return req.SendWebRequest();
        if (req.result != UnityWebRequest.Result.Success)
        {
            onError?.Invoke(req.error);
            yield break;
        }
        onOk?.Invoke(req.downloadHandler.text);
    }

    public IEnumerator CreatePost(string content, string imageUrl, string videoUrl, Action<string> onOk, Action<string> onError)
    {
        var url = BaseUrl + "/post";
        var body = JsonUtility.ToJson(new PostBody { content = content, image_url = imageUrl, video_url = videoUrl });
        var req = new UnityWebRequest(url, "POST");
        byte[] payload = Encoding.UTF8.GetBytes(body);
        req.uploadHandler = new UploadHandlerRaw(payload);
        req.downloadHandler = new DownloadHandlerBuffer();
        req.SetRequestHeader("Content-Type", "application/json");
        if (!string.IsNullOrEmpty(Token)) req.SetRequestHeader("Authorization", "Bearer " + Token);
        yield return req.SendWebRequest();
        if (req.result != UnityWebRequest.Result.Success)
        {
            onError?.Invoke(req.error);
            yield break;
        }
        onOk?.Invoke(req.downloadHandler.text);
    }

    public IEnumerator GetFeed(Action<string> onOk, Action<string> onError)
    {
        var url = BaseUrl + "/feed";
        var req = new UnityWebRequest(url, "GET");
        req.downloadHandler = new DownloadHandlerBuffer();
        if (!string.IsNullOrEmpty(Token)) req.SetRequestHeader("Authorization", "Bearer " + Token);
        yield return req.SendWebRequest();
        if (req.result != UnityWebRequest.Result.Success)
        {
            onError?.Invoke(req.error);
            yield break;
        }
        onOk?.Invoke(req.downloadHandler.text);
    }

    public IEnumerator LikePost(string postId, Action<string> onOk, Action<string> onError)
    {
        var url = BaseUrl + "/post/" + postId + "/like";
        var req = new UnityWebRequest(url, "POST");
        req.uploadHandler = new UploadHandlerRaw(Encoding.UTF8.GetBytes("{}"));
        req.downloadHandler = new DownloadHandlerBuffer();
        req.SetRequestHeader("Content-Type", "application/json");
        if (!string.IsNullOrEmpty(Token)) req.SetRequestHeader("Authorization", "Bearer " + Token);
        yield return req.SendWebRequest();
        if (req.result != UnityWebRequest.Result.Success)
        {
            onError?.Invoke(req.error);
            yield break;
        }
        onOk?.Invoke(req.downloadHandler.text);
    }

    public IEnumerator CommentPost(string postId, string content, Action<string> onOk, Action<string> onError)
    {
        var url = BaseUrl + "/post/" + postId + "/comment";
        var body = JsonUtility.ToJson(new CommentBody { content = content });
        var req = new UnityWebRequest(url, "POST");
        req.uploadHandler = new UploadHandlerRaw(Encoding.UTF8.GetBytes(body));
        req.downloadHandler = new DownloadHandlerBuffer();
        req.SetRequestHeader("Content-Type", "application/json");
        if (!string.IsNullOrEmpty(Token)) req.SetRequestHeader("Authorization", "Bearer " + Token);
        yield return req.SendWebRequest();
        if (req.result != UnityWebRequest.Result.Success)
        {
            onError?.Invoke(req.error);
            yield break;
        }
        onOk?.Invoke(req.downloadHandler.text);
    }

    [Serializable]
    private class LoginBody { public string username; }
    [Serializable]
    private class LoginResp { public string token; public UserResp user; }
    [Serializable]
    private class UserResp { public string id; }
    [Serializable]
    private class ProfileBody { public string display_name; public string bio; public string avatar_url; }
    [Serializable]
    private class PostBody { public string content; public string image_url; public string video_url; }
    [Serializable]
    private class CommentBody { public string content; }

    // Followers
    public IEnumerator FollowUser(string targetUserId, Action<string> onOk, Action<string> onError)
    {
        var url = BaseUrl + "/follow";
        var body = JsonUtility.ToJson(new FollowBody { userId = targetUserId });
        var req = new UnityWebRequest(url, "POST");
        req.uploadHandler = new UploadHandlerRaw(Encoding.UTF8.GetBytes(body));
        req.downloadHandler = new DownloadHandlerBuffer();
        req.SetRequestHeader("Content-Type", "application/json");
        if (!string.IsNullOrEmpty(Token)) req.SetRequestHeader("Authorization", "Bearer " + Token);
        yield return req.SendWebRequest();
        if (req.result != UnityWebRequest.Result.Success) { onError?.Invoke(req.error); yield break; }
        onOk?.Invoke(req.downloadHandler.text);
    }

    public IEnumerator UnfollowUser(string targetUserId, Action<string> onOk, Action<string> onError)
    {
        var url = BaseUrl + "/unfollow";
        var body = JsonUtility.ToJson(new FollowBody { userId = targetUserId });
        var req = new UnityWebRequest(url, "POST");
        req.uploadHandler = new UploadHandlerRaw(Encoding.UTF8.GetBytes(body));
        req.downloadHandler = new DownloadHandlerBuffer();
        req.SetRequestHeader("Content-Type", "application/json");
        if (!string.IsNullOrEmpty(Token)) req.SetRequestHeader("Authorization", "Bearer " + Token);
        yield return req.SendWebRequest();
        if (req.result != UnityWebRequest.Result.Success) { onError?.Invoke(req.error); yield break; }
        onOk?.Invoke(req.downloadHandler.text);
    }

    public IEnumerator ListFollowers(string userId, Action<string> onOk, Action<string> onError)
    {
        var url = BaseUrl + "/followers/" + userId;
        var req = new UnityWebRequest(url, "GET");
        req.downloadHandler = new DownloadHandlerBuffer();
        if (!string.IsNullOrEmpty(Token)) req.SetRequestHeader("Authorization", "Bearer " + Token);
        yield return req.SendWebRequest();
        if (req.result != UnityWebRequest.Result.Success) { onError?.Invoke(req.error); yield break; }
        onOk?.Invoke(req.downloadHandler.text);
    }

    public IEnumerator ListFollowing(string userId, Action<string> onOk, Action<string> onError)
    {
        var url = BaseUrl + "/following/" + userId;
        var req = new UnityWebRequest(url, "GET");
        req.downloadHandler = new DownloadHandlerBuffer();
        if (!string.IsNullOrEmpty(Token)) req.SetRequestHeader("Authorization", "Bearer " + Token);
        yield return req.SendWebRequest();
        if (req.result != UnityWebRequest.Result.Success) { onError?.Invoke(req.error); yield break; }
        onOk?.Invoke(req.downloadHandler.text);
    }

    [Serializable]
    private class FollowBody { public string userId; }

    // Uploads
    public IEnumerator UploadBytes(string filename, byte[] data, Action<string> onOk, Action<string> onError)
    {
        var url = BaseUrl + "/upload";
        var form = new WWWForm();
        form.AddBinaryData("file", data, filename, "image/png");
        var req = UnityWebRequest.Post(url, form);
        if (!string.IsNullOrEmpty(Token)) req.SetRequestHeader("Authorization", "Bearer " + Token);
        yield return req.SendWebRequest();
        if (req.result != UnityWebRequest.Result.Success) { onError?.Invoke(req.error); yield break; }
        onOk?.Invoke(req.downloadHandler.text);
    }
}