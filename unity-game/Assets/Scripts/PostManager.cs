using System;
using System.Collections;
using UnityEngine;
using UnityEngine.UI;

public class PostManager : MonoBehaviour
{
    public SocialAPI Api;
    public InputField ContentInput;
    public Text FeedText;
    public Text StatusText;

    public void CreatePost()
    {
        StartCoroutine(Api.CreatePost(ContentInput.text, null, null,
            (ok) => { StatusText.text = "Post created"; RefreshFeed(); },
            (err) => { StatusText.text = "Post error: " + err; }));
    }

    public void RefreshFeed()
    {
        StartCoroutine(Api.GetFeed(
            (data) => { FeedText.text = data; },
            (err) => { StatusText.text = "Feed error: " + err; }));
    }

    public void LikeFirst(string postId)
    {
        StartCoroutine(Api.LikePost(postId,
            (ok) => { StatusText.text = "Liked"; },
            (err) => { StatusText.text = "Like error: " + err; }));
    }

    public void CommentFirst(string postId, string content)
    {
        StartCoroutine(Api.CommentPost(postId, content,
            (ok) => { StatusText.text = "Commented"; },
            (err) => { StatusText.text = "Comment error: " + err; }));
    }
}