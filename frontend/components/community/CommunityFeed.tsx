"use client";

import { useEffect, useState } from "react";
import { Card } from "@/frontend/components/ui/Card";
import { Badge } from "@/frontend/components/ui/badge";
import { Button } from "@/frontend/components/ui/Button";
import { Textarea } from "@/frontend/components/ui/Input";
import {
  IconMessage,
  IconArrowRight,
  IconCheck,
  IconUsers,
  IconMessages,
} from "@tabler/icons-react";

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
    load();
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
      setError(err instanceof Error ? err.message : "Something went wrong posting message");
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
      setError(err instanceof Error ? err.message : "Something went wrong sending reply");
    } finally {
      setReplying(false);
    }
  }

  return (
    <div className="space-y-5">
      
      {/* Guild Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-purple-500/30 bg-[#0c1026]/90 p-4 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <Badge tone="cyan" className="flex items-center gap-1">
            <IconUsers className="h-3.5 w-3.5" />
            <span>{memberCount} Enrolled Members</span>
          </Badge>
        </div>
        {joined ? (
          <Badge tone="success" className="flex items-center gap-1">
            <IconCheck className="h-3.5 w-3.5" />
            <span>Community Member</span>
          </Badge>
        ) : (
          <Button size="sm" variant="primary" disabled={joining} onClick={join}>
            <span>{joining ? "Joining..." : "Join Community"}</span>
            <IconArrowRight className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/40 bg-red-950/60 p-3 text-xs font-bold text-red-300">
          {error}
        </div>
      )}

      {/* Post Compose Box */}
      <Card className="p-5">
        {joined ? (
          <>
            <h3 className="mb-2 text-xs font-bold text-slate-200 uppercase tracking-wider">Start a Discussion</h3>
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={3}
              placeholder="Ask a question, share a breakthrough, or discuss concepts with peers..."
              className="text-xs"
            />
            <div className="mt-3 flex justify-end">
              <Button size="md" disabled={posting || !draft.trim()} onClick={submitPost}>
                <span>{posting ? "Posting..." : "Publish Post"}</span>
                <IconArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </>
        ) : (
          <p className="text-xs text-slate-400">Join this community above to publish discussions and reply to peers.</p>
        )}
      </Card>

      {/* Posts Feed */}
      {!posts ? (
        <div className="py-12 text-center text-slate-400">
          <div className="flex items-center justify-center gap-2 text-purple-400 text-xs font-bold">
            <span className="h-2 w-2 rounded-full bg-purple-400 animate-ping" />
            <span>Loading Community Discussions...</span>
          </div>
        </div>
      ) : posts.length === 0 ? (
        <Card className="p-8 text-center">
          <IconMessages className="h-10 w-10 text-purple-400 mx-auto mb-2" />
          <p className="mt-2 text-xs text-slate-400">No discussions posted in this community yet — be the first to start a conversation.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts.map(({ post, authorName, replies }) => (
            <div
              key={post.id}
              className="rounded-3xl border border-purple-500/20 bg-[#0d1226]/80 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.4)] backdrop-blur-xl transition-all hover:border-purple-500/40"
            >
              <div className="mb-2 flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-purple-950 border border-purple-500/30 text-xs font-bold text-purple-300">
                  {authorName[0]?.toUpperCase() || "A"}
                </div>
                <div>
                  <span className="text-xs font-bold text-white">{authorName}</span>
                  <span className="text-[10px] text-slate-500 ml-2">{formatTime(post.createdAt)}</span>
                </div>
              </div>

              <p className="whitespace-pre-wrap text-xs text-slate-200 leading-relaxed pl-9">{post.content}</p>

              {/* Replies */}
              {replies.length > 0 && (
                <div className="mt-4 space-y-2.5 border-l-2 border-purple-500/30 pl-4 ml-4">
                  {replies.map(({ reply, authorName: replyAuthor }) => (
                    <div key={reply.id} className="rounded-xl border border-purple-500/15 bg-[#070918]/70 p-3">
                      <div className="mb-1 flex items-center gap-2">
                        <span className="text-xs font-bold text-purple-300">{replyAuthor}</span>
                        <span className="text-[9px] text-slate-500">{formatTime(reply.createdAt)}</span>
                      </div>
                      <p className="whitespace-pre-wrap text-xs text-slate-300 leading-snug">{reply.content}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Reply Button / Box */}
              {joined && (
                <div className="mt-4 pl-9">
                  {openReplyFor === post.id ? (
                    <div className="space-y-2">
                      <Textarea
                        value={replyDraft}
                        onChange={(e) => setReplyDraft(e.target.value)}
                        rows={2}
                        placeholder="Write a reply..."
                        className="text-xs"
                      />
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="secondary" onClick={() => setOpenReplyFor(null)}>
                          Cancel
                        </Button>
                        <Button size="sm" disabled={replying || !replyDraft.trim()} onClick={() => submitReply(post.id)}>
                          <span>{replying ? "Sending..." : "Reply"}</span>
                          <IconArrowRight className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setOpenReplyFor(post.id);
                        setReplyDraft("");
                      }}
                      className="text-xs font-bold text-purple-400 hover:text-purple-300 hover:underline flex items-center gap-1.5"
                    >
                      <IconMessage className="h-3.5 w-3.5" />
                      <span>Reply</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
