using UnityEngine;
using UnityEngine.UI;

public class FollowersUI : MonoBehaviour
{
    public SocialAPI Api;
    public InputField TargetUserIdInput;
    public Text OutputText;
    public Text StatusText;

    public void Follow()
    {
        var target = TargetUserIdInput != null ? TargetUserIdInput.text : null;
        if (string.IsNullOrEmpty(target)) { StatusText.text = "Enter target user id"; return; }
        StartCoroutine(Api.FollowUser(target, (ok) => { StatusText.text = "Following"; }, (err) => { StatusText.text = "Error: " + err; }));
    }

    public void Unfollow()
    {
        var target = TargetUserIdInput != null ? TargetUserIdInput.text : null;
        if (string.IsNullOrEmpty(target)) { StatusText.text = "Enter target user id"; return; }
        StartCoroutine(Api.UnfollowUser(target, (ok) => { StatusText.text = "Unfollowed"; }, (err) => { StatusText.text = "Error: " + err; }));
    }

    public void LoadFollowers()
    {
        var myId = Api != null ? Api.UserId : null;
        if (string.IsNullOrEmpty(myId)) { StatusText.text = "Login first"; return; }
        StartCoroutine(Api.ListFollowers(myId, (txt) => { OutputText.text = txt; StatusText.text = "Loaded followers"; }, (err) => { StatusText.text = "Error: " + err; }));
    }

    public void LoadFollowing()
    {
        var myId = Api != null ? Api.UserId : null;
        if (string.IsNullOrEmpty(myId)) { StatusText.text = "Login first"; return; }
        StartCoroutine(Api.ListFollowing(myId, (txt) => { OutputText.text = txt; StatusText.text = "Loaded following"; }, (err) => { StatusText.text = "Error: " + err; }));
    }
}