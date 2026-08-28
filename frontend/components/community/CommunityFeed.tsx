"use client";

import { useEffect, useState } from "react";
import { Card } from "@/frontend/components/ui/Card";
import { Badge } from "@/frontend/components/ui/badge";
import { Button } from "@/frontend/components/ui/Button";
import { Textarea } from "@/frontend/components/ui/Input";

type Reply = { reply: { id: string; content: string; createdAt: string }; authorName: string };
type Post = { post: { id: string; content: string; createdAt: string }; authorName: string; replies: Reply[] };

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export function CommunityFeed({ domain }: { domain: string }) {
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [joined, setJoined] = useState(false);
  const [memberCount, setMemberCount] = useState(0);
  const [joining, setJoining] = useState(false);
  const [draft, setDraft] = useState("");
  const [posting, setPosting] = useState(false);
  const [openReplyFor, setOpenReplyFor] = useState<string | null>(null);
  const [replyDraft, setReplyDraft] = useState("");
  const [replying, setReplying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const res = await fetch(`/api/community/${domain}`);
    const body = await res.json();
    if (res.ok) {
      setPosts(body.posts);
      setJoined(body.joined);
      setMemberCount(body.memberCount);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data fetch on mount
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [domain]);

  async function join() {
    setJoining(true);
    try {
      await fetch(`/api/community/${domain}/join`, { method: "POST" });
      await load();
    } finally {
      setJoining(false);
    }
  }

  async function submitPost() {
    if (!draft.trim()) return;
    setPosting(true);
    setError(null);
    try {
      const res = await fetch(`/api/community/${domain}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: draft }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error);
      setDraft("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setPosting(false);
    }
  }

  async function submitReply(postId: string) {
    if (!replyDraft.trim()) return;
    setReplying(true);
    setError(null);
    try {
      const res = await fetch(`/api/community/posts/${postId}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: replyDraft }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error);
      setReplyDraft("");
      setOpenReplyFor(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setReplying(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card className="flex flex-wrap items-center justify-between gap-3 p-4">
        <Badge>
          {memberCount} member{memberCount === 1 ? "" : "s"}
        </Badge>
        {joined ? (
          <Badge tone="success">You&apos;re a member</Badge>
        ) : (
          <Button size="sm" disabled={joining} onClick={join}>
            {joining ? "Joining..." : "Join community"}
          </Button>
        )}
      </Card>

      {error && <p className="text-sm text-danger">{error}</p>}

      <Card className="p-4">
        {joined ? (
          <>
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={3}
              placeholder="Ask a question, share what you're working on..."
            />
            <div className="mt-2 flex justify-end">
              <Button size="sm" disabled={posting || !draft.trim()} onClick={submitPost}>
                {posting ? "Posting..." : "Post"}
              </Button>
            </div>
          </>
        ) : (
          <p className="text-sm text-muted">Join this community to post and reply.</p>
        )}
      </Card>

      {!posts ? (
        <p className="text-sm text-muted">Loading discussion...</p>
      ) : posts.length === 0 ? (
        <p className="text-sm text-muted">No posts yet - be the first to say something.</p>
      ) : (
        <div className="space-y-3">
          {posts.map(({ post, authorName, replies }) => (
            <Card key={post.id} className="p-4">
              <div className="mb-1 flex items-center gap-2 text-xs text-muted">
                <span className="font-medium text-foreground">{authorName}</span>
                <span>·</span>
                <span>{formatTime(post.createdAt)}</span>
              </div>
              <p className="whitespace-pre-wrap text-sm">{post.content}</p>

              {replies.length > 0 && (
                <div className="mt-3 space-y-2 border-l-2 border-border pl-3">
                  {replies.map(({ reply, authorName: replyAuthor }) => (
                    <div key={reply.id}>
                      <div className="mb-0.5 flex items-center gap-2 text-xs text-muted">
                        <span className="font-medium text-foreground">{replyAuthor}</span>
                        <span>·</span>
                        <span>{formatTime(reply.createdAt)}</span>
                      </div>
                      <p className="whitespace-pre-wrap text-sm text-foreground/85">{reply.content}</p>
                    </div>
                  ))}
                </div>
              )}

              {joined && (
                <div className="mt-3">
                  {openReplyFor === post.id ? (
                    <div className="space-y-2">
                      <Textarea
                        value={replyDraft}
                        onChange={(e) => setReplyDraft(e.target.value)}
                        rows={2}
                        placeholder="Write a reply..."
                      />
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="secondary" onClick={() => setOpenReplyFor(null)}>
                          Cancel
                        </Button>
                        <Button size="sm" disabled={replying || !replyDraft.trim()} onClick={() => submitReply(post.id)}>
                          {replying ? "Replying..." : "Reply"}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setOpenReplyFor(post.id);
                        setReplyDraft("");
                      }}
                      className="text-xs font-medium text-accent hover:underline"
                    >
                      Reply
                    </button>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
